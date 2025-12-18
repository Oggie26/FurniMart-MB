import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { View as MotiView } from "moti";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { analyzeRoomImage } from "../../service/ai";

const { width } = Dimensions.get("window");

const COLOR_MAP: Record<string, string> = {
    "vàng gỗ": "#D2B48C",
    "light oak": "#D2B48C",
    "trắng": "#FFFFFF",
    "kem": "#F5F5DC",
    "cream": "#F5F5DC",
    "beige": "#F5F5DC",
    "xám nhạt": "#D3D3D3",
    "light gray": "#D3D3D3",
    "xám đậm": "#4A4A4A",
    "charcoal": "#36454F",
    "bạc": "#C0C0C0",
    "stainless steel": "#C0C0C0",
    "cam đất": "#BC5449",
    "terracotta": "#BC5449",
    "gỗ tự nhiên": "#DEB887",
    "đen": "#1A1A1A",
    "black": "#1A1A1A",
};

const resolveColor = (colorStr: string) => {
    if (!colorStr) return "#E2E8F0";
    const lower = colorStr.toLowerCase();

    if (lower.startsWith("#") || lower.startsWith("rgb")) return colorStr;

    for (const [key, value] of Object.entries(COLOR_MAP)) {
        if (lower.includes(key)) return value;
    }

    // Secondary check inside parentheses
    if (colorStr.includes("(")) {
        const inside = colorStr.split("(")[1].split(")")[0].toLowerCase();
        for (const [key, value] of Object.entries(COLOR_MAP)) {
            if (inside.includes(key)) return value;
        }
    }

    return "#E2E8F0"; // Default light gray
};

interface Suggestion {
    id: string;
    itemName: string;
    reason: string;
    placementAdvice: string;
    thumbnailImage: string;
    price: number;
    recommendedColor: string;
}

interface AIAnalysisData {
    style: string;
    analysis: string;
    colorPalette: string[];
    suggestions: Suggestion[];
}

interface AIResponse {
    status: number;
    message: string;
    data: AIAnalysisData;
    timestamp: string;
    redirectUrl: string;
}

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    image?: string | null;
    structuredData?: AIAnalysisData | null;
}

