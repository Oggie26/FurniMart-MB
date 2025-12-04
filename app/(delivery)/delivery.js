import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import ProofOfDelivery from "../../components/delivery/ProofOfDelivery";
import { uploadImageToCloudinary } from "../../service/cloudinanry";
import {
  confirmDeliveryAssignment,
  confirmDeliveryAssignmentQRScan,
  getOrderByDeliveryStaff,
  getProfileStaff,
  updateDeliveryStatus
} from "../../service/delivery";
import {
  registerForPushNotifications,
  setupNotificationListeners,
} from "../../service/notifications";
import { getStoreById } from "../../service/store";

const DeliveryStaffDashboard = () => {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [stats, setStats] = useState(null);
  const [allDeliveries, setAllDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchData = async () => {
    try {
      const staff = await getProfileStaff();
      const staffData = staff.data.data;
      setProfile(staffData);

      if (staffData.storeIds && staffData.storeIds.length > 0) {
        const store = await getStoreById(staffData.storeIds[0]);
        setStoreName(store.data.data.name);
      }

      const ordersRes = await getOrderByDeliveryStaff(staffData.id);
      const rawOrders = ordersRes.data || [];

      // Map dữ liệu từ API
      const orders = rawOrders.map(item => ({
        id: item.id.toString(),
        // Giữ nguyên status gốc (ASSIGNED, PREPARING, READY, IN_TRANSIT...)
        status: item.status,

        // Lấy thông tin khách hàng từ address
        customerName: item.order?.address?.name || "Khách lẻ",
        phone: item.order?.address?.phone || "N/A",
        shippingAddress: item.order?.address?.fullAddress || item.order?.address?.addressLine || "Địa chỉ không xác định",

        totalAmount: item.order?.total,

        items: item.order?.orderDetails?.map(detail => ({
          name: detail.productColor?.product?.name || "Sản phẩm",
          color: detail.productColor?.color?.colorName || "",
          quantity: detail.quantity,
          price: detail.price,
          // Lấy ảnh đầu tiên trong mảng images
          image: detail.productColor?.images?.[0]?.image || "https://via.placeholder.com/150"
        })) || [],

        originalOrderId: item.order?.id,
        orderId: item.order?.id,
        qrCode: item.order?.qrCode || null, // QR code for delivery confirmation

        // Delivery proof data
        deliveryPhotos: item.deliveryPhotos || [],
        customerSignature: item.customerSignature || null,
        deliveryNotes: item.deliveryNotes || "",

        // Payment info
        paymentMethod: item.order?.paymentMethod,
        paymentStatus: item.order?.paymentStatus,
      }));

      setAllDeliveries(orders);

      // Tính toán thống kê
      const statsCalculated = {
        total: orders.length,
        completed: orders.filter(o => o.status === 'DELIVERED' || o.status === 'COMPLETED').length,
        cancelled: orders.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED').length,
      };
      setStats(statsCalculated);

      filterDeliveries(orders, activeTab);
    } catch (err) {
      console.log("Fetch error:", err);
      Alert.alert("Lỗi", "Không thể tải dữ liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Logic lọc đơn hàng theo Tab
  const filterDeliveries = (orders, tab) => {
    let filtered = [];
    switch (tab) {
      case "PENDING":
        // Tab Chờ lấy: Bao gồm các trạng thái trước khi đi giao (ASSIGNED, PREPARING, READY)
        filtered = orders.filter((o) =>
          o.status === "ASSIGNED" ||
          o.status === "PREPARING" ||
          o.status === "READY"
        );
        break;
      case "DELIVERING":
        // Tab Đang giao: Chỉ bao gồm IN_TRANSIT
        filtered = orders.filter((o) => o.status === "IN_TRANSIT");
        break;
      case "COMPLETED":
        filtered = orders.filter(
          (o) => o.status === "DELIVERED" || o.status === "COMPLETED" || o.status === "CANCELLED" || o.status === "REJECTED"
        );
        break;
      default:
        filtered = orders;
    }
    setFilteredDeliveries(filtered);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    registerForPushNotifications();
    const cleanup = setupNotificationListeners((notification) => {
      fetchData();
    });
    return cleanup;
  }, []);

  useEffect(() => {
    filterDeliveries(allDeliveries, activeTab);
  }, [activeTab, allDeliveries]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
      setUpdatingStatus(true);
      await updateDeliveryStatus(assignmentId, newStatus);
      Alert.alert("Thành công", "Cập nhật trạng thái thành công");
      await fetchData();
      setShowDetailModal(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái. Vui lòng thử lại.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenDetailModal = async (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleProofSubmit = async (proofData) => {
    try {
      if (!selectedOrder) return;

      setUpdatingStatus(true);

      // Upload delivery photo to Cloudinary (always required)
      const uploadedImageUrl = proofData.image
        ? await uploadImageToCloudinary(proofData.image)
        : null;

      // Step 1: Always call confirmDeliveryAssignment first to save photos/notes
      await confirmDeliveryAssignment({
        orderId: selectedOrder.orderId,
        deliveryPhotos: uploadedImageUrl ? [uploadedImageUrl] : [],
        deliveryNotes: proofData.notes || "",
      });

      // Step 2: Call confirmDeliveryAssignmentQRScan based on method
      if (proofData.confirmationMethod === 'qr' && proofData.scannedQR) {
        // Method 1: QR Scan confirmation
        await confirmDeliveryAssignmentQRScan({
          qrCode: proofData.scannedQR,
          customerSignature: "", // QR method doesn't need signature, send empty string
        });
      } else if (proofData.confirmationMethod === 'signature' && proofData.signature) {
        // Method 2: Signature confirmation
        // Upload signature to Cloudinary
        const uploadedSignatureUrl = await uploadImageToCloudinary(proofData.signature);

        // Call QR Scan API with stored QR code and signature
        if (selectedOrder.qrCode) {
          await confirmDeliveryAssignmentQRScan({
            qrCode: selectedOrder.qrCode,
            customerSignature: uploadedSignatureUrl || "",
          });
        } else {
          console.warn("Order missing QR code, signature might not be linked via QR API");
        }
      } else {
        Alert.alert("Lỗi", "Phương thức xác nhận không hợp lệ");
        return;
      }

      Alert.alert("Thành công", "Đã hoàn tất giao hàng thành công!");
      setShowProofModal(false);
      setShowDetailModal(false);
      await fetchData();
    } catch (error) {
      console.error("Proof submission error:", error);
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể xác nhận giao hàng. Vui lòng thử lại.");
      throw error;
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Hiển thị Badge trạng thái
  const renderStatusBadge = (status) => {
    let color = "#718096";
    let bg = "#EDF2F7";
    let label = status;

    switch (status) {
      case "PRE_ORDER":
        color = "#9F7AEA"; // Tím nhạt
        bg = "#FAF5FF";
        label = "Đặt trước";
        break;
      case "PENDING":
        color = "#718096"; // Xám
        bg = "#EDF2F7";
        label = "Chờ xử lý";
        break;
      case "PAYMENT":
        color = "#3182CE"; // Xanh dương
        bg = "#EBF8FF";
        label = "Chờ thanh toán";
        break;
      case "ASSIGN_ORDER_STORE":
        color = "#38B2AC"; // Xanh lục lam
        bg = "#E6FFFA";
        label = "Phân cửa hàng";
        break;
      case "MANAGER_ACCEPT":
        color = "#48BB78"; // Xanh lá
        bg = "#F0FFF4";
        label = "Quản lý chấp nhận";
        break;
      case "READY_FOR_INVOICE":
        color = "#4299E1"; // Xanh dương sáng
        bg = "#EBF8FF";
        label = "Sẵn sàng xuất hóa đơn";
        break;
      case "MANAGER_REJECT":
        color = "#F56565"; // Đỏ nhạt
        bg = "#FFF5F5";
        label = "Quản lý từ chối";
        break;
      case "CONFIRMED":
        color = "#38A169"; // Xanh lá đậm
        bg = "#F0FFF4";
        label = "Đã xác nhận";
        break;
      case "PACKAGED":
        color = "#D69E2E"; // Vàng
        bg = "#FFFFF0";
        label = "Đã đóng gói";
        break;
      case "SHIPPING":
      case "IN_TRANSIT":
        color = "#805AD5"; // Tím
        bg = "#FAF5FF";
        label = "Đang giao hàng";
        break;
      case "ASSIGNED":
        color = "#3182CE"; // Xanh dương
        bg = "#EBF8FF";
        label = "Mới phân công";
        break;
      case "PREPARING":
        color = "#D69E2E"; // Vàng đất
        bg = "#FFFFF0";
        label = "Đang chuẩn bị";
        break;
      case "READY":
        color = "#DD6B20"; // Cam đậm
        bg = "#FFFAF0";
        label = "Sẵn sàng lấy";
        break;
      case "FINISHED":
      case "COMPLETED":
      case "DELIVERED":
        color = "#38A169";
        bg = "#F0FFF4";
        label = "Hoàn thành";
        break;
      case "CANCELLED":
      case "REJECTED":
        color = "#E53E3E";
        bg = "#FFF5F5";
        label = "Đã hủy";
        break;
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: color }]}>{label}</Text>
      </View>
    );
  };

  // Hiển thị Nút bấm hành động
  const renderActionButton = (order) => {
    // 1. Nếu đơn hàng đã SẴN SÀNG (READY) -> Hiện nút Lấy hàng
    if (order.status === "READY") {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.confirmButton]}
          onPress={() => handleStatusUpdate(order.id, "IN_TRANSIT")}
          disabled={updatingStatus}
        >
          <Ionicons name="cube" size={18} color="#fff" />
          <Text style={styles.confirmButtonText}>Xác nhận lấy hàng</Text>
        </TouchableOpacity>
      );
    }

    // 2. Nếu đơn hàng ĐANG GIAO (IN_TRANSIT) -> Hiện nút Hoàn tất
    else if (order.status === "IN_TRANSIT") {
      return (
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleOpenDetailModal(order)}
        >
          <Ionicons name="checkmark-done-circle" size={18} color="#2F855A" />
          <Text style={styles.viewButtonText}>Hoàn tất giao hàng</Text>
        </TouchableOpacity>
      );
    }

    // 3. Nếu đang chuẩn bị -> Thông báo chờ
    else if (order.status === "ASSIGNED" || order.status === "PREPARING") {
      return (
        <View style={styles.waitMessageContainer}>
          <Text style={styles.waitMessageText}>
            <Ionicons name="time-outline" size={14} /> Đang chờ cửa hàng đóng gói...
          </Text>
        </View>
      )
    }

    return null;
  };

  const renderOrderDetailModal = () => {
    if (!selectedOrder) return null;

    return (
      <Modal
        visible={showDetailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={28} color="#2D3748" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Mã đơn hàng</Text>
                <Text style={styles.detailValue}>
                  #{selectedOrder.orderId?.toString()}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Trạng thái</Text>
                {renderStatusBadge(selectedOrder.status)}
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Khách hàng</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.customerName}
                </Text>
                <Text style={styles.detailSubValue}>
                  {selectedOrder.phone}
                </Text>
              </View>

              <View style={styles.detailSection}>
                <Text style={styles.detailLabel}>Địa chỉ giao hàng</Text>
                <Text style={styles.detailValue}>
                  {selectedOrder.shippingAddress}
                </Text>
              </View>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Sản phẩm</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      {item.image && (
                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                      )}
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        {item.color ? <Text style={styles.itemColor}>Màu: {item.color}</Text> : null}
                        <Text style={{ fontSize: 12, color: '#718096' }}>x{item.quantity}</Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        {item.price?.toLocaleString("vi-VN")}đ
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedOrder.totalAmount && (
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tổng tiền thu hộ (COD)</Text>
                  <Text style={styles.totalAmount}>
                    {selectedOrder.totalAmount.toLocaleString("vi-VN")}đ
                  </Text>
                </View>
              )}

              {/* Delivery Proof Section - Only show for DELIVERED/COMPLETED orders */}
              {(selectedOrder.status === "DELIVERED" || selectedOrder.status === "COMPLETED") && (
                <>
                  {selectedOrder.deliveryPhotos && selectedOrder.deliveryPhotos.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Ảnh giao hàng</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {selectedOrder.deliveryPhotos.map((photo, index) => (
                          <Image
                            key={index}
                            source={{ uri: photo }}
                            style={styles.deliveryPhoto}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                  {selectedOrder.customerSignature && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Chữ ký khách hàng</Text>
                      <Image
                        source={{ uri: selectedOrder.customerSignature }}
                        style={styles.signatureImage}
                        resizeMode="contain"
                      />
                    </View>
                  )}

                  {selectedOrder.deliveryNotes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Ghi chú giao hàng</Text>
                      <Text style={styles.detailValue}>{selectedOrder.deliveryNotes}</Text>
                    </View>
                  )}
                </>
              )}

              {selectedOrder.status === "IN_TRANSIT" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.completeButton]}
                  onPress={() => {
                    setShowDetailModal(false);
                    setTimeout(() => {
                      setShowProofModal(true);
                    }, 500);
                  }}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="camera" size={20} color="#fff" />
                      <Text style={styles.confirmButtonText}>
                        Bằng chứng giao hàng
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {selectedOrder.status === "READY" && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.confirmButton]}
                  onPress={() => {
                    handleStatusUpdate(selectedOrder.id, "IN_TRANSIT");
                    setShowDetailModal(false);
                  }}
                  disabled={updatingStatus}
                >
                  <Ionicons name="cube" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Xác nhận lấy hàng</Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button - Hide if SHIPPING (IN_TRANSIT), DELIVERED, COMPLETED (FINISHED), CANCELLED */}
              {!["IN_TRANSIT", "DELIVERED", "COMPLETED", "FINISHED", "CANCELLED", "REJECTED"].includes(selectedOrder.status) && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#E53E3E", marginTop: 12 }]}
                  onPress={() => {
                    Alert.alert(
                      "Hủy đơn hàng",
                      "Bạn có chắc chắn muốn hủy đơn hàng này không?",
                      [
                        { text: "Không", style: "cancel" },
                        {
                          text: "Hủy đơn",
                          style: "destructive",
                          onPress: () => handleStatusUpdate(selectedOrder.id, "CANCELLED")
                        }
                      ]
                    );
                  }}
                  disabled={updatingStatus}
                >
                  <Ionicons name="close-circle" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Hủy đơn hàng</Text>
                </TouchableOpacity>
              )}

              {/* Repay Button - Show if VNPay and Unpaid */}
              {selectedOrder.paymentMethod === "VNPAY" && selectedOrder.paymentStatus !== "PAID" && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#3182CE", marginTop: 12 }]}
                  onPress={() => {
                    // Placeholder for Repay logic
                    Alert.alert("Thanh toán lại", "Chức năng thanh toán lại đang được phát triển.");
                  }}
                >
                  <Ionicons name="card" size={20} color="#fff" />
                  <Text style={styles.confirmButtonText}>Thanh toán lại (VNPay)</Text>
                </TouchableOpacity>
              )}

            </ScrollView>
          </View>
        </View>
      </Modal>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7FAFC" }}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navbarLeft}>
          <Ionicons name="bicycle" size={24} color="#2F855A" />
          <Text style={styles.navbarTitle}>FurniMart Delivery</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            Alert.alert(
              "Đăng xuất",
              "Bạn có chắc chắn muốn đăng xuất?",
              [
                { text: "Hủy", style: "cancel" },
                {
                  text: "Đăng xuất",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.removeItem("staffId");
                    await AsyncStorage.removeItem("token");
                    router.replace("/(auth)/login");
                  },
                },
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

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
        {/* HEADER / PROFILE */}
        {profile && (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Image
                source={{
                  uri:
                    profile.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                }}
                style={styles.avatar}
              />
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.name}>{profile.fullName}</Text>
                <View style={styles.roleContainer}>
                  <Ionicons name="bicycle" size={16} color="#2F855A" />
                  <Text style={styles.role}>Shipper</Text>
                </View>
                <Text style={styles.branch} numberOfLines={1}>
                  <Ionicons
                    name="storefront-outline"
                    size={14}
                    color="#718096"
                  />{" "}
                  {storeName}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* DASHBOARD STATS */}
        {stats && (
          <View style={styles.statGrid}>
            <View
              style={[
                styles.statCard,
                { backgroundColor: "#fff", borderLeftColor: "#3182CE" },
              ]}
            >
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Tổng đơn</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: "#fff", borderLeftColor: "#38A169" },
              ]}
            >
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>

            <View
              style={[
                styles.statCard,
                { backgroundColor: "#fff", borderLeftColor: "#D69E2E" },
              ]}
            >
              <Text style={styles.statNumber}>
                {stats.total - stats.completed - stats.cancelled}
              </Text>
              <Text style={styles.statLabel}>Chưa xong</Text>
            </View>
            <View
              style={[
                styles.statCard,
                { backgroundColor: "#fff", borderLeftColor: "#E53E3E" },
              ]}
            >
              <Text style={styles.statNumber}>{stats.cancelled || 0}</Text>
              <Text style={styles.statLabel}>Đã hủy</Text>
            </View>
          </View>
        )}

        {/* TABS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "PENDING" && styles.activeTab]}
            onPress={() => handleTabChange("PENDING")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "PENDING" && styles.activeTabText,
              ]}
            >
              Chờ lấy
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "DELIVERING" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("DELIVERING")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "DELIVERING" && styles.activeTabText,
              ]}
            >
              Đang giao
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "COMPLETED" && styles.activeTab,
            ]}
            onPress={() => handleTabChange("COMPLETED")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "COMPLETED" && styles.activeTabText,
              ]}
            >
              Lịch sử
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
                    #{order.orderId?.toString() || "ORDER"}
                  </Text>
                  {renderStatusBadge(order.status)}
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
                    {order.customerName}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="call-outline"
                    size={16}
                    color="#718096"
                    style={styles.icon}
                  />
                  <Text style={styles.infoText}>{order.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color="#718096"
                    style={styles.icon}
                  />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {order.shippingAddress}
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

                <TouchableOpacity
                  style={styles.detailLink}
                  onPress={() => handleOpenDetailModal(order)}
                >
                  <Text style={styles.detailLinkText}>Xem chi tiết</Text>
                  <Ionicons name="arrow-forward" size={16} color="#2F855A" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {renderOrderDetailModal()}

      <ProofOfDelivery
        visible={showProofModal}
        onClose={() => setShowProofModal(false)}
        onSubmit={handleProofSubmit}
        orderId={selectedOrder?.orderId}
        qrCode={selectedOrder?.qrCode}
      />
    </SafeAreaView>
  );
};

export default DeliveryStaffDashboard;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
  },
  profileCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  role: {
    color: "#2F855A",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  branch: { color: "#718096", fontSize: 13 },

  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statCard: {
    width: "48%",
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
    fontSize: 13,
    fontWeight: "500",
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#2F855A",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#718096",
  },
  activeTabText: {
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
    backgroundColor: "#2F855A", // Xanh lá đậm
  },
  deliverButton: {
    backgroundColor: "#3182CE", // Xanh dương
  },
  completeButton: {
    backgroundColor: "#38A169", // Xanh lá sáng
    marginTop: 20,
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
  detailLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDF2F7",
  },
  detailLinkText: {
    color: "#2F855A",
    fontWeight: "600",
    marginRight: 4,
    fontSize: 14,
  },
  waitMessageContainer: {
    marginTop: 12,
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#EDF2F7',
    borderRadius: 8
  },
  waitMessageText: {
    color: '#718096',
    fontSize: 13,
    fontStyle: 'italic',
    fontWeight: '500'
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3748",
  },
  modalBody: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#718096",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  detailSubValue: {
    fontSize: 14,
    color: "#718096",
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F7FAFC",
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: "#eee"
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: "#2D3748",
  },
  itemColor: {
    fontSize: 12,
    color: "#718096",
  },
  itemPrice: {
    fontSize: 14,
    color: "#2F855A",
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2F855A",
  },
  deliveryPhoto: {
    width: 150,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F7FAFC",
  },
  signatureImage: {
    width: "100%",
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 8,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  navbarLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  navbarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3748",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E53E3E",
  },
});