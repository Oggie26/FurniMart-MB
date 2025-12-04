import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBarStyle,
        tabBarIcon: ({ focused }) => {
          let iconName = "";
          if (route.name === "home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "cart") iconName = focused ? "cart" : "cart-outline";
          else if (route.name === "settings") iconName = focused ? "settings" : "settings-outline";

          const scale = useSharedValue(focused ? 1.1 : 1);
          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: withTiming(scale.value, { duration: 200 }) }],
          }));

          useEffect(() => {
            scale.value = focused ? 1.1 : 1;
          }, [focused]);

          return (
            <View style={styles.iconContainer}>
              {focused ? (
                <LinearGradient
                  colors={["#2f855a", "#38a169"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconWrapperActive}
                >
                  <Animated.View style={animatedStyle}>
                    <Ionicons name={iconName} size={26} color="#fff" />
                  </Animated.View>
                </LinearGradient>
              ) : (
                <View style={styles.iconWrapper}>
                  <Animated.View style={animatedStyle}>
                    <Ionicons name={iconName} size={24} color="#718096" />
                  </Animated.View>
                </View>
              )}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="cart" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarStyle: {
  position: "absolute",
  bottom: 0, // 👈 Đặt sát đáy
  left: 0,
  right: 0,
  backgroundColor: "white",
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  height: 70,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -2 },
  shadowOpacity: 0.1,
  shadowRadius: 6,
  elevation: 8,
  paddingBottom: Platform.OS === "ios" ? 20 : 10,
},

  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f7fafc",
  },
  iconWrapperActive: {
    justifyContent: "center",
    alignItems: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: "#2f855a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});
