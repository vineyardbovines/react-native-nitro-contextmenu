package com.margelo.nitro.nitrocontextmenu

import android.content.Context
import android.content.Intent
import android.graphics.drawable.Drawable
import android.os.Build
import android.util.Log
import android.view.GestureDetector
import android.view.Menu
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.PopupMenu
import androidx.annotation.Keep
import androidx.core.content.ContextCompat
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.uimanager.ThemedReactContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * A FrameLayout that intercepts touch events for gesture detection
 * while still allowing children to render normally.
 */
private class InterceptingFrameLayout(context: Context) : FrameLayout(context) {
    var onTap: (() -> Unit)? = null
    var onLongPress: (() -> Unit)? = null

    private val gestureDetector = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
        override fun onSingleTapUp(e: MotionEvent): Boolean {
            onTap?.invoke()
            return onTap != null
        }
        override fun onLongPress(e: MotionEvent) {
            onLongPress?.invoke()
        }
    })

    override fun onInterceptTouchEvent(ev: MotionEvent): Boolean {
        gestureDetector.onTouchEvent(ev)
        // Don't intercept — let children handle the touch too
        return false
    }

    override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
        // Feed all touches to the gesture detector regardless of children
        gestureDetector.onTouchEvent(ev)
        return super.dispatchTouchEvent(ev)
    }
}

