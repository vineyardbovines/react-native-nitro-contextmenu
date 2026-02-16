import { useState } from "react";
import { Alert, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from "react-native";
import type { MenuConfig } from "react-native-nitro-contextmenu";
import { ContextMenu } from "react-native-nitro-contextmenu";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

function App() {
  const isDarkMode = useColorScheme() === "dark";

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.header}>Context Menu Examples</Text>

          <BasicExample />
          <BasicLongPressExample />
          <SubmenusExample />
          <SelectionExample />
          <AttributesExample />
          <PaletteExample />
          <InlineGroupsExample />
          <TabbedMenuExample />
          <TapTriggerExample />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

// 1. Basic actions
function BasicExample() {
  const menuConfig: MenuConfig = {
    title: "",
    items: [
      {
        actionKey: "copy",
        title: "Copy",
        image: { systemName: "doc.on.doc" },
      },
      {
        actionKey: "paste",
        title: "Paste",
        image: { systemName: "doc.on.clipboard" },
      },
      {
        actionKey: "share",
        title: "Share",
        subtitle: "Share with others",
        image: { systemName: "square.and.arrow.up" },
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Action", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Basic Actions</Text>
        <Text style={styles.cardSub}>Tap for copy, paste, share</Text>
      </View>
    </ContextMenu>
  );
}

function BasicLongPressExample() {
  const menuConfig: MenuConfig = {
    title: "",
    items: [
      {
        actionKey: "copy",
        title: "Copy",
        image: { systemName: "doc.on.doc" },
      },
      {
        actionKey: "paste",
        title: "Paste",
        image: { systemName: "doc.on.clipboard" },
      },
      {
        actionKey: "share",
        title: "Share",
        subtitle: "Share with others",
        image: { systemName: "square.and.arrow.up" },
      },
    ],
  };

  return (
    <ContextMenu
      trigger="longPress"
      menuConfig={menuConfig}
      onPressAction={(key) => Alert.alert("Action", key)}
    >
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Long Press to open</Text>
      </View>
    </ContextMenu>
  );
}

// 2. Nested submenus
function SubmenusExample() {
  const menuConfig: MenuConfig = {
    title: "Filter",
    items: [
      {
        actionKey: "sort",
        title: "Sort",
        image: { systemName: "arrow.up.arrow.down" },
      },
      {
        title: "Cabin",
        image: { systemName: "airplane" },
        items: [
          { actionKey: "cabin-economy", title: "Economy" },
          { actionKey: "cabin-business", title: "Business" },
          { actionKey: "cabin-first", title: "First Class" },
        ],
      },
      {
        title: "Programs",
        image: { systemName: "globe" },
        items: [
          { actionKey: "prog-delta", title: "Delta SkyMiles" },
          { actionKey: "prog-united", title: "United MileagePlus" },
          { actionKey: "prog-aa", title: "AAdvantage" },
        ],
      },
      {
        title: "Alliances",
        image: { systemName: "globe.americas" },
        items: [
          { actionKey: "alliance-star", title: "Star Alliance" },
          { actionKey: "alliance-oneworld", title: "Oneworld" },
          { actionKey: "alliance-skyteam", title: "SkyTeam" },
        ],
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Filter", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nested Submenus</Text>
        <Text style={styles.cardSub}>Cabin, Programs, Alliances filters</Text>
      </View>
    </ContextMenu>
  );
}

// 3. Single selection with state
function SelectionExample() {
  const [selected, setSelected] = useState("medium");

  const menuConfig: MenuConfig = {
    title: "Text Size",
    items: [
      {
        title: "",
        options: ["displayInline", "singleSelection"],
        items: [
          {
            actionKey: "small",
            title: "Small",
            image: { systemName: "textformat.size.smaller" },
            state: selected === "small" ? "on" : "off",
          },
          {
            actionKey: "medium",
            title: "Medium",
            image: { systemName: "textformat.size" },
            state: selected === "medium" ? "on" : "off",
          },
          {
            actionKey: "large",
            title: "Large",
            image: { systemName: "textformat.size.larger" },
            state: selected === "large" ? "on" : "off",
          },
        ],
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => setSelected(key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Single Selection</Text>
        <Text style={styles.cardSub}>Current: {selected} (checkmark state)</Text>
      </View>
    </ContextMenu>
  );
}

// 4. Destructive & disabled attributes
function AttributesExample() {
  const menuConfig: MenuConfig = {
    title: "",
    items: [
      {
        actionKey: "edit",
        title: "Edit",
        image: { systemName: "pencil" },
      },
      {
        actionKey: "duplicate",
        title: "Duplicate",
        image: { systemName: "plus.square.on.square" },
      },
      {
        actionKey: "archive",
        title: "Archive",
        image: { systemName: "archivebox" },
        attributes: ["disabled"],
      },
      {
        title: "",
        options: ["displayInline"],
        items: [
          {
            actionKey: "delete",
            title: "Delete",
            image: { systemName: "trash" },
            attributes: ["destructive"],
          },
        ],
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Action", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Attributes</Text>
        <Text style={styles.cardSub}>Disabled archive, destructive delete</Text>
      </View>
    </ContextMenu>
  );
}

// 5. Palette display (iOS 17+)
function PaletteExample() {
  const menuConfig: MenuConfig = {
    title: "Color",
    items: [
      {
        title: "",
        options: ["displayInline", "displayAsPalette"],
        items: [
          {
            actionKey: "red",
            title: "Red",
            image: { systemName: "circle.fill" },
          },
          {
            actionKey: "orange",
            title: "Orange",
            image: { systemName: "circle.fill" },
          },
          {
            actionKey: "yellow",
            title: "Yellow",
            image: { systemName: "circle.fill" },
          },
          {
            actionKey: "green",
            title: "Green",
            image: { systemName: "circle.fill" },
          },
          {
            actionKey: "blue",
            title: "Blue",
            image: { systemName: "circle.fill" },
          },
        ],
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Color", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Palette (iOS 17+)</Text>
        <Text style={styles.cardSub}>Horizontal icon row</Text>
      </View>
    </ContextMenu>
  );
}

// 6. Inline groups with separators
function InlineGroupsExample() {
  const menuConfig: MenuConfig = {
    title: "",
    items: [
      {
        title: "",
        options: ["displayInline"],
        preferredElementSize: "small",
        items: [
          {
            actionKey: "cut",
            title: "Cut",
            image: { systemName: "scissors" },
          },
          {
            actionKey: "copy2",
            title: "Copy",
            image: { systemName: "doc.on.doc" },
          },
          {
            actionKey: "paste2",
            title: "Paste",
            image: { systemName: "doc.on.clipboard" },
          },
        ],
      },
      {
        title: "",
        options: ["displayInline"],
        items: [
          {
            actionKey: "select-all",
            title: "Select All",
            image: { systemName: "selection.pin.in.out" },
          },
          {
            actionKey: "find",
            title: "Find",
            image: { systemName: "magnifyingglass" },
          },
        ],
      },
      {
        actionKey: "look-up",
        title: "Look Up",
        image: { systemName: "doc.text.magnifyingglass" },
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Action", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Inline Groups</Text>
        <Text style={styles.cardSub}>Small cut/copy/paste bar + separated sections</Text>
      </View>
    </ContextMenu>
  );
}

// 7. Tabbed menu (iOS 16+)
function TabbedMenuExample() {
  const menuConfig: MenuConfig = {
    title: "",
    tabs: [
      {
        tabKey: "sort",
        title: "Sort",
        image: { systemName: "arrow.up.arrow.down" },
        items: [
          {
            actionKey: "sort-name",
            title: "Name",
            image: { systemName: "textformat.abc" },
          },
          {
            actionKey: "sort-date",
            title: "Date",
            image: { systemName: "calendar" },
          },
          {
            actionKey: "sort-size",
            title: "Size",
            image: { systemName: "internaldrive" },
          },
        ],
      },
      {
        tabKey: "filter",
        title: "Filter",
        image: { systemName: "line.3.horizontal.decrease" },
        items: [
          {
            actionKey: "filter-images",
            title: "Images",
            image: { systemName: "photo" },
          },
          {
            actionKey: "filter-videos",
            title: "Videos",
            image: { systemName: "video" },
          },
          {
            actionKey: "filter-docs",
            title: "Documents",
            image: { systemName: "doc" },
          },
        ],
      },
      {
        tabKey: "view",
        title: "View",
        image: { systemName: "square.grid.2x2" },
        items: [
          {
            actionKey: "view-grid",
            title: "Grid",
            image: { systemName: "square.grid.2x2" },
          },
          {
            actionKey: "view-list",
            title: "List",
            image: { systemName: "list.bullet" },
          },
        ],
      },
    ],
    items: [],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Tabbed Action", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tabbed Menu (iOS 16+)</Text>
        <Text style={styles.cardSub}>Sort / Filter / View tabs — content swaps in-place</Text>
      </View>
    </ContextMenu>
  );
}

// 8. Tap to trigger (no long press needed)
function TapTriggerExample() {
  const menuConfig: MenuConfig = {
    title: "Sort By",
    items: [
      {
        actionKey: "tap-name",
        title: "Name",
        image: { systemName: "textformat.abc" },
      },
      {
        actionKey: "tap-date",
        title: "Date Modified",
        image: { systemName: "calendar" },
      },
      {
        actionKey: "tap-size",
        title: "Size",
        image: { systemName: "internaldrive" },
      },
      {
        actionKey: "tap-kind",
        title: "Kind",
        image: { systemName: "doc" },
      },
    ],
  };

  return (
    <ContextMenu menuConfig={menuConfig} onPressAction={(key) => Alert.alert("Sort", key)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tap to Trigger</Text>
        <Text style={styles.cardSub}>Single tap shows menu (no long press)</Text>
      </View>
    </ContextMenu>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f7",
  },
  scroll: {
    padding: 20,
    gap: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    color: "#000",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000",
  },
  cardSub: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});

export default App;
