import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function DeliveryTabsLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: "#2F855A",
                tabBarInactiveTintColor: "#A0AEC0",
                tabBarStyle: {
                    backgroundColor: "#FFFFFF",
                    borderTopWidth: 0,
                    elevation: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    paddingBottom: Platform.OS === "ios" ? 20 : 8,
                    paddingTop: 8,
                    height: Platform.OS === "ios" ? 85 : 65,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    position: "absolute",
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "700",
                    marginTop: -2,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
                headerStyle: {
                    backgroundColor: "#2F855A",
                    elevation: 0,
                    shadowOpacity: 0,
                },
                headerTintColor: "#fff",
                headerTitleStyle: {
                    fontWeight: "700",
                    fontSize: 18,
                },
                headerTitleAlign: "center",
            }}
        >
            <Tabs.Screen
                name="list"
                options={{
                    title: "Đơn Hàng",
                    tabBarLabel: "Đơn hàng",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? "cube" : "cube-outline"}
                            size={focused ? 28 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: "Lịch Sử",
                    tabBarLabel: "Lịch sử",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? "time" : "time-outline"}
                            size={focused ? 28 : 24}
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Cá Nhân",
                    tabBarLabel: "Cá nhân",
                    tabBarIcon: ({ focused, color, size }) => (
                        <Ionicons
                            name={focused ? "person-circle" : "person-circle-outline"}
                            size={focused ? 28 : 24}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}
