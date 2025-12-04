"use client" // Dùng nếu bạn ở trong App Router của Expo

import { getAddressDefault } from "@/service/address"; // <-- Đã đổi
import { getProfile } from "@/service/auth";
import { checkout, getCart, removeCart, updateCart } from "@/service/cart";
import { Pacifico_400Regular, useFonts } from "@expo-google-fonts/pacifico";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const Images = {
  empty: "https://cdn-icons-png.flaticon.com/512/4076/4076505.png",
  placeholder: "https://via.placeholder.com/80",
}

// Dữ liệu Phương thức thanh toán
const PAYMENT_METHODS = [
  { key: "COD", name: "Thanh toán khi nhận hàng (COD)", icon: "cash-outline" },
  { key: "VNPAY", name: "Thanh toán qua VNPAY", icon: "qr-code-outline" },
  { key: "WALLET", name: "Sử dụng Ví FurniMart", icon: "wallet-outline" },
]

export default function Cart() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [activeSwipe, setActiveSwipe] = useState(null)
  const swipeRefs = useRef({})
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [fontsLoaded] = useFonts({ Pacifico: Pacifico_400Regular })

  // --- THÊM MỚI: State cho cartId và voucherCode ---
  const [cartId, setCartId] = useState(null)
  const [voucherCode, setVoucherCode] = useState("")
  // ---------------------------------------------

  // State cho phương thức thanh toán
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0]) // Mặc định là COD
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false)

  const loadData = useCallback(async () => {
    try {
      // 1. Lấy profile TRƯỚC TIÊN
      const profileRes = await getProfile()
      if (profileRes?.status !== 200 || !profileRes.data?.data?.id) {
        throw new Error("Không thể lấy thông tin người dùng")
      }
      const userId = profileRes.data.data.id

      // 2. Lấy giỏ hàng VÀ địa chỉ default (song song)
      const [cartResponse, addressResponse] = await Promise.all([
        getCart(),
        getAddressDefault(userId), // <-- Gọi hàm mới với userId LẤY ĐƯỢC
      ])

      // 3. Xử lý giỏ hàng
      if (cartResponse?.data) {
        setCartItems(
          Array.isArray(cartResponse.data.items)
            ? cartResponse.data.items.map(item => ({
              id: item.cartItemId,
              productColorId: item.productColorId,
              name: item.productName,
              description: item.description || "Không có mô tả",
              price: item.price,
              quantity: item.quantity,
              totalItemPrice: item.totalItemPrice,
              image: item.image,
              colorName: item.colorName,
            }))
            : []
        )
        setTotalPrice(cartResponse.data.totalPrice || 0)

        // --- THÊM MỚI: Lấy cartId từ response ---
        // (Giả sử response của getCart() có dạng { data: { cartId: '...', items: [...] } })
        setCartId(cartResponse.data.cartId || null)
        // ---------------------------------------
      }

      // 4. Xử lý địa chỉ (API trả về { status, data: {...} })
      if (addressResponse?.status === 200 && addressResponse.data) {
        setSelectedAddress(addressResponse.data) // <-- Gán thẳng object
      } else {
        setSelectedAddress(null) // Không có địa chỉ default
      }
    } catch (error) {
      console.error("Error loading data:", error)
      Alert.alert("Lỗi", "Không thể tải dữ liệu giỏ hàng hoặc địa chỉ.")
    }
  }, []) // Thêm mảng phụ thuộc rỗng

  useFocusEffect(
    useCallback(() => {
      loadData() // <-- Gọi 1 hàm gộp duy nhất
    }, [loadData]) // Thêm loadData vào dependency
  )

  const openItemModal = item => {
    setSelectedItem({ ...item })
    setModalVisible(true)
  }

  const closeItemModal = () => {
    setSelectedItem(null)
    setModalVisible(false)
  }

  const handleUpdateQuantity = newQuantity => {
    if (!selectedItem) return
    if (newQuantity < 1) return
    setSelectedItem({ ...selectedItem, quantity: newQuantity })
  }

  const handleInputQuantity = text => {
    const value = parseInt(text) || 1
    if (value > 0) {
      setSelectedItem({ ...selectedItem, quantity: value })
    }
  }

  const handleSaveQuantity = async () => {
    try {
      await updateCart(selectedItem.productColorId, selectedItem.quantity)
      await loadData() // Tải lại tất cả (bao gồm cả total price)
      closeItemModal()
    } catch (error) {
      console.error("Error saving quantity:", error)
      Alert.alert("Lỗi", "Không thể cập nhật số lượng.")
    }
  }

  const handleRemoveItem = async item => {
    try {
      await removeCart(item.productColorId)
      await loadData()
      Alert.alert("Thành công", `${item.name} đã được xóa.`)
    } catch (error) {
      console.error("Error removing item:", error)
      Alert.alert("Lỗi", "Không thể xóa sản phẩm.")
    }
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert("Chưa chọn địa chỉ", "Vui lòng chọn địa chỉ giao hàng trước khi thanh toán.")
      return
    }

    if (cartItems.length === 0) {
      Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm vào giỏ hàng.")
      return
    }

    if (!cartId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giỏ hàng. Vui lòng thử tải lại.")
      return
    }

    try {
      const res = await checkout({
        addressId: selectedAddress.id,
        cartId,
        voucherCode,
        paymentMethod: selectedPayment.key,
      })

      if (selectedPayment.key === "COD") {
        Alert.alert("Thành công", "Đặt hàng thành công! Thanh toán khi nhận hàng.")
        router.push("/order-success")
      }
      else if (selectedPayment.key === "VNPAY") {
        const paymentUrl = res.redirectUrl;
        if (paymentUrl) {
          // DÙNG WebBrowser → KHÔNG BỊ ENCODE HASH
          await WebBrowser.openBrowserAsync(paymentUrl);
        } else {
          Alert.alert("Lỗi", "Không thể tạo liên kết thanh toán.");
        }
      }
      else if (selectedPayment.key === "WALLET") {
        Alert.alert("Thành công", "Thanh toán bằng ví thành công!")
        router.push("/order-success")
      }

      setCartItems([])
      setTotalPrice(0)
    } catch (error) {
      console.error("Error during checkout:", error)
      Alert.alert("Lỗi", "Thanh toán thất bại.")
    }
  }

  // --- KẾT THÚC SỬA ---

  const formatPrice = price =>
    Number(price || 0).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    })

  const renderRightActions = item => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() =>
        Alert.alert("Xóa sản phẩm", `Xóa ${item.name}?`, [
          { text: "Hủy", style: "cancel" },
          { text: "Xóa", style: "destructive", onPress: () => handleRemoveItem(item) },
        ])
      }
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  )

  // Sửa: Hàm này CHỈ chuyển màn hình
  const handleManageAddress = () => {
    router.push("/address") // Chuyển sang màn hình Quản lý địa chỉ
  }

  if (!fontsLoaded) return null

  const renderEmptyCart = () => (
    <View style={styles.emptyState}>
      <Image source={{ uri: Images.empty }} style={styles.emptyImage} />
      <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => router.push("/")}>
        <Text style={styles.emptyButtonText}>Tiếp tục mua sắm</Text>
      </TouchableOpacity>
    </View>
  )

  const renderCartItem = ({ item }) => (
    <Swipeable
      key={item.id}
      ref={ref => (swipeRefs.current[item.id] = ref)}
      renderRightActions={() => renderRightActions(item)}
      overshootRight={false}
      onSwipeableOpen={() => {
        if (activeSwipe && activeSwipe !== item.id) {
          swipeRefs.current[activeSwipe]?.close()
        }
        setActiveSwipe(item.id)
      }}
      onSwipeableClose={() => {
        if (activeSwipe === item.id) setActiveSwipe(null)
      }}
    >
      <TouchableOpacity onPress={() => openItemModal(item)}>
        <View style={styles.itemContainer}>
          <Image
            source={{ uri: item.image || Images.placeholder }}
            style={styles.itemImage}
          />
          <View style={styles.itemDetails}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemColor}>Màu: {item.colorName || "Không xác định"}</Text>
            <Text style={styles.itemPrice}>
              {formatPrice(item.totalItemPrice)} ({formatPrice(item.price)} × {item.quantity})
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#ccc" />
        </View>
      </TouchableOpacity>
    </Swipeable>
  )

  return (
    <LinearGradient colors={["#C1D8A2", "#A3BFFA"]} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.greeting}>Giỏ hàng</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={styles.sectionWrapper}>
          <FlatList
            ListHeaderComponent={
              <>
                {/* --- PHẦN 1: ĐỊA CHỈ --- */}
                <View style={styles.addressContainer}>
                  <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>

                  {selectedAddress ? (
                    <View
                      style={[
                        styles.addressItem,
                        styles.addressSelected, // Luôn luôn là selected
                      ]}
                    >
                      <Ionicons
                        name="location-outline"
                        size={24}
                        color={"#3B6C46"}
                      />
                      <View style={styles.addressDetails}>
                        <View style={styles.addressRow}>
                          <Ionicons
                            name="person-outline"
                            size={16}
                            style={styles.addressIcon}
                          />
                          <Text style={styles.addressNamePhoneText}>
                            {selectedAddress.name}
                          </Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Ionicons
                            name="call-outline"
                            size={16}
                            style={styles.addressIcon}
                          />
                          <Text style={styles.addressNamePhoneText}>
                            {selectedAddress.phone}
                          </Text>
                        </View>
                        <View style={styles.addressRow}>
                          <Ionicons
                            name="home-outline"
                            size={16}
                            style={[styles.addressIcon, { color: "#555" }]}
                          />
                          <Text style={styles.addressText} numberOfLines={2}>
                            {selectedAddress.addressLine ||
                              `${selectedAddress.street}, ${selectedAddress.ward}, ${selectedAddress.district}, ${selectedAddress.city}`}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={handleManageAddress}>
                        <Text style={styles.changeAddressButtonText}>Thay đổi</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addAddressButton}
                      onPress={handleManageAddress} // Vẫn gọi hàm chuyển màn hình
                    >
                      <Text style={styles.addAddressButtonText}>+ Thêm địa chỉ mới</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* --- PHẦN 2: PHƯƠNG THỨC THANH TOÁN (GỌN HƠN) --- */}
                <View style={styles.paymentContainer}>
                  <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
                  {/* Chỉ hiển thị mục đã chọn */}
                  <TouchableOpacity
                    style={[
                      styles.addressItem,
                      styles.addressSelected,
                    ]}
                    onPress={() => setIsPaymentModalVisible(true)} // <-- Mở Modal
                  >
                    <Ionicons
                      name={selectedPayment.icon}
                      size={24}
                      color={"#3B6C46"}
                    />
                    <View style={styles.addressDetails}>
                      <Text style={styles.addressNamePhoneText}>{selectedPayment.name}</Text>
                    </View>
                    <Text style={styles.changeAddressButtonText}>Thay đổi</Text>
                  </TouchableOpacity>
                </View>

                {/* --- THÊM MỚI: PHẦN 3: VOUCHER --- */}
                <View style={styles.voucherContainer}>
                  <Text style={styles.sectionTitle}>Mã giảm giá</Text>
                  <View style={styles.voucherInputContainer}>
                    <Ionicons
                      name="ticket-outline"
                      size={24}
                      color={"#888"}
                      style={styles.voucherIcon}
                    />
                    <TextInput
                      style={styles.voucherInput}
                      placeholder="Nhập mã giảm giá..."
                      placeholderTextColor="#999"
                      value={voucherCode}
                      onChangeText={setVoucherCode} // <-- Gán state
                      autoCapitalize="characters"
                    />
                    {/* Bạn có thể thêm hàm onPress cho nút Áp dụng nếu cần
                        ví dụ: onPress={handleApplyVoucher} 
                        Hiện tại, nó chỉ cần nhập vào là đủ */}
                    <TouchableOpacity style={styles.voucherButton}>
                      <Text style={styles.voucherButtonText}>Áp dụng</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {/* --- KẾT THÚC THÊM MỚI --- */}

                {/* --- PHẦN 4: SẢN PHẨM --- */}
                <Text style={styles.sectionTitle}>Sản phẩm</Text>
              </>
            }
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id.toString()}
            ListEmptyComponent={renderEmptyCart}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {cartItems.length > 0 && (
          <View style={styles.cartContainer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.shadowWrapper}
              onPress={handleCheckout}
            >
              <LinearGradient
                colors={["#2f855a", "#38a169"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cartButton}
              >
                <Text style={styles.cartTotalText}>{formatPrice(totalPrice)}</Text>
                <View style={styles.checkoutAction}>
                  <Text style={styles.cartText}>Thanh toán</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* Modal tăng giảm số lượng (của bạn) */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeItemModal}>
        {/* ... (Code Modal tăng/giảm số lượng không đổi) ... */}
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {selectedItem && (
              <>
                <Image
                  source={{ uri: selectedItem.image || Images.placeholder }}
                  style={styles.modalImage}
                />
                <Text style={styles.modalName}>{selectedItem.name}</Text>
                <Text style={styles.modalColor}>Màu: {selectedItem.colorName}</Text>
                <Text style={styles.modalDescription}>{selectedItem.description}</Text>
                <Text style={styles.modalPrice}>Giá: {formatPrice(selectedItem.price)}</Text>
                <Text style={styles.modalTotal}>
                  Tổng: {formatPrice(selectedItem.price * selectedItem.quantity)}
                </Text>
                <View style={styles.modalQuantityContainer}>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(selectedItem.quantity - 1)}
                    disabled={selectedItem.quantity <= 1}
                    style={[
                      styles.quantityButton,
                      selectedItem.quantity <= 1 && styles.quantityButtonDisabled,
                    ]}
                  >
                    <Ionicons name="remove" size={20} color="#333" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="numeric"
                    value={selectedItem.quantity.toString()}
                    onChangeText={handleInputQuantity}
                    maxLength={3}
                  />
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(selectedItem.quantity + 1)}
                    style={styles.quantityButton}
                  >
                    <Ionicons name="add" size={20} color="#333" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#eee" }]}
                    onPress={closeItemModal}
                  >
                    <Text style={[styles.modalButtonText, { color: "#555" }]}>Hủy Bỏ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: "#3B6C46" }]}
                    onPress={handleSaveQuantity}
                  >
                    <Text style={[styles.modalButtonText, { color: "#fff" }]}>Lưu</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- THÊM MỚI: MODAL CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
      <Modal
        visible={isPaymentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPaymentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setIsPaymentModalVisible(false)} // Bấm bên ngoài để tắt
        >
          <View style={[styles.modalContainer, { width: "90%" }]}>
            <Text style={styles.modalName}>Chọn phương thức thanh toán</Text>

            {/* Lặp qua 3 lựa chọn */}
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.key}
                style={[
                  styles.addressItem,
                  { width: "100%", backgroundColor: "#fff" }, // Style riêng cho modal
                  selectedPayment.key === method.key && styles.addressSelected,
                ]}
                onPress={() => {
                  setSelectedPayment(method)
                  setIsPaymentModalVisible(false)
                }}
              >
                <Ionicons
                  name={method.icon}
                  size={24}
                  color={selectedPayment.key === method.key ? "#3B6C46" : "#555"}
                />
                <View style={styles.addressDetails}>
                  <Text style={styles.addressNamePhoneText}>{method.name}</Text>
                </View>
                {selectedPayment.key === method.key && (
                  <Ionicons name="checkmark-circle" size={24} color="#3B6C46" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* --- KẾT THÚC THÊM MỚI --- */}

    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === "ios" ? 10 : 0,
  },
  greeting: { fontSize: 24, fontFamily: "Pacifico", color: "#FFF" },
  scrollContent: { paddingBottom: 120 },
  sectionWrapper: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 25,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  addressContainer: { marginBottom: 16 },

  paymentContainer: { marginBottom: 16 },

  addressItem: {
    backgroundColor: "#f9f9f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center", // Sửa: Căn lề giữa
    borderWidth: 1,
    borderColor: "#eee",
  },
  addressSelected: { borderColor: "#3B6C46", borderWidth: 2, backgroundColor: "#f0f5f0" },
  addressDetails: { flex: 1, marginHorizontal: 10 },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  addressIcon: {
    width: 16,
    marginRight: 8,
    marginTop: 2,
    color: "#333",
  },
  addressNamePhoneText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "700",
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: "#555",
    fontWeight: "400",
    lineHeight: 20,
    flex: 1,
  },

  addAddressButton: {
    backgroundColor: "#3B6C46",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  addAddressButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  changeAddressButton: {},
  changeAddressButtonText: {
    color: "#3B6C46",
    fontWeight: "600",
    fontSize: 15,
  },

  // --- THÊM MỚI: Styles cho Voucher ---
  voucherContainer: { marginBottom: 16 },
  voucherInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eee",
    paddingLeft: 16, // Tăng padding trái
  },
  voucherIcon: {
    marginRight: 10,
  },
  voucherInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  voucherButton: {
    backgroundColor: "#3B6C46",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4, // Cách lề 1 chút
  },
  voucherButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  // -------------------------------

  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: { width: 80, height: 80, borderRadius: 10, marginRight: 12 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600", color: "#333" },
  itemColor: { fontSize: 14, color: "#777", marginTop: 4 },
  itemPrice: { fontSize: 14, fontWeight: "500", color: "#333", marginTop: 4 },
  deleteButton: {
    backgroundColor: "#ff3b30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "90%",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
    paddingBottom: 50,
  },
  emptyImage: {
    width: 120,
    height: 120,
    resizeMode: "contain",
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    fontWeight: "500",
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: "#3B6C46",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cartContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 90 : 30,
    left: 20,
    right: 20,
    alignItems: "center",
    pointerEvents: "box-none",
  },
  shadowWrapper: {
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  cartButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 40,
    paddingVertical: 14,
    paddingHorizontal: 20,
    width: "100%",
  },
  cartTotalText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  checkoutAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalImage: { width: 140, height: 140, borderRadius: 16, marginBottom: 12 },
  modalName: { fontSize: 18, fontWeight: "700", color: "#333", textAlign: "center" },
  modalColor: { fontSize: 15, color: "#666", marginVertical: 4 },
  modalDescription: { fontSize: 14, color: "#555", marginBottom: 10, textAlign: "center" },
  modalPrice: { fontSize: 16, color: "#3B6C46", marginBottom: 6, fontWeight: "500" },
  modalTotal: { fontSize: 16, color: "#333", marginBottom: 16, fontWeight: "600" },
  modalQuantityContainer: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  quantityButton: {
    padding: 10,
    borderRadius: 30,
    backgroundColor: "#eee",
    marginHorizontal: 10,
  },
  quantityButtonDisabled: { backgroundColor: "#ddd", opacity: 0.7 },
  quantityInput: {
    width: 50,
    height: 40,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: "center",
    marginHorizontal: 5,
  },
  modalButtonText: { fontSize: 16, fontWeight: "600" },
})