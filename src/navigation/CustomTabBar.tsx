import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/styles/colors";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 12) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
              ? options.title
              : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const renderIcon = (color: string, size: number) => {
          switch (route.name) {
            case "Home":
              return (
                <Ionicons
                  name={isFocused ? "home" : "home-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Cart":
              return (
                <Ionicons
                  name={isFocused ? "cart" : "cart-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Explore":
              return (
                <MaterialCommunityIcons
                  name="view-grid-plus-outline"
                  size={size}
                  color={color}
                />
              );
            case "Favorites":
              return (
                <Ionicons
                  name={isFocused ? "heart" : "heart-outline"}
                  size={size}
                  color={color}
                />
              );
            case "Profile":
              return (
                <Ionicons
                  name={isFocused ? "person" : "person-outline"}
                  size={size}
                  color={color}
                />
              );
            default:
              return <Ionicons name="home-outline" size={size} color={color} />;
          }
        };

        if (isFocused) {
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.activePill}
              activeOpacity={0.85}
            >
              {renderIcon(Colors.white, 20)}
              <Text style={styles.activeLabel}>{label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: false }}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.inactiveTab}
            activeOpacity={0.7}
          >
            {renderIcon(Colors.navInactive, 24)}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: Colors.navBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 9999,
    gap: 8,
  },
  activeLabel: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
