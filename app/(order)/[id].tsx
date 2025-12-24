import { getProductColorById } from "@/service/product";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AnimatePresence, MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { cancelOrder, getOrderById } from "../../service/order";


export default function OrderDetail() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route?.params as { id: string | number };
  const [order, setOrder] = useState<any>(null);
  const [productDetails, setProductDetails] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"INFO" | "TIMELINE">("INFO");

  useEffect(() => {
    const fetchOrderAndProducts = async () => {
      try {
        const res = await getOrderById(id);
        const orderData = res.data;
        setOrder(orderData);

        const productPromises = orderData.orderDetails.map(async (item: any) => {
          try {
            const res = await getProductColorById(item.productColorId);
            return { id: item.productColorId, data: res.data };
          } catch (err) {
            console.warn(`Lỗi lấy productColor ${item.productColorId}:`, err);
            return { id: item.productColorId, data: null };
          }
        });

        const productResults = await Promise.all(productPromises);
        const productMap: any = {};
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

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
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

  const formatDate = (dateString: any) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDeadline = (dateString: any) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    date.setDate(date.getDate() + 2);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Xác nhận hủy",
      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      [
        { text: "Bỏ qua", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await cancelOrder(order.id, "Khách hàng yêu cầu hủy qua Mobile App");

              setOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));

              Alert.alert("Thành công", "Đơn hàng đã được hủy.");
            } catch (error) {
              console.error("Cancel order error:", error);
              Alert.alert("Lỗi", "Không thể hủy đơn hàng lúc này.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const hasWarranty = ["FINISHED", "COMPLETED", "DELIVERED"].includes(order.status);
  const hasInvoice = !!order.pdfFilePath;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Đơn hàng #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.orderDate)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "INFO" && styles.activeTabButton]}
          onPress={() => setActiveTab("INFO")}
        >
          <Text style={[styles.tabText, activeTab === "INFO" && styles.activeTabText]}>Chi tiết</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "TIMELINE" && styles.activeTabButton]}
          onPress={() => setActiveTab("TIMELINE")}
        >
          <Text style={[styles.tabText, activeTab === "TIMELINE" && styles.activeTabText]}>Lộ trình</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <AnimatePresence exitBeforeEnter>
          {activeTab === "INFO" && (
            <MotiView
              key="info"
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: 300 }}
            >
              {/* Receiver Info */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
                  {order.deadline && (
                    <View style={styles.deadlineBadge}>
                      <Ionicons name="time-outline" size={14} color="#dc2626" />
                      <Text style={styles.deadlineText}>Dự kiến: {calculateDeadline(order.deadline)}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name="person" size={16} color="#16a34a" />
                  </View>
                  <Text style={styles.infoText}>{order.user?.fullName}</Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name="call" size={16} color="#16a34a" />
                  </View>
                  <Text style={styles.infoText}>{order.user?.phone}</Text>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name="location" size={16} color="#16a34a" />
                  </View>
                  <Text style={styles.addressText}>{order.address?.fullAddress || order.address?.addressLine}</Text>
                </View>
              </View>

              {/* Products */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sản phẩm</Text>
                {order.orderDetails.map((item: any) => {
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
                            <View style={[styles.colorDot, { backgroundColor: color.hexCode || "#ccc" }]} />
                            <Text style={styles.colorCode}> {color.colorName}</Text>
                          </View>
                        )}
                        <View style={styles.priceRow}>
                          <Text style={styles.price}>
                            {(item.price || 0).toLocaleString()}₫
                          </Text>
                          <Text style={styles.quantity}>x{item.quantity}</Text>
                        </View>
                        <Text style={styles.itemTotal}>
                          {((item.price || 0) * (item.quantity || 0)).toLocaleString()}₫
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Payment Info */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Thanh toán</Text>
                <View style={styles.paymentInfoContainer}>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentLabel}>Tổng tiền hàng</Text>
                    <Text style={styles.paymentValue}>{(order.total || 0).toLocaleString()}₫</Text>
                  </View>
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.paymentLabel}>Phí vận chuyển</Text>
                    <Text style={styles.paymentValue}>Miễn phí</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.paymentDetailRow}>
                    <Text style={styles.totalLabel}>Thành tiền</Text>
                    <Text style={styles.totalAmount}>{(order.payment?.total || order.total || 0).toLocaleString()}₫</Text>
                  </View>

                  <View style={styles.paymentMethodsRow}>
                    <View style={styles.methodBadge}>
                      <Text style={styles.methodText}>{order.payment?.paymentMethod}</Text>
                    </View>
                    <Text style={[
                      styles.paymentStatusText,
                      { color: order.payment?.paymentStatus === "PAID" ? "#16a34a" : "#ca8a04" }
                    ]}>
                      {order.payment?.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Actions Section (Invoice & Warranty) */}
              {(hasInvoice || hasWarranty) && (
                <View style={[styles.section, styles.actionSection]}>
                  <Text style={styles.sectionTitle}>Tài liệu đơn hàng</Text>
                  <View style={styles.buttonGrid}>
                    {hasInvoice && (
                      <TouchableOpacity
                        style={[styles.docButton, styles.invoiceButton]}
                        onPress={() => Linking.openURL(order.pdfFilePath)}
                      >
                        <Ionicons name="document-text-outline" size={24} color="#ef4444" />
                        <Text style={[styles.docButtonText, { color: "#ef4444" }]}>Xem hóa đơn</Text>
                      </TouchableOpacity>
                    )}

                    {hasWarranty && (
                      <TouchableOpacity
                        style={[styles.docButton, styles.warrantyButton]}
                        onPress={() => {
                          if (order.warrantyClaimId) {
                            Alert.alert("Bảo hành điện tử", `Mã bảo hành: ${order.warrantyClaimId}`);
                          } else {
                            Alert.alert("Bảo hành", "Sản phẩm được bảo hành chính hãng. Vui lòng giữ hóa đơn.");
                          }
                        }}
                      >
                        <Ionicons name="shield-checkmark-outline" size={24} color="#16a34a" />
                        <Text style={[styles.docButtonText, { color: "#16a34a" }]}>Thông tin bảo hành</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Order Actions (Cancel / Repay) */}
              <View style={styles.bottomActions}>
                {(["FINISHED", "COMPLETED", "DELIVERED"].includes(order.status)) && !order.warrantyClaimId && (
                  <TouchableOpacity
                    style={styles.warrantyRequestButton}
                    onPress={() => {
                      // @ts-ignore
                      navigation.navigate('create-warranty', {
                        orderId: order.id,
                        userId: order.userId || order.user?.id,
                        addressId: order.address?.id,
                        orderDetails: order.orderDetails
                      });
                    }}
                  >
                    <Ionicons name="shield-checkmark-outline" size={20} color="#fff" />
                    <Text style={styles.warrantyRequestText}>Yêu cầu bảo hành</Text>
                  </TouchableOpacity>
                )}

                {!["SHIPPING", "DELIVERED", "FINISHED", "COMPLETED", "CANCELLED"].includes(order.status) && (
                  <TouchableOpacity style={styles.cancelFullButton} onPress={handleCancelOrder}>
                    <Text style={styles.cancelFullButtonText}>Hủy đơn hàng</Text>
                  </TouchableOpacity>
                )}

                {order.payment?.paymentMethod === "VNPAY" && order.payment?.paymentStatus !== "PAID" && (
                  <TouchableOpacity
                    style={styles.repayFullButton}
                    onPress={() => alert("Tính năng đang phát triển")}
                  >
                    <Text style={styles.repayFullButtonText}>Thanh toán ngay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </MotiView>
          )}

          {activeTab === "TIMELINE" && (
            <MotiView
              key="timeline"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 20 }}
              transition={{ type: "timing", duration: 300 }}
              style={styles.timelineContainer}
            >
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Chi tiết hành trình</Text>
                {/* Timeline List */}
                {order.processOrders?.slice().reverse().map((p: any, index: number, arr: any[]) => (
                  <View key={p.id} style={styles.timelineItem}>
                    {/* Left Time Column */}
                    <View style={styles.timelineTimeCol}>
                      <Text style={styles.timeText}>{new Date(p.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</Text>
                      <Text style={styles.dateText}>{new Date(p.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}</Text>
                    </View>

                    {/* Middle Line Column */}
                    <View style={styles.timelineLineCol}>
                      <View style={[styles.timelineDot, { backgroundColor: getStatusColor(p.status) }]} />
                      {index < arr.length - 1 && <View style={styles.timelineConnector} />}
                    </View>

                    {/* Right Content Column */}
                    <View style={styles.timelineContentCol}>
                      <Text style={[styles.timelineStatusTitle, { color: getStatusColor(p.status) }]}>
                        {getStatusText(p.status)}
                      </Text>
                      <Text style={styles.timelineDesc}>
                        Đơn hàng đã chuyển sang trạng thái {getStatusText(p.status).toLowerCase()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f3f4f6" },
  emptyText: { fontSize: 16, color: "#6b7280" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    paddingTop: 40, // Adjust for status bar if needed handled by SafeArea
  },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  orderDate: { fontSize: 13, color: "#6b7280", marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTabButton: {
    borderBottomColor: "#16a34a",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6b7280",
  },
  activeTabText: {
    color: "#16a34a",
    fontWeight: "700",
  },

  contentScroll: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deadlineText: { fontSize: 11, color: '#e11d48', fontWeight: '600', marginLeft: 4 },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  iconBox: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: "#f0fdf4",
    alignItems: "center", justifyContent: "center", marginRight: 12
  },
  infoText: { fontSize: 14, color: "#374151", fontWeight: "500" },
  addressText: { fontSize: 14, color: "#374151", flex: 1, lineHeight: 20 },

  productCard: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 16,
  },
  productImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: "#f3f4f6" },
  productInfo: { flex: 1, marginLeft: 12 },
  productName: { fontSize: 15, fontWeight: "600", color: "#1f2937", marginBottom: 4 },
  colorSizeRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  colorDot: { width: 12, height: 12, borderRadius: 6, marginRight: 6, borderWidth: 1, borderColor: "#e5e7eb" },
  colorCode: { fontSize: 12, color: "#6b7280" },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { fontSize: 14, fontWeight: "500", color: "#1f2937" },
  quantity: { fontSize: 13, color: "#6b7280" },
  itemTotal: { fontSize: 14, fontWeight: "700", color: "#16a34a", alignSelf: "flex-end", marginTop: 4 },

  paymentInfoContainer: { gap: 10 },
  paymentDetailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  paymentLabel: { fontSize: 14, color: "#6b7280" },
  paymentValue: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  totalAmount: { fontSize: 18, fontWeight: "800", color: "#16a34a" },
  paymentMethodsRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 8, backgroundColor: "#f9fafb", padding: 10, borderRadius: 8
  },
  methodBadge: { backgroundColor: "#dbeafe", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  methodText: { fontSize: 12, fontWeight: "600", color: "#1e40af" },
  paymentStatusText: { fontSize: 13, fontWeight: "600" },

  actionSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  docButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    gap: 6,
  },
  invoiceButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fee2e2',
  },
  warrantyButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#dcfce7',
  },
  docButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  bottomActions: {
    paddingBottom: 40,
    gap: 12,
  },
  cancelFullButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ef4444",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelFullButtonText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
  repayFullButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  repayFullButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  warrantyRequestButton: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  warrantyRequestText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  // Timeline Styles
  timelineContainer: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineTimeCol: {
    width: 60,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  timeText: { fontSize: 13, fontWeight: "700", color: "#374151" },
  dateText: { fontSize: 11, color: "#9ca3af" },
  timelineLineCol: {
    alignItems: "center",
    width: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 10,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  timelineContentCol: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 10,
  },
  timelineStatusTitle: {
    fontSize: 14, fontWeight: "700", marginBottom: 2,
  },
  timelineDesc: {
    fontSize: 13, color: "#6b7280", lineHeight: 18,
  },
});
