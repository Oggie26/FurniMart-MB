"use client";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getOrderByCustomer } from "../../service/order";

const EMPTY_ORDER_IMAGE =
  "https://cdn-icons-png.flaticon.com/512/6134/6134065.png";

type Order = {
  id: number;
  status: string;
  orderDate: string;
  total: number;
  user?: { fullName?: string };
  address?: { fullAddress?: string };
  payment?: { paymentStatus?: string; paymentMethod?: string };
};

type StatusTabProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  text: string | number;
  textStyle?: object;
};

const TABS = [
  { label: "Tất cả", value: "" },
  { label: "Đang xử lý", value: "PRE_ORDER" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

const StatusTab = ({ label, isActive, onPress }: StatusTabProps) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, isActive ? styles.activeTab : {}]}
  >
    <Text style={[styles.tabText, isActive ? styles.activeTabText : {}]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const InfoRow = ({ icon, text, textStyle }: InfoRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color="#6B7280" />
    <Text style={[styles.infoText, textStyle]} numberOfLines={1}>
      {String(text || "")}
    </Text>
  </View>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case "PRE_ORDER":
      return "#9F7AEA"; // tím nhạt
    case "PENDING":
      return "#718096"; // xám
    case "PAYMENT":
      return "#3182CE"; // xanh dương
    case "ASSIGN_ORDER_STORE":
      return "#38B2AC"; // xanh lục lam
    case "MANAGER_ACCEPT":
      return "#48BB78"; // xanh lá
    case "READY_FOR_INVOICE":
      return "#4299E1"; // xanh dương sáng
    case "MANAGER_REJECT":
      return "#F56565"; // đỏ nhạt
    case "CONFIRMED":
      return "#38A169"; // xanh lá đậm
    case "PACKAGED":
      return "#D69E2E"; // vàng
    case "SHIPPING":
      return "#805AD5"; // tím
    case "DELIVERED":
    case "FINISHED":
    case "COMPLETED":
      return "#38a169"; // xanh lá
    case "CANCELLED":
      return "#e53e3e"; // đỏ
    default:
      return "#718096"; // xám
  }
};

const translateStatus = (status: string) => {
  switch (status) {
    case "PRE_ORDER":
      return "Đặt trước";
    case "PENDING":
      return "Chờ xử lý";
    case "PAYMENT":
      return "Chờ thanh toán";
    case "ASSIGN_ORDER_STORE":
      return "Phân cửa hàng";
    case "MANAGER_ACCEPT":
      return "Quản lý chấp nhận";
    case "READY_FOR_INVOICE":
      return "Sẵn sàng xuất hóa đơn";
    case "MANAGER_REJECT":
      return "Quản lý từ chối";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "PACKAGED":
      return "Đã đóng gói";
    case "SHIPPING":
      return "Đang giao hàng";
    case "DELIVERED":
      return "Đã giao";
    case "FINISHED":
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
};

// ====================== COMPONENT CHÍNH ======================
const OrderScreen = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<string>(""); // "" = Tất cả
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, [status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getOrderByCustomer(status, 0, 100);
      setOrders(response.data?.content || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }: { item: Order }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() =>
          router.push({
            pathname: "/(order)/[id]",
            params: { id: item.id },
          })
        }
      >
        {/* Header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Mã đơn #{String(item.id)}</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}
          >
            <Text style={[styles.orderStatus, { color: statusColor }]}>
              {translateStatus(item.status)}
            </Text>
          </View>
        </View>

        {/* Thông tin khách hàng & địa chỉ */}
        <InfoRow
          icon="person-outline"
          text={item.user?.fullName || "Không có tên"}
          textStyle={{ fontWeight: "500" }}
        />
        <InfoRow
          icon="location-outline"
          text={item.address?.fullAddress || "Không có địa chỉ"}
          textStyle={{ color: "#6B7280" }}
        />

        {/* Tổng tiền & phương thức thanh toán */}
        <View style={styles.totalPaymentRow}>
          <View>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalAmount}>
              {String(item.total?.toLocaleString("vi-VN") || "0")} ₫
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.totalLabel}>Thanh toán</Text>
            <Text
              style={[
                styles.paymentStatus,
                {
                  color:
                    item.payment?.paymentStatus === "PAID"
                      ? "#38a169"
                      : "#718096",
                },
              ]}
            >
              {String(item.payment?.paymentMethod || "N/A")}
            </Text>
          </View>
        </View>

        {/* Ngày đặt hàng */}
        <Text style={styles.orderDate}>
          {String(
            new Date(item.orderDate).toLocaleString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  // Khi không có đơn hàng
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: EMPTY_ORDER_IMAGE }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>Không có đơn hàng</Text>
      <Text style={styles.emptySubText}>
        Hãy thử chọn trạng thái khác hoặc quay lại sau nhé.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {TABS.map((tab) => (
            <StatusTab
              key={tab.value}
              label={tab.label}
              isActive={status === tab.value}
              onPress={() => setStatus(tab.value)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Danh sách đơn hàng */}
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: "center", marginTop: 80 }}>
              <ActivityIndicator size="large" color="#2f855a" />
            </View>
          ) : (
            renderEmptyComponent()
          )
        }
        contentContainerStyle={[
          styles.listContainer,
          orders.length === 0 && !loading && { flexGrow: 1 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default OrderScreen;

// ====================== STYLES ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  customHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  headerButton: {
    width: 40,
  },
  tabScrollContainer: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    zIndex: 10,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  activeTab: {
    backgroundColor: "#2f855a",
    borderColor: "#2f855a",
  },
  tabText: {
    color: "#374151",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  orderId: {
    fontWeight: "700",
    fontSize: 18,
    color: "#2d3748",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  orderStatus: {
    fontWeight: "700",
    textTransform: "uppercase",
    fontSize: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
  totalPaymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e53e3e",
  },
  paymentStatus: {
    fontSize: 14,
    fontWeight: "600",
  },
  orderDate: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    color: "#4B5563",
  },
  emptySubText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
