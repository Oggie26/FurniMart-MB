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
        name="profile"
        options={{
          title: "Thông tin cá nhân",
          headerStyle: { backgroundColor: "#2f855a" },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="edit-profile"
        options={{
          title: "Chỉnh sửa",
          presentation: "modal",
          headerLeft: () => <BackButton />,
          headerStyle: { backgroundColor: "#2f855a" },
          headerTintColor: "#fff",
        }}
      />

      <Stack.Screen
        name="order"
        options={{
          title: "Đơn hàng của tôi",
          headerStyle: { backgroundColor: "#2f855a" },
          headerTintColor: "#fff",
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
