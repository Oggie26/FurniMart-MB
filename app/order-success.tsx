"use client"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Text, TouchableOpacity, View } from "react-native"

export default function OrderSuccess() {
  const router = useRouter()
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
      <Ionicons name="checkmark-circle" size={80} color="#2f855a" />
      <Text style={{ fontSize: 22, fontWeight: "bold", marginTop: 10 }}>Đặt hàng thành công!</Text>
      <TouchableOpacity
        style={{ marginTop: 20, backgroundColor: "#3B6C46", padding: 12, borderRadius: 10 }}
        onPress={() => router.push("/")}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  )
}