@DoNotStrip
@Keep
class HybridContextMenuView(
    private val reactContext: ThemedReactContext? = null
) : HybridContextMenuViewSpec() {

    // -- View --
    private val containerView: InterceptingFrameLayout = InterceptingFrameLayout(
        reactContext ?: throw IllegalStateException("ThemedReactContext is required")
    )
    override val view: View get() = containerView

    // -- Props --
    override var menuConfigJson: String = "{}"
        set(value) {
            field = value
            onConfigChanged()
        }

    override var previewConfigJson: String = "{}"
        // iOS-only; stored but unused on Android

    override var onPressAction: (actionKey: String) -> Unit = {}
    override var onMenuWillShow: () -> Unit = {}
    override var onMenuWillHide: () -> Unit = {}
    override var onPreviewPress: () -> Unit = {}

    // -- Internal state --
    private var trigger: String = "tap"
    private var currentPopup: PopupMenu? = null
    private var menuItemIdCounter = 0

    init {
        // Default trigger is "tap"
        setupTapListener()
    }

    // ---- Config change handling ----

    private fun onConfigChanged() {
        val newTrigger = parseTrigger(menuConfigJson)
        if (newTrigger != trigger) {
            trigger = newTrigger
            if (trigger == "tap") {
                setupTapListener()
            } else {
                setupLongPressListener()
            }
        }
    }

    private fun setupLongPressListener() {
        containerView.onTap = null
        containerView.onLongPress = { showPopupMenu(containerView) }
    }

    private fun setupTapListener() {
        containerView.onLongPress = null
        containerView.onTap = { showPopupMenu(containerView) }
    }

    // ---- PopupMenu construction ----

    private fun showPopupMenu(anchor: View) {
        currentPopup?.dismiss()
        menuItemIdCounter = 0

        val json = try { JSONObject(menuConfigJson) } catch (e: Exception) {
            Log.w(TAG, "Failed to parse menuConfigJson", e)
            return
        }
        val context = anchor.context ?: return

        val popup = PopupMenu(context, anchor)
        val groupIdCounter = intArrayOf(0)

        // Tabs: flatten first tab's items (same as iOS < 16 fallback)
        val tabsArray = json.optJSONArray("tabs")
        val items = if (tabsArray != null && tabsArray.length() > 0) {
            tabsArray.getJSONObject(0).optJSONArray("items") ?: JSONArray()
        } else {
            json.optJSONArray("items") ?: JSONArray()
        }

        buildMenuItems(popup.menu, items, groupIdCounter)
        forceShowIcons(popup)

        popup.setOnMenuItemClickListener { menuItem ->
            val actionKey = menuItem.intent?.getStringExtra(EXTRA_ACTION_KEY)
            if (actionKey != null) {
                onPressAction(actionKey)
            }
            true
        }

        popup.setOnDismissListener {
            onMenuWillHide()
            currentPopup = null
        }

        currentPopup = popup
        onMenuWillShow()
        popup.show()
    }

    // ---- Recursive menu builder ----

    private fun buildMenuItems(
        menu: Menu,
        items: JSONArray,
        groupIdCounter: IntArray
    ) {
        for (i in 0 until items.length()) {
            val element = items.optJSONObject(i) ?: continue

            // Skip hidden elements
            val attrs = element.optJSONArray("attributes")
            if (attrs != null && jsonArrayContains(attrs, "hidden")) continue

            if (element.has("items") || element.has("tabs")) {
                // Submenu or inline group
                addSubmenuOrInlineGroup(menu, element, groupIdCounter)
            } else if (element.has("actionKey")) {
                // Leaf action
                addAction(menu, element, groupIdCounter[0])
            }
        }
    }

    private fun addSubmenuOrInlineGroup(
        parentMenu: Menu,
        config: JSONObject,
        groupIdCounter: IntArray
    ) {
        val options = config.optJSONArray("options")
        val isInline = options != null && jsonArrayContains(options, "displayInline")
        val isSingleSelection = options != null && jsonArrayContains(options, "singleSelection")
        val childItems = config.optJSONArray("items") ?: JSONArray()

        if (isInline) {
            // Inline group: add items to parent with a unique group ID for separator
            val groupId = ++groupIdCounter[0]
            for (j in 0 until childItems.length()) {
                val child = childItems.optJSONObject(j) ?: continue
                val childAttrs = child.optJSONArray("attributes")
                if (childAttrs != null && jsonArrayContains(childAttrs, "hidden")) continue

                if (child.has("items")) {
                    addSubmenuOrInlineGroup(parentMenu, child, groupIdCounter)
                } else if (child.has("actionKey")) {
                    addAction(parentMenu, child, groupId)
                }
            }
            if (isSingleSelection) {
                parentMenu.setGroupCheckable(groupId, true, true)
            }
        } else {
            // Regular submenu
            val title = config.optString("title", "")
            val subMenu = parentMenu.addSubMenu(title)
            val subGroupIdCounter = intArrayOf(0)

            buildMenuItems(subMenu, childItems, subGroupIdCounter)

            if (isSingleSelection && subGroupIdCounter[0] >= 0) {
                for (g in 0..subGroupIdCounter[0]) {
                    subMenu.setGroupCheckable(g, true, true)
                }
            }

            // Icon on the submenu header item
            val imageObj = config.optJSONObject("image")
            if (imageObj != null) {
                val drawable = resolveImage(imageObj)
                if (drawable != null) {
                    subMenu.item?.icon = drawable
                }
            }
        }
    }

    private fun addAction(menu: Menu, action: JSONObject, groupId: Int) {
        val actionKey = action.optString("actionKey", "")
        val title = action.optString("title", "")
        val attributes = action.optJSONArray("attributes")

        val itemId = menuItemIdCounter++
        val menuItem = menu.add(groupId, itemId, Menu.NONE, title)

        // Store actionKey for click handler
        menuItem.intent = Intent().putExtra(EXTRA_ACTION_KEY, actionKey)

        // Disabled state
        if (attributes != null && jsonArrayContains(attributes, "disabled")) {
            menuItem.isEnabled = false
        }

        // Checked state
        val state = action.optString("state", "off")
        if (state == "on" || state == "mixed") {
            menuItem.isCheckable = true
            menuItem.isChecked = (state == "on")
        }

        // Icon
        val imageObj = action.optJSONObject("image")
        if (imageObj != null) {
            val drawable = resolveImage(imageObj)
            if (drawable != null) {
                // Tint destructive icons red
                val isDestructive = attributes != null && jsonArrayContains(attributes, "destructive")
                if (isDestructive) {
                    drawable.mutate().setTint(DESTRUCTIVE_RED)
                }
                menuItem.icon = drawable
            }
        }
    }

    // ---- Icon resolution ----

    private fun resolveImage(imageObj: JSONObject): Drawable? {
        val systemName = imageObj.optString("systemName", "")
        if (systemName.isEmpty()) return null

        val context = containerView.context ?: return null

        // Try mapped Android system drawable
        val androidResName = SF_SYMBOL_MAP[systemName]
        if (androidResName != null) {
            val resId = context.resources.getIdentifier(androidResName, "drawable", "android")
            if (resId != 0) {
                return ContextCompat.getDrawable(context, resId)?.mutate()
            }
        }

        // Fallback: app-local drawable with dots replaced by underscores
        val localName = systemName.replace(".", "_")
        val appResId = context.resources.getIdentifier(localName, "drawable", context.packageName)
        if (appResId != 0) {
            return ContextCompat.getDrawable(context, appResId)?.mutate()
        }

        return null
    }

    // ---- Force-show icons in PopupMenu ----

    private fun forceShowIcons(popup: PopupMenu) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            popup.setForceShowIcon(true)
        } else {
            try {
                val field = popup.javaClass.getDeclaredField("mPopup")
                field.isAccessible = true
                val helper = field.get(popup)
                val method = helper.javaClass.getDeclaredMethod(
                    "setForceShowIcon", Boolean::class.javaPrimitiveType
                )
                method.invoke(helper, true)
            } catch (e: Exception) {
                Log.w(TAG, "Could not force-show PopupMenu icons", e)
            }
        }
    }

    // ---- Helpers ----

    private fun parseTrigger(json: String): String {
        return try {
            JSONObject(json).optString("_trigger", "tap")
        } catch (e: Exception) {
            "tap"
        }
    }

    private fun jsonArrayContains(array: JSONArray, value: String): Boolean {
        for (i in 0 until array.length()) {
            if (array.optString(i) == value) return true
        }
        return false
    }

    companion object {
        private const val TAG = "HybridContextMenuView"
        private const val EXTRA_ACTION_KEY = "actionKey"
        private const val DESTRUCTIVE_RED = 0xFFFF3B30.toInt()

        /** Maps common SF Symbol names to Android framework drawables. */
        private val SF_SYMBOL_MAP: Map<String, String> = mapOf(
            "doc.on.doc" to "ic_menu_copy",
            "doc.on.clipboard" to "ic_menu_paste",
            "square.and.arrow.up" to "ic_menu_share",
            "trash" to "ic_menu_delete",
            "pencil" to "ic_menu_edit",
            "plus" to "ic_menu_add",
            "magnifyingglass" to "ic_menu_search",
            "gear" to "ic_menu_preferences",
            "info.circle" to "ic_menu_info_details",
            "arrow.up.arrow.down" to "ic_menu_sort_by_size",
            "photo" to "ic_menu_gallery",
            "video" to "ic_menu_camera",
            "calendar" to "ic_menu_today",
            "doc" to "ic_menu_agenda",
            "list.bullet" to "ic_menu_list",
            "archivebox" to "ic_menu_archive",
            "star" to "ic_menu_star",
            "star.fill" to "ic_menu_star",
        )
    }
}
