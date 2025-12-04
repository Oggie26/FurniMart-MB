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
    TouchableOpacity,
    View
} from "react-native";
import ProofOfDelivery from "../../../components/delivery/ProofOfDelivery";
import {
    getMockDeliveryData,
    updateDeliveryStatus,
    uploadProofOfDelivery,
} from "../../../service/delivery";



const DeliveryList = () => {
    const [profile, setProfile] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [allDeliveries, setAllDeliveries] = useState([]);
    const [filteredDeliveries, setFilteredDeliveries] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showProofModal, setShowProofModal] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const fetchData = async () => {
        try {
            if (USE_MOCK_DATA) {
                // Use mock data for testing UI
                const mockData = getMockDeliveryData();
                const mockStats = getMockDeliveryStats();

                setProfile({
                    id: "STAFF-001",
                    fullName: "Nhân viên giao hàng",
                    storeIds: ["STORE-HN-001"]
                });
                setStoreName("FurniMart Hà Nội - Chi nhánh Cầu Giấy");
                setStats(mockStats.data);

                // Transform mock data to match expected format
                const orders = mockData.data.map(item => ({
                    id: item.id.toString(),
                    status: item.status,
                    customerName: item.order.user.fullName,
                    phone: item.order.user.phone,
                    shippingAddress: item.order.address.fullAddress,
                    totalAmount: item.order.total,
                    completedAt: item.status === "DELIVERED" ? item.order.orderDate : null,
                    assignedAt: item.assignedAt,
                    notes: item.notes
                }));

                setAllDeliveries(orders);
                filterDeliveries(orders, activeFilter);
            } else {
                // Use real API
                const token = await AsyncStorage.getItem("token");
                if (!token) {
                    throw new Error("No token found");
                }
                const decoded = jwtDecode(token);
                const accountId = decoded.accountId;

                const staff = await getProfileStaff();
                const staffData = staff.data.data;
                setProfile(staffData);

                if (staffData.storeIds && staffData.storeIds.length > 0) {
                    const store = await getStoreById(staffData.storeIds[0]);
                    setStoreName(store.data.data.name);
                }

                const statsRes = await getDeliveryStats(accountId);
                setStats(statsRes.data.data);

                const ordersRes = await getOrderByDeliveryStaff(accountId);
                const orders = ordersRes.data.data || [];
                setAllDeliveries(orders);
                filterDeliveries(orders, activeFilter);
            }
        } catch (err) {
            console.log("Fetch error:", err);
            Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    const filterDeliveries = (orders, filter) => {
        let filtered = [];
        switch (filter) {
            case "PENDING":
                filtered = orders.filter((o) => o.status === "PENDING");
                break;
            case "DELIVERING":
                filtered = orders.filter(
                    (o) => o.status === "PICKED_UP" || o.status === "DELIVERING"
                );
                break;
            case "ALL":
            default:
                filtered = orders.filter(
                    (o) => o.status !== "DELIVERED" && o.status !== "COMPLETED" && o.status !== "CANCELLED"
                );
                break;
        }
        setFilteredDeliveries(filtered);
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, [activeFilter]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        filterDeliveries(allDeliveries, activeFilter);
    }, [activeFilter, allDeliveries]);

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
    };

    const handleStatusUpdate = async (assignmentId, newStatus) => {
        try {
            setUpdatingStatus(true);
            await updateDeliveryStatus(assignmentId, newStatus);
            Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
            await fetchData();
            setShowDetailModal(false);
        } catch (error) {
            Alert.alert("Lỗi", "Không thể cập nhật trạng thái. Vui lòng thử lại.");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleProofSubmit = async (proofData) => {
        try {
            if (!selectedOrder) return;

            await uploadProofOfDelivery(selectedOrder.id, proofData);
            await updateDeliveryStatus(selectedOrder.id, "DELIVERED");

            Alert.alert("Thành công", "Đã hoàn tất giao hàng");
            setShowProofModal(false);
            setShowDetailModal(false);
            await fetchData();
        } catch (error) {
            console.error("Proof submission error:", error);
            throw error;
        }
    };

    const renderStatusBadge = (status) => {
        let color = "#718096";
        let bg = "#EDF2F7";
        let label = status;

        switch (status) {
            case "PICKED_UP":
                color = "#805AD5";
                bg = "#FAF5FF";
                label = "Đã lấy hàng";
                break;
            case "DELIVERING":
                color = "#3182CE";
                bg = "#EBF8FF";
                label = "Đang giao";
                break;
            case "PENDING":
                color = "#D69E2E";
                bg = "#FFFFF0";
                label = "Chờ lấy hàng";
                break;
        }

        return (
            <View style={[styles.badge, { backgroundColor: bg }]}>
                <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
            </View>
        );
    };

    const renderActionButton = (order) => {
        if (order.status === "PENDING") {
            return (
                <TouchableOpacity
                    style={[styles.actionButton, styles.confirmButton]}
                    onPress={() => handleStatusUpdate(order.id, "PICKED_UP")}
                    disabled={updatingStatus}
                >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.confirmButtonText}>Xác nhận lấy hàng</Text>
                </TouchableOpacity>
            );
        } else if (order.status === "PICKED_UP") {
            return (
                <TouchableOpacity
                    style={[styles.actionButton, styles.deliverButton]}
                    onPress={() => handleStatusUpdate(order.id, "DELIVERING")}
                    disabled={updatingStatus}
                >
                    <Ionicons name="bicycle" size={18} color="#fff" />
                    <Text style={styles.confirmButtonText}>Bắt đầu giao</Text>
                </TouchableOpacity>
            );
        } else if (order.status === "DELIVERING") {
            return (
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                    onPress={() => {
                        setSelectedOrder(order);
                        setShowProofModal(true);
                    }}
                >
                    <Ionicons name="camera" size={18} color="#2F855A" />
                    <Text style={styles.viewButtonText}>Hoàn tất giao hàng</Text>
                </TouchableOpacity>
            );
        }
        return null;
    };

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F855A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FAFC" }}>
            <ScrollView
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#2F855A"]}
                    />
                }
            >
                {/* STATS */}
                {stats && (
                    <View style={styles.statGrid}>
                        <View
                            style={[
                                styles.statCard,
                                { backgroundColor: "#fff", borderLeftColor: "#D69E2E" },
                            ]}
                        >
                            <Text style={styles.statNumber}>
                                {allDeliveries.filter((o) => o.status === "PENDING").length}
                            </Text>
                            <Text style={styles.statLabel}>Chờ lấy</Text>
                        </View>

                        <View
                            style={[
                                styles.statCard,
                                { backgroundColor: "#fff", borderLeftColor: "#3182CE" },
                            ]}
                        >
                            <Text style={styles.statNumber}>
                                {allDeliveries.filter(
                                    (o) => o.status === "PICKED_UP" || o.status === "DELIVERING"
                                ).length}
                            </Text>
                            <Text style={styles.statLabel}>Đang giao</Text>
                        </View>

                        <View
                            style={[
                                styles.statCard,
                                { backgroundColor: "#fff", borderLeftColor: "#38A169" },
                            ]}
                        >
                            <Text style={styles.statNumber}>{stats.completed || 0}</Text>
                            <Text style={styles.statLabel}>Hoàn thành</Text>
                        </View>
                    </View>
                )}

                {/* FILTERS */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            activeFilter === "ALL" && styles.filterChipActive,
                        ]}
                        onPress={() => handleFilterChange("ALL")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                activeFilter === "ALL" && styles.filterTextActive,
                            ]}
                        >
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            activeFilter === "PENDING" && styles.filterChipActive,
                        ]}
                        onPress={() => handleFilterChange("PENDING")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                activeFilter === "PENDING" && styles.filterTextActive,
                            ]}
                        >
                            Chờ lấy
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.filterChip,
                            activeFilter === "DELIVERING" && styles.filterChipActive,
                        ]}
                        onPress={() => handleFilterChange("DELIVERING")}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                activeFilter === "DELIVERING" && styles.filterTextActive,
                            ]}
                        >
                            Đang giao
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* DELIVERIES LIST */}
                <View style={styles.deliveriesContainer}>
                    {filteredDeliveries.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="cube-outline" size={48} color="#CBD5E0" />
                            <Text style={styles.emptyText}>Không có đơn hàng nào</Text>
                        </View>
                    ) : (
                        filteredDeliveries.map((order, index) => (
                            <View key={order.id || index} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <Text style={styles.orderId}>
                                        #{order.id?.slice(-6).toUpperCase() || "ORDER"}
                                    </Text>
                                    {renderStatusBadge(order.status || "PENDING")}
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="person-outline"
                                        size={16}
                                        color="#718096"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.infoText}>
                                        {order.customerName || "Khách lẻ"}
                                    </Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="call-outline"
                                        size={16}
                                        color="#718096"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.infoText}>{order.phone || "N/A"}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Ionicons
                                        name="location-outline"
                                        size={16}
                                        color="#718096"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.infoText} numberOfLines={2}>
                                        {order.shippingAddress || "Tại cửa hàng"}
                                    </Text>
                                </View>

                                {order.totalAmount && (
                                    <View style={styles.infoRow}>
                                        <Ionicons
                                            name="cash-outline"
                                            size={16}
                                            color="#718096"
                                            style={styles.icon}
                                        />
                                        <Text style={[styles.infoText, { fontWeight: "600" }]}>
                                            {order.totalAmount.toLocaleString("vi-VN")}đ
                                        </Text>
                                    </View>
                                )}

                                {renderActionButton(order)}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            <ProofOfDelivery
                visible={showProofModal}
                onClose={() => setShowProofModal(false)}
                onSubmit={handleProofSubmit}
                orderId={selectedOrder?.id}
            />
        </SafeAreaView>
    );
};

