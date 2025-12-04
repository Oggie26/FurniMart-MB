import { Stack } from "expo-router";
import React from "react";

export default function DeliveryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="delivery" options={{ headerShown: false }} />
    </Stack>
  );
}
