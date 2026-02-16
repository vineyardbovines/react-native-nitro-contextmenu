package com.margelo.nitro.nitroplatformcomponents

import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.facebook.react.uimanager.ReactStylesDiffMap
import com.facebook.react.uimanager.StateWrapper
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.margelo.nitro.R.id.associated_hybrid_view_tag
import com.margelo.nitro.nitroplatformcomponents.views.HybridContextMenuViewStateUpdater

/**
 * A ViewGroupManager for ContextMenuView that supports child views.
 *
 * The nitrogen-generated HybridContextMenuViewManager extends SimpleViewManager,
 * which does not implement IViewGroupManager. Since ContextMenuView wraps children,
 * Fabric's SurfaceMountingManager needs IViewGroupManager to call addView/removeView.
 * This custom manager extends ViewGroupManager to provide that support.
 */
class ContextMenuViewManager : ViewGroupManager<FrameLayout>() {

  override fun getName(): String = "ContextMenuView"

  override fun createViewInstance(reactContext: ThemedReactContext): FrameLayout {
    val hybridView = HybridContextMenuView(reactContext)
    val view = hybridView.view as FrameLayout
    view.setTag(associated_hybrid_view_tag, hybridView)
    return view
  }

  override fun updateState(
    view: FrameLayout,
    props: ReactStylesDiffMap,
    stateWrapper: StateWrapper
  ): Any? {
    val hybridView = view.getTag(associated_hybrid_view_tag) as? HybridContextMenuView
      ?: throw Error("Couldn't find HybridContextMenuView for $view")

    hybridView.beforeUpdate()
    HybridContextMenuViewStateUpdater.updateViewProps(hybridView, stateWrapper)
    hybridView.afterUpdate()

    return super.updateState(view, props, stateWrapper)
  }

  override fun addView(parent: FrameLayout, child: View, index: Int) {
    parent.addView(child, index)
  }

  override fun removeViewAt(parent: FrameLayout, index: Int) {
    parent.removeViewAt(index)
  }

  override fun getChildCount(parent: FrameLayout): Int = parent.childCount

  override fun getChildAt(parent: FrameLayout, index: Int): View? = parent.getChildAt(index)

  override fun needsCustomLayoutForChildren(): Boolean = false
}
