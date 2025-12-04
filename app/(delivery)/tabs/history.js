import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { getOrderByDeliveryStaff } from "../../../service/delivery";
const SHIPPER_ID = "5ef25bc8-d8d2-43d4-87af-4b99310baef2";

const DeliveryHistory = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            console.log("Fetching delivery history...");
            const response = await getOrderByDeliveryStaff(SHIPPER_ID);
            const rawData = response.data || [];
            const orders = Array.isArray(rawData)
                ? rawData.map(item => ({
                    id: item.id?.toString(),
                    orderId: item.order?.id?.toString(),
                    status: item.status,
                    customerName: item.order?.address?.name || "Khách hàng",
                    phone: item.order?.address?.phone || "",
                    addressLine: item.order?.address?.fullAddress || "Địa chỉ không xác định",
                    totalAmount: item.order?.total || 0,
                    completedAt: item.order?.orderDate || new Date().toISOString(),
                    notes: item.notes || "",
                }))
                : [];
            setDeliveries(orders);
        } catch (err) {
            console.error("Error fetching history:", err);
            Alert.alert("Lỗi", "Không thể tải lịch sử giao hàng.");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const renderStatusBadge = (status) => {
        let color = "#718096";
        let bg = "#EDF2F7";
        let label = status;
        switch (status) {
            case "COMPLETED":
            case "DELIVERED":
                color = "#38A169";
                bg = "#F0FFF4";
                label = "Hoàn thành";
                break;
            case "CANCELLED":
                color = "#E53E3E";
                bg = "#FFF5F5";
                label = "Đã hủy";
                break;
            case "ASSIGNED":
                color = "#3182CE";
                bg = "#EBF8FF";
                label = "Đã phân công";
                break;
            default:
                label = status;
        }
        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F855A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F AFC" }}>
            <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#2F855A"]}
                    />
                }
            >
                {deliveries.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="time-outline" size={48} color="#CBD5E0" />
                        <Text style={styles.emptyText}>Chưa có lịch sử giao hàng</Text>
                    </View>
                ) : (
                    deliveries.map((order, index) => (
                        <View key={order.id || index} style={styles.orderCard}>
                            <View style={styles.orderHeader}>
                                <Text style={styles.orderId}>#{order.id ? order.id.slice(-6).toUpperCase() : "ORDER"}</Text>
                                {renderStatusBadge(order.status)}
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.infoRow}>
                                <Ionicons name="person-outline" size={16} color="#718096" style={styles.icon} />
                                <Text style={styles.infoText}>{order.customerName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={16} color="#718096" style={styles.icon} />
                                <Text style={styles.infoText} numberOfLines={2}>{order.addressLine}</Text>
                            </View>
                            {order.totalAmount > 0 && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="cash-outline" size={16} color="#718096" style={styles.icon} />
                                    <Text style={[styles.infoText, { fontWeight: "600", color: "#2F855A" }]}>{order.totalAmount.toLocaleString("vi-VN")}đ</Text>
                                </View>
                            )}
                            {order.completedAt && (
                                <View style={styles.infoRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#718096" style={styles.icon} />
                                    <Text style={styles.infoText}>{new Date(order.completedAt).toLocaleDateString("vi-VN")}</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default DeliveryHistory;

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F7FAFC" },
    emptyState: { alignItems: "center", justifyContent: "center", padding: 40, marginTop: 60 },
    emptyText: { marginTop: 12, color: "#A0AEC0", fontSize: 16 },
    orderCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: "#E2E8F0" },
    orderHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    orderId: { fontSize: 16, fontWeight: "700", color: "#2D3748" },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 12, fontWeight: "600" },
    divider: { height: 1, backgroundColor: "#EDF2F7", marginBottom: 12 },
    infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    icon: { marginRight: 8, width: 20 },
    infoText: { color: "#4A5568", fontSize: 14, flex: 1 },
});