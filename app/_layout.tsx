import { useColorScheme } from "@/hooks/use-color-scheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Linking from 'expo-linking'; // THÊM DÒNG NÀY
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from 'react'; // THÊM DÒNG NÀY
import { Alert } from 'react-native'; // THÊM DÒNG NÀY
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      if (!url) return;

      const params = new URLSearchParams(url.split('?')[1]);
      const status = params.get('status');
      const orderId = params.get('orderId') || params.get('code');

      if (status === 'success') {
        Alert.alert("Thành công!", `Đơn hàng #${orderId} đã thanh toán!`);
        router.push("/order-success")
      } else if (status === 'failed') {
        Alert.alert("Thất bại", `Mã lỗi: ${orderId}`);
      } else if (status === 'invalid') {
        Alert.alert("Lỗi", "Giao dịch không hợp lệ");
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(user)" />
            <Stack.Screen name="(address)" />
            <Stack.Screen name="(cart)" />
            <Stack.Screen name="(product)" />
            <Stack.Screen name="(order)" />
            <Stack.Screen name="(delivery)" />
          </Stack>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        </ThemeProvider>
        <Toast position="top" topOffset={70} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}