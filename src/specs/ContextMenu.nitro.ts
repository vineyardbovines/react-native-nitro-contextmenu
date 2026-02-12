import type { HybridView, HybridViewMethods, HybridViewProps } from "react-native-nitro-modules";

export interface ContextMenuViewProps extends HybridViewProps {
  /** JSON-serialized MenuConfig. Parsed natively to build UIMenu hierarchy. */
  menuConfigJson: string;
  /** JSON-serialized PreviewConfig. Optional preview customization. */
  previewConfigJson: string;
  /** Called with the actionKey when a menu action is selected. */
  onPressAction: (actionKey: string) => void;
  /** Called when the context menu is about to appear. */
  onMenuWillShow: () => void;
  /** Called when the context menu is about to disappear. */
  onMenuWillHide: () => void;
  /** Called when the user taps the preview. */
  onPreviewPress: () => void;
}

export interface ContextMenuViewMethods extends HybridViewMethods {}

export type ContextMenuView = HybridView<ContextMenuViewProps, ContextMenuViewMethods>;
