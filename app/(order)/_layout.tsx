import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";

export default function UserLayout() {
  const router = useRouter();

  const BackButton = () => (
    <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 10 }}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  );

  return (
    <Stack>
      <Stack.Screen
        name="order"
        options={{
          title: "Đơn hàng của tôi",
          headerStyle: { backgroundColor: "#2f855a" },
          headerTintColor: "#fff",
          headerLeft: () => <BackButton />,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Chi tiết sản phẩm",
          headerStyle: { backgroundColor: "#2f855a" },
          headerTintColor: "#fff",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
