"use client"
import { useLocalSearchParams, useRouter } from "expo-router"
import React from "react"
import { ActivityIndicator, View } from "react-native"
import { WebView } from "react-native-webview"

export default function PaymentWebView() {
  const router = useRouter()
  const { url } = useLocalSearchParams()

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ uri: url }}
        startInLoadingState
        renderLoading={() => (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" color="#3B6C46" />
          </View>
        )}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes("payment-success")) {
            router.push("/order-success")
          }
          if (navState.url.includes("payment-failed")) {
            router.back()
          }
        }}
      />
    </View>
  )
}