export default DeliveryList;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F7FAFC",
    },
    statGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 16,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    statCard: {
        width: "31%",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: { fontSize: 24, fontWeight: "800", color: "#2D3748" },
    statLabel: {
        marginTop: 4,
        color: "#718096",
        fontSize: 12,
        fontWeight: "500",
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#F7FAFC",
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    filterChipActive: {
        backgroundColor: "#2F855A",
        borderColor: "#2F855A",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#718096",
    },
    filterTextActive: {
        color: "#fff",
    },
    deliveriesContainer: {
        paddingHorizontal: 20,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
    },
    emptyText: {
        marginTop: 12,
        color: "#A0AEC0",
        fontSize: 16,
    },
    orderCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    orderHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    orderId: {
        fontSize: 16,
        fontWeight: "700",
        color: "#2D3748",
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    divider: {
        height: 1,
        backgroundColor: "#EDF2F7",
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    icon: {
        marginRight: 8,
        width: 20,
    },
    infoText: {
        color: "#4A5568",
        fontSize: 14,
        flex: 1,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    confirmButton: {
        backgroundColor: "#2F855A",
    },
    deliverButton: {
        backgroundColor: "#3182CE",
    },
    viewButton: {
        backgroundColor: "#F0FFF4",
        borderWidth: 1,
        borderColor: "#2F855A",
    },
    confirmButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    viewButtonText: {
        color: "#2F855A",
        fontWeight: "600",
        fontSize: 14,
    },
});
