import { getProductColorById } from "@/service/product";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getOrderById } from "../../service/order";

export default function OrderDetail() {
  const route = useRoute();
  const { id } = route.params;
  const [order, setOrder] = useState(null);
  const [productDetails, setProductDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [showProcess, setShowProcess] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchOrderAndProducts = async () => {
      try {
        const res = await getOrderById(id);
        const orderData = res.data;
        setOrder(orderData);

        const productPromises = orderData.orderDetails.map(async (item) => {
          try {
            const res = await getProductColorById(item.productColorId);
            return { id: item.productColorId, data: res.data };
          } catch (err) {
            console.warn(`Lỗi lấy productColor ${item.productColorId}:`, err);
            return { id: item.productColorId, data: null };
          }
        });

        const productResults = await Promise.all(productPromises);
        const productMap = {};
        productResults.forEach(({ id, data }) => {
          productMap[id] = data;
        });
        setProductDetails(productMap);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderAndProducts();
  }, [id]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: showProcess ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showProcess]);

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );

  if (!order)
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Không tìm thấy đơn hàng</Text>
      </View>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "PRE_ORDER":
        return "#9F7AEA";
      case "PENDING":
        return "#718096";
      case "PAYMENT":
        return "#3182CE";
      case "ASSIGN_ORDER_STORE":
        return "#38B2AC";
      case "MANAGER_ACCEPT":
        return "#48BB78";
      case "READY_FOR_INVOICE":
        return "#4299E1";
      case "MANAGER_REJECT":
        return "#F56565";
      case "CONFIRMED":
        return "#38A169";
      case "PACKAGED":
        return "#D69E2E";
      case "SHIPPING":
        return "#805AD5";
      case "DELIVERED":
      case "FINISHED":
      case "COMPLETED":
        return "#16a34a";
      case "CANCELLED":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const getStatusText = (status) => {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng #{order.id}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin người nhận</Text>

        <View style={styles.infoRow}>
          <Ionicons name="person-circle" size={22} color="#16a34a" />
          <Text style={styles.infoText}>{order.user.fullName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color="#16a34a" />
          <Text style={styles.infoText}>{order.user.phone}</Text>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location" size={22} color="#16a34a" />
          <Text style={styles.addressText}>{order.address.addressLine}</Text>
        </View>
      </View>

      {/* Products */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sản phẩm</Text>
        {order.orderDetails.map((item) => {
          const productColor = productDetails[item.productColorId];
          const detail = productColor?.data;
          const product = detail?.product;
          const color = detail?.color;

          const imageUrl =
            productColor?.images?.[0]?.image ||
            product?.thumbnailImage ||
            `https://picsum.photos/seed/${item.productColorId}/120/120`;

          return (
            <View key={item.id} style={styles.productCard}>
              <Image source={{ uri: imageUrl }} style={styles.productImage} />
              <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product?.name || "Đang tải..."}
                </Text>

                {color && (
                  <View style={styles.colorSizeRow}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: color.hexCode || "#ccc" },
                      ]}
                    />
                    <Text style={styles.colorCode}> {color.colorName}</Text>
                  </View>
                )}

                <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
                <Text style={styles.price}>
                  {(item.price * item.quantity).toLocaleString()}₫
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thanh toán</Text>
        <View style={styles.paymentRow}>
          <MaterialIcons name="payment" size={22} color="#16a34a" />
          <View style={styles.paymentMethodBadge}>
            <Text style={styles.paymentMethodText}>
              {order.payment.paymentMethod}
            </Text>
          </View>
          <View
            style={[
              styles.paymentStatusBadge,
              {
                backgroundColor:
                  order.payment.paymentStatus === "PENDING"
                    ? "#fb923c"
                    : "#16a34a",
              },
            ]}
          >
            <Text style={styles.paymentStatusText}>
              {order.payment.paymentStatus === "PENDING"
                ? "Chưa thanh toán"
                : "Đã thanh toán"}
            </Text>
          </View>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng thanh toán</Text>
          <Text style={styles.totalAmount}>
            {order.payment.total.toLocaleString()}₫
          </Text>
        </View>
      </View>

      {/* Timeline */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.timelineHeader}
          onPress={() => setShowProcess(!showProcess)}
        >
          <Text style={styles.sectionTitle}>Lộ trình đơn hàng</Text>
          <Ionicons
            name={showProcess ? "chevron-up" : "chevron-down"}
            size={24}
            color="#16a34a"
          />
        </TouchableOpacity>

        {showProcess && (
          <Animated.View style={{ opacity: fadeAnim }}>
            {order.processOrders.map((p, index) => (
              <View key={p.id} style={styles.timelineItem}>
                <View style={styles.timelineLineContainer}>
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: getStatusColor(p.status) },
                    ]}
                  />
                  {index < order.processOrders.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {getStatusText(p.status)}
                  </Text>
                  <Text style={styles.timelineTime}>
                    {formatDate(p.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </View>

      {/* Tổng cộng */}
      <View style={styles.finalTotalCard}>
        <Text style={styles.finalTotalText}>
          Tổng cộng:{" "}
          <Text style={styles.finalAmount}>
            {order.total.toLocaleString()}₫
          </Text>
        </Text>
      </View>

      {/* QR Code */}
      {order.qrCode && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mã QR đơn hàng</Text>
          <View style={styles.qrContainer}>
            <Image
              source={{ uri: order.qrCode }}
              style={styles.qrImage}
              resizeMode="contain"
            />
            <Text style={styles.qrSubtext}>Quét mã này để xác nhận giao hàng</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.section}>
        {/* Cancel Button - Hide if SHIPPING, DELIVERED, FINISHED, CANCELLED */}
        {!["SHIPPING", "DELIVERED", "FINISHED", "COMPLETED", "CANCELLED"].includes(order.status) && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              // TODO: Implement cancel order API
              alert("Chức năng hủy đơn đang được phát triển");
            }}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.cancelButtonText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}

        {/* Repay Button - Show if VNPAY and not PAID */}
        {order.payment?.paymentMethod === "VNPAY" && order.payment?.paymentStatus !== "PAID" && (
          <TouchableOpacity
            style={styles.repayButton}
            onPress={() => {
              // TODO: Implement VNPay repayment
              alert("Chức năng thanh toán lại đang được phát triển");
            }}
          >
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.repayButtonText}>Thanh toán lại (VNPay)</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  emptyText: { fontSize: 16, color: "#6b7280" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 12,
    padding: 10,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  qrImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#1f2937" },
  statusBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600", color: "#d97706" },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: { fontSize: 17, fontWeight: "600", color: "#1f2937", marginBottom: 10 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoText: { marginLeft: 10, fontSize: 15, color: "#374151" },
  addressRow: { flexDirection: "row", alignItems: "flex-start" },
  addressText: { marginLeft: 10, fontSize: 15, color: "#374151", flex: 1, lineHeight: 22 },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  productImage: { width: 80, height: 80, borderRadius: 12 },
  productInfo: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  productName: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  colorSizeRow: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  colorDot: { width: 16, height: 16, borderRadius: 8 },
  colorCode: { marginLeft: 6, fontSize: 13, color: "#6b7280" },
  quantity: { fontSize: 14, fontWeight: "600", color: "#16a34a" },
  price: { fontSize: 16, fontWeight: "700", color: "#111827" },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentMethodBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  paymentMethodText: { fontSize: 13, color: "#16a34a", fontWeight: "600" },
  paymentStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  paymentStatusText: { fontSize: 12, color: "#fff", fontWeight: "600" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 16, color: "#374151" },
  totalAmount: { fontSize: 18, fontWeight: "700", color: "#111827" },
  timelineHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timelineItem: { flexDirection: "row", marginLeft: 4, marginBottom: 16 },
  timelineLineContainer: { alignItems: "center", width: 30 },
  timelineDot: { width: 14, height: 14, borderRadius: 7, zIndex: 1 },
  timelineLine: {
    width: 2,
    height: 50,
    backgroundColor: "#e5e7eb",
    position: "absolute",
    top: 14,
    left: 6.5,
  },
  timelineContent: { flex: 1, marginLeft: 12 },
  timelineStatus: { fontSize: 15, fontWeight: "600", color: "#1f2937" },
  timelineTime: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  finalTotalCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finalTotalText: { fontSize: 18, color: "#1f2937" },
  finalAmount: { fontSize: 22, fontWeight: "800", color: "#16a34a" },
  qrSubtext: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  repayButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#3182CE",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  repayButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});