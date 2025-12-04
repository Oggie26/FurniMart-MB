import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getProfileStaff } from "../../../service/delivery";
import { getStoreById } from "../../../service/store";

const DeliveryProfile = () => {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const staff = await getProfileStaff();
            const staffData = staff.data.data;
            setProfile(staffData);

            if (staffData.storeIds && staffData.storeIds.length > 0) {
                const store = await getStoreById(staffData.storeIds[0]);
                setStoreName(store.data.data.name);
            }

            // const statsRes = await getDeliveryStats(staffData.id);
            // setStats(statsRes.data.data);
        } catch (err) {
            console.log("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleLogout = async () => {
        Alert.alert("Đăng xuất", "Bạn có chắc muốn đăng xuất?", [
            { text: "Hủy", style: "cancel" },
            {
                text: "Đăng xuất",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("refreshToken");
                    router.replace("/(auth)");
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F855A" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FAFC" }}>
            <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                {/* PROFILE */}
                {profile && (
                    <View style={styles.profileCard}>
                        <Image
                            source={{
                                uri:
                                    profile.avatar ||
                                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                            }}
                            style={styles.avatar}
                        />
                        <Text style={styles.name}>{profile.fullName}</Text>
                        <View style={styles.roleContainer}>
                            <Ionicons name="bicycle" size={16} color="#2F855A" />
                            <Text style={styles.role}>Nhân viên giao hàng</Text>
                        </View>
                        <Text style={styles.branch}>
                            <Ionicons name="storefront-outline" size={14} color="#718096" />{" "}
                            {storeName}
                        </Text>
                    </View>
                )}

                {/* PERFORMANCE STATS */}
                {stats && (
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Thống kê hiệu suất</Text>

                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{stats.total}</Text>
                                <Text style={styles.statLabel}>Tổng đơn</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: "#38A169" }]}>
                                    {stats.completed}
                                </Text>
                                <Text style={styles.statLabel}>Hoàn thành</Text>
                            </View>
                        </View>

                        <View style={styles.statRow}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: "#3182CE" }]}>
                                    {stats.delivering || 0}
                                </Text>
                                <Text style={styles.statLabel}>Đang giao</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: "#E53E3E" }]}>
                                    {stats.cancelled || 0}
                                </Text>
                                <Text style={styles.statLabel}>Đã hủy</Text>
                            </View>
                        </View>

                        {stats.completed > 0 && stats.total > 0 && (
                            <View style={styles.successRate}>
                                <Text style={styles.successRateLabel}>Tỷ lệ thành công</Text>
                                <Text style={styles.successRateValue}>
                                    {((stats.completed / stats.total) * 100).toFixed(1)}%
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {/* MENU OPTIONS */}
                <View style={styles.menuSection}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="settings-outline" size={24} color="#4A5568" />
                        <Text style={styles.menuText}>Cài đặt</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <Ionicons name="help-circle-outline" size={24} color="#4A5568" />
                        <Text style={styles.menuText}>Trợ giúp</Text>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#E53E3E" />
                        <Text style={[styles.menuText, { color: "#E53E3E" }]}>
                            Đăng xuất
                        </Text>
                        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default DeliveryProfile;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F7FAFC",
    },
    profileCard: {
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 16,
        marginBottom: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: "#2F855A",
        marginBottom: 16,
    },
    name: {
        fontSize: 22,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 8,
    },
    roleContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    role: {
        color: "#2F855A",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    branch: {
        color: "#718096",
        fontSize: 14,
    },
    statsSection: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#2D3748",
        marginBottom: 16,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    statItem: {
        flex: 1,
        alignItems: "center",
        padding: 16,
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        marginHorizontal: 4,
    },
    statValue: {
        fontSize: 28,
        fontWeight: "800",
        color: "#2D3748",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: "#718096",
        fontWeight: "500",
    },
    successRate: {
        backgroundColor: "#F0FFF4",
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#38A169",
    },
    successRateLabel: {
        fontSize: 14,
        color: "#2F855A",
        fontWeight: "600",
        marginBottom: 4,
    },
    successRateValue: {
        fontSize: 32,
        fontWeight: "800",
        color: "#38A169",
    },
    menuSection: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#F7FAFC",
    },
    menuText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        fontWeight: "500",
        color: "#4A5568",
    },
});
