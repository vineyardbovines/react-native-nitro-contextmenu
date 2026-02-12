import React, { useMemo } from "react";
import { callback, getHostComponent } from "react-native-nitro-modules";
import type { ContextMenuProps } from "./ContextMenuTypes";
import type {
  ContextMenuViewMethods,
  ContextMenuViewProps as NativeProps,
} from "./specs/ContextMenu.nitro";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = () => require("../nitrogen/generated/shared/json/ContextMenuViewConfig.json");

const NativeContextMenuView = getHostComponent<NativeProps, ContextMenuViewMethods>(
  "ContextMenuView",
  config
);

const noop = () => {};

export function ContextMenu({
  menuConfig,
  showMenuOnPress,
  previewConfig,
  onPressAction,
  onMenuWillShow,
  onMenuWillHide,
  onPreviewPress,
  children,
}: ContextMenuProps) {
  const menuConfigJson = useMemo(
    () =>
      JSON.stringify({
        ...menuConfig,
        ...(showMenuOnPress ? { _showMenuOnPress: true } : undefined),
      }),
    [menuConfig, showMenuOnPress]
  );

  const previewConfigJson = useMemo(() => JSON.stringify(previewConfig ?? {}), [previewConfig]);

  return (
    <NativeContextMenuView
      menuConfigJson={menuConfigJson}
      previewConfigJson={previewConfigJson}
      onPressAction={callback(onPressAction ?? noop)}
      onMenuWillShow={callback(onMenuWillShow ?? noop)}
      onMenuWillHide={callback(onMenuWillHide ?? noop)}
      onPreviewPress={callback(onPreviewPress ?? noop)}
    >
      {children}
    </NativeContextMenuView>
  );
}
