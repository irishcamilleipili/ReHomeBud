import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function NavigationBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", path: "/home" },
    { name: "Pets", path: "/pets" },
    { name: "Profile", path: "/profile" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        return (
          <TouchableOpacity
            key={tab.name}
            style={[styles.tabButton, isActive && styles.activeTab]}
            onPress={() => router.push(tab.path)}
          >
            <Text style={[styles.tabText, isActive && styles.activeText]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#DFDACF", // Khaki - soft elegant base
    borderRadius: 40,
    marginHorizontal: 20,
    padding: 6,
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#262626", // Leather - subtle depth
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: "center",
  },
  tabText: {
    fontSize: 15,
    color: "#4D403A", // Cacao - refined typography
    fontFamily: "Poppins_400Regular", // regular weight for default tabs
  },
  activeTab: {
    backgroundColor: "#A3968D", // Taupe - elegant highlight
    shadowColor: "#262626", // Leather - grounded shadow
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  activeText: {
    color: "#FFFFFF", // White - crisp readability
    fontFamily: "Poppins_600SemiBold", // strong active state emphasis
  },
});
