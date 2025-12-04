import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import axiosClient from "./axiosClient";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const registerForPushNotifications = async () => {
    try {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#2F855A",
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("Failed to get push token for push notification!");
            return null;
        }

        // Get the token that uniquely identifies this device
        let token;
        try {
            const projectId = Constants.expoConfig?.extra?.eas?.projectId;
            if (!projectId) {
                console.warn("Project ID not found in app.json. Push notifications may not work.");
            }

            token = (await Notifications.getExpoPushTokenAsync({
                projectId: projectId || "00000000-0000-0000-0000-000000000000" // Fallback to placeholder
            })).data;
            console.log("Push notification token:", token);
        } catch (e) {
            console.error("Error getting push token:", e);
            return null;
        }

        await registerTokenWithBackend(token);

        return token;
    } catch (error) {
        console.error("Error registering for push notifications:", error);
        return null;
    }
};

export const registerTokenWithBackend = async (token) => {
    try {
        const staffId = await AsyncStorage.getItem("staffId");
        if (!staffId) return;

        await axiosClient.post("/notifications/register", {
            token,
            staffId,
            platform: Platform.OS,
        });
    } catch (error) {
        console.error("Error registering token with backend:", error);
    }
};

export const setupNotificationListeners = (onNotificationReceived) => {
    // Handle notifications when app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
        (notification) => {
            console.log("Notification received:", notification);
            if (onNotificationReceived) {
                onNotificationReceived(notification);
            }
        }
    );

    const responseListener = Notifications.addNotificationResponseReceivedListener(
        (response) => {
            console.log("Notification response:", response);
            const data = response.notification.request.content.data;
            if (data.orderId) {
                console.log("Navigate to order:", data.orderId);
            }
        }
    );

    return () => {
        notificationListener.remove();
        responseListener.remove();
    };
};

