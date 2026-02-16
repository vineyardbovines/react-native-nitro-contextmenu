/**
 * Rich TypeScript types for iOS Context Menu configuration.
 * These types are used on the JS side for DX and serialized as JSON to native.
 */

// --- Images ---

export interface SystemImage {
  systemName: string;
}

export interface UrlImage {
  url: string;
}

export type MenuImage = SystemImage | UrlImage;

// --- Action ---

export type MenuElementAttribute = "destructive" | "disabled" | "hidden" | "keepsMenuPresented";

export type MenuElementState = "on" | "off" | "mixed";

export interface MenuAction {
  /** Unique key identifying this action. Returned in `onPressAction`. */
  actionKey: string;
  /** Primary display text. */
  title: string;
  /** Secondary text displayed below the title (iOS 15+). */
  subtitle?: string;
  /** Leading icon. SF Symbol name or URL. */
  image?: MenuImage;
  /** Icon shown when `state` is `'on'` (iOS 17+). */
  selectedImage?: SystemImage;
  /** Behavioral/visual attributes. */
  attributes?: MenuElementAttribute[];
  /** Checked state: on (checkmark), off (none), mixed (dash). */
  state?: MenuElementState;
  /** Extended title for accessibility/discoverability HUD. */
  discoverabilityTitle?: string;
}

// --- Tab ---

export interface MenuTab {
  /** Unique key identifying this tab. */
  tabKey: string;
  /** Display text for the tab button. */
  title: string;
  /** Optional icon for the tab button. */
  image?: SystemImage;
  /** The menu elements to display when this tab is selected. */
  items: MenuElement[];
}

// --- Menu / Submenu ---

export type MenuOption = "displayInline" | "destructive" | "singleSelection" | "displayAsPalette";

export type MenuElementSize = "small" | "medium" | "large";

/**
 * A menu element is either a leaf action or a submenu (which contains more elements).
 * Discriminate by checking for `actionKey` (action) vs `items` (submenu).
 */
export type MenuElement = MenuAction | MenuConfig;

export interface MenuConfig {
  /** Menu title. Displayed as submenu header when nested. */
  title?: string;
  /** Secondary text (iOS 15+). */
  subtitle?: string;
  /** Menu icon. */
  image?: SystemImage;
  /** Display and behavior options. */
  options?: MenuOption[];
  /** Size of child elements (iOS 16+). */
  preferredElementSize?: MenuElementSize;
  /**
   * Tabbed menu (iOS 16+). Displays a row of tab buttons at the top of
   * the menu. Tapping a tab swaps the items shown below without dismissing
   * the menu. The first tab is selected by default.
   * When `tabs` is provided, `items` is ignored.
   */
  tabs?: MenuTab[];
  /** Child elements: actions and/or nested submenus. */
  items: MenuElement[];
}

// --- Preview ---

export interface PreviewConfig {
  /**
   * `'view'` — uses the trigger view as preview (default).
   * `'none'` — no preview, just the menu.
   */
  previewType?: "view" | "none";
  /**
   * `'pop'` — tapping the preview "pops" into it (default).
   * `'dismiss'` — tapping the preview just dismisses the menu.
   */
  preferredCommitStyle?: "pop" | "dismiss";
  /** Background color of the preview (CSS hex string, e.g. '#ffffff'). */
  backgroundColor?: string;
  /** Corner radius of the preview. */
  borderRadius?: number;
}

// --- Component Props ---

export interface ContextMenuProps {
  /** The menu structure to display on long-press. */
  menuConfig: MenuConfig;
  /**
   * How the menu is triggered.
   * `'tap'` — single tap shows the menu (no preview lift). Default.
   * `'longPress'` — long-press with preview.
   */
  trigger?: "tap" | "longPress";
  /** Called when a menu action is selected, with the action's `actionKey`. */
  onPressAction?: (actionKey: string) => void;
  /** Called when the context menu is about to appear. */
  onMenuWillShow?: () => void;
  /** Called when the context menu is about to disappear. */
  onMenuWillHide?: () => void;
  /** Called when the user taps the preview. */
  onPreviewPress?: () => void;
  /** Preview customization. */
  previewConfig?: PreviewConfig;
  /** React children rendered as the trigger content. */
  children: React.ReactNode;
}
