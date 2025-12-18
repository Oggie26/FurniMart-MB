import AsyncStorage from "@react-native-async-storage/async-storage";

export const analyzeRoomImage = async (formData) => {
    const token = await AsyncStorage.getItem("token");

    const response = await fetch("https://furnimart.click/api/ai/analyze/analyze-room", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
    }

    return response.json();
};