export default function AIScreen() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Xin chào! Tôi có thể giúp gì cho bạn trong việc thiết kế nội thất?",
            sender: "ai",
            image: null,
        },
    ]);
    const [inputText, setInputText] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const flatListRef = useRef<FlatList>(null);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Quyền truy cập bị từ chối", "Cần quyền truy cập thư viện ảnh để tải ảnh lên.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0]);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() && !selectedImage) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: "user",
            image: selectedImage?.uri,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText("");

        const imageToSend = selectedImage;
        setSelectedImage(null);
        setLoading(true);

        try {
            if (!imageToSend) {
                throw new Error("Không có ảnh để phân tích");
            }

            const formData = new FormData();
            const uri = imageToSend.uri;
            const type = imageToSend.mimeType || imageToSend.type || "image/jpeg";
            const name = imageToSend.fileName || uri.split("/").pop() || "room.jpg";

            formData.append("image", {
                uri,
                type,
                name,
            } as any);

            if (userMessage.text) {
                formData.append("note", userMessage.text);
            }

            const res = await analyzeRoomImage(formData);

            if (res && res.data) {
                const aiData = res.data as AIAnalysisData;

                const aiMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: aiData.analysis || "Đã phân tích xong!",
                    sender: "ai",
                    structuredData: aiData,
                    image: aiData.suggestions?.[0]?.thumbnailImage || null,
                };

                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error("AI response invalid");
            }
        } catch (error) {
            console.error("AI Error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    text: "Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.",
                    sender: "ai",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const mockData: AIAnalysisData = {
        style: "Scandinavian/Minimalist",
        analysis: "Căn phòng này là sự kết hợp giữa không gian bếp và khu vực ăn uống. Thiết kế tổng thể theo phong cách tối giản (Minimalist) pha trộn nét ấm áp của Scandinavian, thể hiện qua việc sử dụng vật liệu gỗ tự nhiên sáng màu, đường nét nội thất gọn gàng, và tận dụng tối đa ánh sáng tự nhiên. Không gian hiện tại rất sạch sẽ, thông thoáng nhưng thiếu điểm nhấn màu sắc để tối ưu hóa tính thẩm mỹ và sự ấm cúng.",
        colorPalette: [
            "Vàng Gỗ Tự Nhiên (Light Oak)",
            "Trắng/Kem (Cream/Beige)",
            "Xám Nhạt/Xám Đậm (Light Gray/Charcoal)",
            "Bạc (Stainless Steel)"
        ],
        suggestions: [
            {
                "id": "31478c96-feca-47a7-8765-c40215c91a1c",
                "itemName": "Ghế Thư Giãn Bọc Vải Linen Cam Đất - Chân Gỗ Sồi",
                "reason": "Không gian hiện tại bị chi phối bởi các màu trung tính. Ghế thư giãn màu Cam Đất (Terracotta) sẽ là 'màu nhấn' hoàn hảo, mang lại sự ấm áp, chiều sâu và tính thẩm mỹ cao, tạo ra một góc thư giãn lý tưởng trong khu vực bếp/ăn.",
                "placementAdvice": "Đặt ở góc phòng (ví dụ: góc bên phải, cạnh tủ bếp trên), nơi có đủ ánh sáng tự nhiên, để tạo một khu vực đọc sách hoặc nhâm nhi cà phê tách biệt với bàn ăn chính.",
                "thumbnailImage": "https://i.pinimg.com/1200x/9e/3c/2e/9e3c2e8705aa6f3ef3557bd80cba5c0e.jpg",
                "price": 3990000,
                "recommendedColor": "Cam Đất"
            },
            {
                "id": "4a59f56e-9bb9-4c65-b950-ff142f5d07e1",
                "itemName": "Sofa Văng Đơn Smart Bọc Da PU Xám Đậm Hiện Đại",
                "reason": "Để nâng cấp tính thẩm mỹ và chức năng, việc tạo ra một khu vực tiếp khách/nghỉ ngơi nhỏ là cần thiết. Sofa đơn với màu Xám Đậm sẽ tạo sự tương phản mạnh mẽ với sàn gỗ và tường kem, giúp phân định rõ ràng các khu vực chức năng trong không gian mở.",
                "placementAdvice": "Đặt đối diện bàn ăn (nếu không gian cho phép) hoặc dựa vào bức tường trống lớn nhất, biến khu vực này thành một phòng khách nhỏ gọn và tiện nghi.",
                "thumbnailImage": "https://i.pinimg.com/736x/d4/57/ac/d457ac565297a44f2a22049b69e5f2a7.jpg",
                "price": 4590000,
                "recommendedColor": "Xám Đậm"
            },
            {
                "id": "70cf1095-3b0d-45a7-9a8b-817cb0dd5e36",
                "itemName": "Bàn Phụ Side Table Gỗ Sồi Thông Minh",
                "reason": "Giả sử đây là một chiếc bàn phụ nhỏ (Side Table) – món đồ nội thất thiết yếu để hoàn thiện khu vực thư giãn. Nó đảm bảo tính tiện dụng (đặt cốc chén, sách) và giữ vững sự tối giản, gọn gàng cho không gian.",
                "placementAdvice": "Đặt ngay cạnh Ghế Thư Giãn (Sản phẩm 1) hoặc Sofa Văng Đơn (Sản phẩm 2).",
                "thumbnailImage": "https://i.pinimg.com/736x/39/3c/6e/393c6e4e5e8e8e8e8e8e8e8e8e8e8e8e.jpg",
                "price": 1000000,
                "recommendedColor": "Gỗ Tự Nhiên"
            }
        ]
    };

    useEffect(() => {
        // Automatically add a response with the user's provided JSON for testing
        const timer = setTimeout(() => {
            if (messages.length === 1) {
                const aiMessage: Message = {
                    id: "demo-1",
                    text: mockData.analysis,
                    sender: "ai",
                    structuredData: mockData,
                    image: mockData.suggestions[0].thumbnailImage,
                };
                setMessages(prev => [...prev, aiMessage]);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const renderMessage = ({ item }: { item: Message }) => {
        const isUser = item.sender === "user";
        return (
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessage : styles.aiMessage,
                ]}
            >
                {!isUser && (
                    <LinearGradient
                        colors={["#059669", "#10b981"]}
                        style={styles.avatarContainer}
                    >
                        <Ionicons name="sparkles" size={16} color="#fff" />
                    </LinearGradient>
                )}
                <MotiView
                    from={{ opacity: 0, translateY: 10, scale: 0.95 }}
                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                    transition={{ type: "timing", duration: 400 }}
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                >
                    {item.image && (
                        <Image
                            source={{ uri: item.image }}
                            style={styles.messageImage}
                            contentFit="cover"
                            transition={1000}
                        />
                    )}

                    {item.structuredData ? (
                        <View style={styles.structuredContainer}>
                            <View style={styles.styleBadge}>
                                <Text style={styles.styleBadgeText}>{item.structuredData.style}</Text>
                            </View>

                            <Text style={styles.messageText}>{item.structuredData.analysis}</Text>

                            {/* Color Palette */}
                            {item.structuredData.colorPalette && item.structuredData.colorPalette.length > 0 && (
                                <View style={styles.paletteContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="color-palette-outline" size={18} color="#059669" />
                                        <Text style={styles.sectionSubtitle}>Bảng màu đề xuất</Text>
                                    </View>
                                    <View style={styles.colorRow}>
                                        {item.structuredData.colorPalette.map((color, index) => (
                                            <View key={index} style={styles.colorCircleWrapper}>
                                                <View style={[styles.colorCircle, { backgroundColor: resolveColor(color) }]} />
                                                <Text style={styles.colorHex}>{color.indexOf('(') !== -1 ? color.split('(')[0].trim() : color}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Suggestions */}
                            {item.structuredData.suggestions && item.structuredData.suggestions.length > 0 && (
                                <View style={styles.suggestionsContainer}>
                                    <View style={styles.sectionHeader}>
                                        <Ionicons name="bulb-outline" size={18} color="#059669" />
                                        <Text style={styles.sectionSubtitle}>Gợi ý nội thất</Text>
                                    </View>
                                    {item.structuredData.suggestions.map((suggestion, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.suggestionCard}
                                            onPress={() => {
                                                // @ts-ignore
                                                router.push(`/detail/${suggestion.id}`);
                                            }}
                                        >
                                            <View style={styles.suggestionTop}>
                                                {suggestion.thumbnailImage && (
                                                    <Image
                                                        source={{ uri: suggestion.thumbnailImage }}
                                                        style={styles.suggestionThumb}
                                                        contentFit="cover"
                                                        transition={500}
                                                    />
                                                )}
                                                <View style={styles.suggestionInfo}>
                                                    <View style={styles.suggestionHeader}>
                                                        <View style={styles.dot} />
                                                        <Text style={styles.suggestionName}>
                                                            {suggestion.itemName}
                                                        </Text>
                                                    </View>
                                                    <Text style={styles.suggestionPrice}>
                                                        {new Intl.NumberFormat("vi-VN", {
                                                            style: "currency",
                                                            currency: "VND",
                                                        }).format(suggestion.price)}
                                                    </Text>
                                                </View>
                                            </View>

                                            <Text style={styles.suggestionReason} numberOfLines={2}>
                                                {suggestion.reason}
                                            </Text>

                                            <View style={styles.suggestionFooter}>
                                                <View style={styles.adviceContainer}>
                                                    <Ionicons name="locate-outline" size={12} color="#64748b" style={{ marginTop: 2 }} />
                                                    <Text style={styles.suggestionAdvice}>{suggestion.placementAdvice}</Text>
                                                </View>
                                                {suggestion.recommendedColor && (
                                                    <View style={styles.recommendedColorContainer}>
                                                        <View style={[styles.recColorPoint, { backgroundColor: resolveColor(suggestion.recommendedColor) }]} />
                                                        <Text style={styles.recColorText}>{suggestion.recommendedColor}</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    ) : (
                        item.text ? (
                            <Text style={[styles.messageText, isUser && styles.userMessageText]}>
                                {item.text}
                            </Text>
                        ) : null
                    )}
                </MotiView>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={["#064e3b", "#065f46"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <SafeAreaView edges={["top"]}>
                    <View style={styles.header}>
                        <View style={styles.headerContent}>
                            <View style={styles.logoContainer}>
                                <Ionicons name="sparkles" size={20} color="#fbbf24" />
                            </View>
                            <View>
                                <Text style={styles.headerSubtitle}>Interior Designer</Text>
                                <Text style={styles.headerTitle}>FurniMart AI</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.headerBadge}>
                            <Text style={styles.headerBadgeText}>PRO</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messageList}
            />

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#2f855a" />
                    <Text style={styles.loadingText}>AI đang phân tích...</Text>
                </View>
            )}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
                style={styles.inputWrapper}
            >
                <View style={styles.inputContainer}>
                    {selectedImage && (
                        <MotiView
                            from={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={styles.selectedImagePreview}
                        >
                            <Image
                                source={{ uri: selectedImage.uri }}
                                style={styles.previewImage}
                                contentFit="cover"
                            />
                            <TouchableOpacity
                                style={styles.removeImageButton}
                                onPress={() => setSelectedImage(null)}
                            >
                                <Ionicons name="close-circle" size={24} color="#ef4444" />
                            </TouchableOpacity>
                        </MotiView>
                    )}

                    <View style={styles.inputRow}>
                        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
                            <View style={styles.iconCircle}>
                                <Ionicons name="image" size={22} color="#059669" />
                            </View>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="Mô tả ý tưởng của bạn..."
                            placeholderTextColor="#94a3b8"
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                        />

                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={!inputText && !selectedImage}
                            style={styles.sendButtonWrapper}
                        >
                            <LinearGradient
                                colors={!inputText && !selectedImage ? ["#cbd5e1", "#cbd5e1"] : ["#059669", "#10b981"]}
                                style={styles.sendButton}
                            >
                                <Ionicons name="arrow-up" size={22} color="#fff" />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
    },
    headerGradient: {
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        paddingBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    logoContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 12,
        color: "#a7f3d0",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    headerBadge: {
        backgroundColor: "#fbbf24",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    headerBadgeText: {
        fontSize: 10,
        fontWeight: "900",
        color: "#78350f",
    },
    messageList: {
        padding: 20,
        paddingBottom: 40,
    },
    messageContainer: {
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "flex-end",
    },
    userMessage: {
        justifyContent: "flex-end",
    },
    aiMessage: {
        justifyContent: "flex-start",
    },
    avatarContainer: {
        width: 32,
        height: 32,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    messageBubble: {
        maxWidth: "85%",
        padding: 14,
        borderRadius: 22,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    userBubble: {
        backgroundColor: "#065f46",
        borderBottomRightRadius: 4,
    },
    aiBubble: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    messageText: {
        fontSize: 15,
        color: "#334155",
        lineHeight: 22,
    },
    userMessageText: {
        color: "#fff",
        fontWeight: "500",
    },
    messageImage: {
        width: width * 0.65,
        height: width * 0.5,
        borderRadius: 16,
        marginBottom: 10,
    },
    structuredContainer: {
        gap: 12,
    },
    styleBadge: {
        backgroundColor: "#ecfdf5",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        alignSelf: "flex-start",
        borderWidth: 1,
        borderColor: "#10b981",
    },
    styleBadgeText: {
        color: "#065f46",
        fontWeight: "700",
        fontSize: 13,
        textTransform: "capitalize",
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 10,
        marginTop: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1e293b",
    },
    paletteContainer: {
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    colorCircleWrapper: {
        alignItems: "center",
        gap: 4,
    },
    colorCircle: {
        width: 38,
        height: 38,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#fff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    colorHex: {
        fontSize: 9,
        fontWeight: "700",
        color: "#64748b",
    },
    suggestionsContainer: {
        gap: 8,
    },
    suggestionCard: {
        backgroundColor: "#fff",
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#f1f5f9",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 3,
        elevation: 1,
    },
    suggestionHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        marginBottom: 6,
        paddingRight: 4,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#10b981",
        marginTop: 6,
    },
    suggestionName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
        flexShrink: 1,
    },
    suggestionReason: {
        fontSize: 13,
        color: "#475569",
        lineHeight: 18,
    },
    adviceContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 4,
        marginTop: 8,
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        flex: 1,
        marginRight: 8,
    },
    suggestionAdvice: {
        fontSize: 11,
        color: "#64748b",
        fontWeight: "600",
        flexShrink: 1,
    },
    loadingContainer: {
        flexDirection: "row",
        padding: 15,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    loadingText: {
        color: "#64748b",
        fontSize: 13,
        fontWeight: "500",
    },
    inputWrapper: {
        backgroundColor: "transparent",
        paddingBottom: Platform.OS === "ios" ? 20 : 10,
    },
    inputContainer: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginBottom: 85,
        padding: 8,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: "#f1f5f9",
    },
    selectedImagePreview: {
        flexDirection: "row",
        padding: 8,
        alignItems: "flex-start",
    },
    previewImage: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#f1f5f9",
    },
    removeImageButton: {
        marginLeft: -12,
        marginTop: -8,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    iconButton: {
        padding: 4,
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 16,
        backgroundColor: "#ecfdf5",
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        color: "#1e293b",
        fontSize: 15,
        maxHeight: 120,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    sendButtonWrapper: {
        padding: 4,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#10b981",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionTop: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 10,
    },
    suggestionThumb: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "#f1f5f9",
    },
    suggestionInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 2,
    },
    suggestionPrice: {
        fontSize: 14,
        fontWeight: "800",
        color: "#059669",
    },
    suggestionFooter: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginTop: 10,
        flexWrap: "wrap",
        gap: 8,
    },
    recommendedColorContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    recColorPoint: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
    },
    recColorText: {
        fontSize: 10,
        color: "#475569",
        fontWeight: "700",
        textTransform: "uppercase",
    },
});
