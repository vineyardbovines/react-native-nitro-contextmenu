# CLAUDE.md

## Project Overview

`react-native-nitro-contextmenu` — Native context menus for React Native using [Nitro Modules](https://nitro.margelo.cc). iOS uses `UIContextMenuInteraction`, Android uses `PopupMenu`. Single declarative TypeScript API for both platforms.

## Architecture

### Data flow

```
TypeScript MenuConfig → JSON.stringify → menuConfigJson (string prop) → Native JSON parsing → Platform menu
```

All menu configuration is serialized as JSON on the JS side and parsed natively. No Nitrogen regeneration is needed for new menu features — just extend the JSON contract.

### Key files

- `src/ContextMenuTypes.ts` — Public TypeScript types (`MenuConfig`, `MenuAction`, `MenuTab`, etc.)
- `src/ContextMenu.tsx` — React component that serializes config and passes to native
- `src/specs/ContextMenu.nitro.ts` — Nitro spec defining the native prop interface (string + callback props)
- `ios/HybridContextMenuView.swift` — iOS implementation (UIContextMenuInteraction, TabState, MenuBuilder)
- `android/src/main/java/com/margelo/nitro/nitrocontextmenu/HybridContextMenuView.kt` — Android implementation (PopupMenu)
- `nitrogen/generated/` — Auto-generated bridge code. **Do not edit.**

### Adding new props

If a new prop needs to flow through the native bridge (not just JSON):

1. Add it to `src/specs/ContextMenu.nitro.ts`
2. Run `npm run specs` to regenerate nitrogen files
3. Implement the abstract property in both `HybridContextMenuView.swift` and `HybridContextMenuView.kt`

If the prop can be embedded in the existing JSON config (preferred):

1. Add the TypeScript type to `src/ContextMenuTypes.ts`
2. Serialize it in `src/ContextMenu.tsx` (see `_trigger` pattern)
3. Parse it in the native `MenuBuilder` / JSON parsing code

## Build & Test

```sh
# TypeScript typecheck
npm run typecheck

# Rebuild lib/ (needed before example resolves types)
npx tsc

# Regenerate nitrogen bridge code after spec changes
npm run specs

# iOS build
cd example/ios && pod install && xcodebuild -workspace ContextMenuExample.xcworkspace -scheme ContextMenuExample -destination 'platform=iOS Simulator,name=iPhone 16' build

# Android build
cd example/android && ./gradlew assembleDebug
```

## Conventions

- Package name: `react-native-nitro-contextmenu`
- Kotlin package: `com.margelo.nitro.nitrocontextmenu`
- Swift has no module prefix — files live directly in `ios/`
- The example app imports from the package name, resolving via metro `watchFolders`
- Example types resolve from compiled `lib/` — run `npx tsc` after type changes
- Prettier: single quotes, no semicolons, 2-space indent (see `package.json`)
- iOS-only features degrade gracefully on Android (no crashes, just skipped)
