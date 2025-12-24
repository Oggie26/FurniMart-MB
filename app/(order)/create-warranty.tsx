import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { createRequestWarranty } from "../../service/order";
import { getProductColorById } from "../../service/product";

export default function CreateWarrantyScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { orderId, userId, addressId, orderDetails } = route.params as {
        orderId: number;
        userId: string;
        addressId: number;
        orderDetails: any[];
    };

    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
    const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
    const [reasons, setReasons] = useState<{ [key: string]: string }>({});
    const [images, setImages] = useState<{ [key: string]: string[] }>({}); // Mock string array

    useEffect(() => {
        navigation.setOptions({
            title: "Yêu cầu bảo hành",
            headerBackTitle: "Trở lại",
            headerStyle: { backgroundColor: "#fff", shadowColor: "transparent", elevation: 0 },
            headerTitleStyle: { fontWeight: "800", color: "#111827", fontSize: 18 },
            headerTintColor: "#111827",
            headerShadowVisible: false,
        });
        fetchProducts();
    }, [orderId]);

    const fetchProducts = async () => {
        try {
            const enrichedItems = await Promise.all(
                orderDetails.map(async (item: any) => {
                    try {
                        console.log(`Fetching product info for colorId: ${item.productColorId}`);
                        const productRes = await getProductColorById(item.productColorId);
                        // Unwrap axios response: response.data (body) -> body.data (actual payload)
                        const richData = productRes?.data?.data || productRes?.data || productRes;
                        console.log("Rich Data unwrapped:", richData);
                        return {
                            ...item,
                            productData: richData,
                        };

                    } catch (err) {
                        console.warn(`Failed to fetch product ${item.productColorId}`, err);
                        return { ...item, productData: null };
                    }
                })
            );
            setItems(enrichedItems);
        } catch (error) {
            console.error("Error fetching products:", error);
            Alert.alert("Lỗi", "Không thể tải thông tin sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async (warrantyId: string) => {
        if (Platform.OS !== "web") {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Quyền truy cập", "Cần cấp quyền truy cập thư viện ảnh để tải ảnh lên.");
                return;
            }
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const newImage = result.assets[0].uri;
            setImages((prev) => ({
                ...prev,
                [warrantyId]: [...(prev[warrantyId] || []), newImage],
            }));
        }
    };

    const removeImage = (warrantyId: string, index: number) => {
        setImages((prev) => {
            const currentImages = prev[warrantyId] || [];
            const updatedImages = currentImages.filter((_, i) => i !== index);
            return { ...prev, [warrantyId]: updatedImages };
        });
    };

    const handleToggleItem = (warrantyId: number) => {
        setSelectedItems((prev) => ({
            ...prev,
            [warrantyId]: !prev[warrantyId],
        }));
        if (!selectedItems[warrantyId]) {
            setQuantities((prev) => ({ ...prev, [warrantyId]: "1" }));
            setReasons((prev) => ({ ...prev, [warrantyId]: "" }));
            setImages((prev) => ({ ...prev, [warrantyId]: [] })); // empty photos
        }
    };

    const handleSubmit = async () => {
        const itemsToSubmit = items
            .filter((item) => selectedItems[item.id])
            .map((item) => ({
                warrantyId: 0,
                quantity: parseInt(quantities[item.id] || "1"),
                issueDescription: reasons[item.id] || "",
                customerPhotos: images[item.id] && images[item.id].length > 0 ? images[item.id] : ["https://placehold.co/150"],
                productColorId: item.productColorId,
                orderDetailId: item.id
            }));

        if (itemsToSubmit.length === 0) {
            Alert.alert("Chưa chọn sản phẩm", "Vui lòng chọn ít nhất một sản phẩm để bảo hành.");
            return;
        }

        for (const item of itemsToSubmit) {
            if (!item.issueDescription.trim()) {
                Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả lỗi cho sản phẩm đã chọn.");
                return;
            }
        }

        try {
            setSubmitting(true);
            const payload = {
                orderId: orderId,
                addressId: addressId,
                items: itemsToSubmit,
            };

            console.log("Submitting warranty claim:", JSON.stringify(payload, null, 2));
            await createRequestWarranty(payload);

            Alert.alert("Thành công", "Yêu cầu bảo hành đã được gửi.", [
                { text: "Về chi tiết đơn", onPress: () => navigation.goBack() },
            ]);
        } catch (error: any) {
            console.error("Submit warranty error:", error);
            Alert.alert("Lỗi", "Không thể gửi yêu cầu bảo hành. " + (error.response?.data?.message || ""));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
            </View>
        );
    }

    if (items.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Ionicons name="cube-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyText}>Không tìm thấy sản phẩm trong đơn hàng này.</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.subtitle}>Chọn sản phẩm ({items.length})</Text>

                {items.map((item) => {
                    const productData = item.productData; // The data object from JSON
                    const product = productData?.product;
                    const color = productData?.color;
                    const variantImages = productData?.images;

                    const imageUrl = variantImages?.[0]?.image || product?.thumbnailImage || "https://placehold.co/100x100";

                    const isSelected = selectedItems[item.id];

                    return (
                        <View key={item.id} style={[styles.card, isSelected && styles.cardSelected]}>
                            <TouchableOpacity
                                style={styles.cardHeader}
                                onPress={() => handleToggleItem(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                    {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
                                </View>

                                <Image source={{ uri: imageUrl }} style={styles.productThumb} resizeMode="cover" />

                                <View style={styles.productInfo}>
                                    <Text style={styles.productName} numberOfLines={2}>
                                        {product?.name || `Sản phẩm #${item.productColorId}`}
                                    </Text>

                                    <View style={styles.variantRow}>
                                        {color?.hexCode && (
                                            <View style={[styles.colorDot, { backgroundColor: color.hexCode }]} />
                                        )}
                                        <Text style={styles.colorInfo}>
                                            {color?.colorName || "Màu tiêu chuẩn"}
                                        </Text>
                                        <View style={styles.qtyBadgeWrapper}>
                                            <Text style={styles.qtyBadgeText}>x{item.quantity}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.priceRow}>
                                        <Text style={styles.price}>{(item.price || product?.price || 0).toLocaleString()}₫</Text>
                                        {product?.code && <Text style={styles.productCode}> | {product.code}</Text>}
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {isSelected && (
                                <View style={styles.formGroup}>
                                    <View style={styles.formRow}>
                                        <View style={styles.halfInput}>
                                            <Text style={styles.label}>Số lượng lỗi</Text>
                                            <TextInput
                                                style={styles.input}
                                                keyboardType="numeric"
                                                value={quantities[item.id]}
                                                onChangeText={(t) => setQuantities((prev) => ({ ...prev, [item.id]: t }))}
                                                placeholder="1"
                                            />
                                        </View>
                                    </View>

                                    <Text style={styles.label}>Mô tả vấn đề</Text>
                                    <TextInput
                                        style={[styles.input, styles.textArea]}
                                        multiline
                                        placeholder="Vui lòng mô tả chi tiết lỗi sản phẩm..."
                                        placeholderTextColor="#9ca3af"
                                        value={reasons[item.id]}
                                        onChangeText={(t) => setReasons((prev) => ({ ...prev, [item.id]: t }))}
                                    />

                                    {/* Image Upload Section */}
                                    <View style={styles.imageSection}>
                                        <Text style={styles.label}>Hình ảnh/Video thực tế</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageList}>
                                            <TouchableOpacity style={styles.addImageBtn} onPress={() => pickImage(item.id)}>
                                                <Ionicons name="camera" size={24} color="#4b5563" />
                                                <Text style={styles.addImageText}>Thêm ảnh</Text>
                                            </TouchableOpacity>

                                            {images[item.id]?.map((imgUri: string, idx: number) => ( // Added type annotations
                                                <View key={idx} style={styles.imageWrapper}>
                                                    <Image source={{ uri: imgUri }} style={styles.previewImage} />
                                                    <TouchableOpacity
                                                        style={styles.removeImageBtn}
                                                        onPress={() => removeImage(item.id, idx)}
                                                    >
                                                        <Ionicons name="close" size={12} color="#fff" />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            )}
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitButton, Object.values(selectedItems).every(v => !v) && styles.disabledButton]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.submitText}>Gửi yêu cầu bảo hành</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f3f4f6" },
    centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
    content: { flex: 1, padding: 16 },
    subtitle: { fontSize: 16, fontWeight: "800", marginBottom: 16, color: "#111827", textTransform: "uppercase", letterSpacing: 0.5 },
    emptyText: { marginTop: 16, color: "#9ca3af", textAlign: "center", fontSize: 16, maxWidth: 250 },
    backButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: "#fff", borderRadius: 30, borderWidth: 1, borderColor: "#e5e7eb" },
    backButtonText: { color: "#374151", fontWeight: "600" },

    card: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16,
        borderWidth: 1, borderColor: "#e5e7eb",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2
    },
    cardSelected: {
        borderColor: "#16a34a", backgroundColor: "#f0fdf4",
        shadowColor: "#16a34a", shadowOpacity: 0.08,
    },
    cardHeader: { flexDirection: "row", alignItems: "center" },

    // Custom Checkbox
    checkbox: {
        width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#d1d5db",
        marginRight: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#fff"
    },
    checkboxSelected: {
        borderColor: "#16a34a", backgroundColor: "#16a34a"
    },

    productThumb: { width: 64, height: 64, borderRadius: 10, marginRight: 14, backgroundColor: "#f3f4f6" },
    productInfo: { flex: 1, justifyContent: 'center' },
    productName: { fontSize: 15, fontWeight: "700", color: "#1f2937", marginBottom: 4, lineHeight: 20 },

    variantRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
    colorDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    colorInfo: { fontSize: 12, color: "#6b7280", fontWeight: "500", marginRight: 8 },
    qtyBadgeWrapper: { backgroundColor: "#e5e7eb", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 'auto' },
    qtyBadgeText: { fontSize: 11, color: "#374151", fontWeight: "600" },

    priceRow: { flexDirection: 'row', alignItems: 'baseline' },
    price: { fontSize: 14, fontWeight: "700", color: "#111827" },
    productCode: { fontSize: 12, color: "#6b7280", marginLeft: 4 },

    formGroup: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#e2e8f0" },
    formRow: { flexDirection: 'row', marginBottom: 12 },
    halfInput: { flex: 0.5 },

    label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
    input: {
        backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#1f2937"
    },
    textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },

    imageSection: { marginTop: 16 },
    imageList: { flexDirection: 'row' },
    imageWrapper: { marginRight: 12, position: 'relative' },
    previewImage: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#f3f4f6' },
    removeImageBtn: {
        position: 'absolute', top: -5, right: -5,
        backgroundColor: '#ef4444', borderRadius: 10, width: 20, height: 20,
        alignItems: 'center', justifyContent: 'center', zIndex: 10, borderWidth: 1.5, borderColor: '#fff'
    },
    addImageBtn: {
        width: 72, height: 72, borderRadius: 10, borderWidth: 1.5, borderColor: '#d1d5db', borderStyle: 'dashed',
        justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb', marginRight: 12
    },
    addImageText: { fontSize: 11, color: '#6b7280', marginTop: 4, fontWeight: "500" },

    footer: {
        padding: 20, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f3f4f6",
        paddingBottom: 34, elevation: 10, shadowColor: "#000", shadowOffset: { height: -4, width: 0 }, shadowOpacity: 0.05
    },
    submitButton: {
        backgroundColor: "#16a34a", paddingVertical: 16, borderRadius: 14, alignItems: "center",
        shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 4
    },
    disabledButton: { opacity: 0.7, shadowOpacity: 0 },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
