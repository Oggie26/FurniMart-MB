"use client" // Dùng nếu bạn ở trong App Router của Expo

import {
  deleteAddress,
  getAddress,
  setDefaultAddress, // Sẽ hoạt động sau khi bạn thêm `export`
} from "@/service/address"
// ------------------------------------------

import { getProfile } from "@/service/auth"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import Toast from "react-native-toast-message"
import Ionicons from "react-native-vector-icons/Ionicons"

// Import Modal Thêm Địa Chỉ
import AddAddressModal from "@/components/AddAddressModal"; // Đảm bảo đường dẫn này đúng

export default function AddressScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const profileRes = await getProfile()
      if (profileRes?.status !== 200) {
        throw new Error("Không thể lấy thông tin người dùng")
      }
      const user = profileRes.data.data
      setProfile(user)
      const addressesArray = await getAddress(user.id)
      setAddresses(addressesArray || []) 
      
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error)
      Alert.alert("Lỗi", error.message || "Không thể tải dữ liệu")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleSetDefault = async (addressId) => {
          const profileRes = await getProfile()
      if (profileRes?.status !== 200) {
        throw new Error("Không thể lấy thông tin người dùng")
      }
      const user = profileRes.data.data
    Alert.alert(
      "Xác nhận",
      "Bạn có muốn đặt địa chỉ này làm mặc định?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              await setDefaultAddress(addressId, user.id) 
              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Đã đặt làm địa chỉ mặc định.",
              })
              loadData() // Tải lại danh sách
            } catch (error) {
              Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng thử lại." })
            }
          },
        },
      ]
    )
  }

  // 2. Xóa địa chỉ
  const handleDelete = async (addressId) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn xóa địa chỉ này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAddress(addressId) // <--- ĐÃ GẮN
              Toast.show({
                type: "success",
                text1: "Thành công",
                text2: "Đã xóa địa chỉ.",
              })
              loadData() // Tải lại danh sách
            } catch (error) {
              Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng thử lại." })
            }
          },
        },
      ]
    )
  }

  // 3. Callback khi thêm địa chỉ thành công
  const onAddressAdded = () => {
    setModalVisible(false) // Đóng modal
    loadData() // Tải lại danh sách
  }

  // --- GIAO DIỆN PHỤ (CARD ĐỊA CHỈ) ---
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Hàng trên cùng: Icon, Tên, và Badge Mặc định */}
      <View style={styles.cardHeader}>
        <Ionicons name="location-sharp" size={20} color="#3b7a57" />
        <Text style={styles.cardTitle}>{item.name}</Text>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#fff" />
            <Text style={styles.defaultBadgeText}>Mặc định</Text>
          </View>
        )}
      </View>

      {/* Nội dung địa chỉ */}
      <View style={styles.cardBody}>
        <Text style={styles.cardText}>{item.phone}</Text>
        <Text style={styles.cardText} numberOfLines={2}>
          {item.addressLine}
        </Text>
      </View>

      {/* Hàng dưới cùng: Các nút hành động */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={18} color="#D9534F" />
          <Text style={[styles.actionButtonText, { color: "#D9534F" }]}>Xóa</Text>
        </TouchableOpacity>

        {/* Chỉ hiện nút "Đặt làm mặc định" nếu nó CHƯA phải là mặc định */}
        {!item.isDefault && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="star-outline" size={18} color="#3b7a57" />
            <Text style={[styles.actionButtonText, { color: "#3b7a57" }]}>
              Đặt làm mặc định
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  // --- GIAO DIỆN CHÍNH ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b7a57" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sổ địa chỉ</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Danh sách địa chỉ */}
      <FlatList
        data={addresses}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>Bạn chưa có địa chỉ nào.</Text>
            <Text style={styles.emptySubText}>
              Hãy thêm địa chỉ mới để tiện cho việc mua sắm nhé.
            </Text>
          </View>
        }
      />

      {/* Nút Thêm Mới (Nằm cố định ở dưới) */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Thêm địa chỉ mới</Text>
      </TouchableOpacity>

      {/* Modal Thêm Địa Chỉ */}
      <AddAddressModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddressAdded={onAddressAdded}
      />
    </SafeAreaView>
  )
}

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  // Card địa chỉ
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginLeft: 8,
    flex: 1, // Để đẩy badge Mặc định sang phải
  },
  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b7a57",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  defaultBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end", // Đẩy các nút sang phải
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 20, // Khoảng cách giữa 2 nút
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  // Nút thêm mới
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#688A65",
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#3b7a57",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  // Khi không có địa chỉ
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100, // Đẩy xuống một chút
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
})