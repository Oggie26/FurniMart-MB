// --- THÊM LẠI IMPORT NÀY ---
import { addAddress } from "@/service/address"
// ----------------------------

import { getProfile } from "@/service/auth"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    FlatList, // <-- Sẽ dùng làm component cuộn chính
    Modal,
    Platform,
    SafeAreaView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"

const GEOAPIFY_API_KEY = "150624aa754f4d1887b92552da7bf68a"

const GEOAPIFY_AUTOCOMPLETE_URL = "https://api.geoapify.com/v1/geocode/autocomplete"

export default function AddAddressModal({ visible, onClose, onAddressAdded }) {
  const [profile, setProfile] = useState()
  const [isLoading, setIsLoading] = useState(false) // Cho nút Lưu

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [isDefault, setIsDefault] = useState(false)
  const [searchText, setSearchText] = useState("") // Văn bản người dùng gõ
  const [suggestions, setSuggestions] = useState([]) // Danh sách gợi ý từ API
  const [isAutocompleteLoading, setIsAutocompleteLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null) // Lưu địa chỉ đã chọn

  const debounceTimeout = useRef(null)

  const fetchData = useCallback(async () => {
    try {
      const res = await getProfile()
      if (res && res.status === 200) {
        const data = res.data?.data || {}
        setProfile(data)
      }
    } catch (error) {
      console.error("Lỗi khi lấy profile:", error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (visible) {
      setName(profile.fullName || "")
      setPhone(profile.phone || "")
      resetForm()
    }
  }, [visible, profile])

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setIsDefault(false)
    setName(profile.fullName || "")
    setPhone(profile.phone || "")
    setSearchText("")
    setSuggestions([])
    setSelectedAddress(null)
  }

  const fetchAutocompleteSuggestions = async text => {
    if (!GEOAPIFY_API_KEY) {
      Alert.alert("Lỗi Cấu Hình", "Không tìm thấy GEOAPIFY_API_KEY")
      return
    }
    setIsAutocompleteLoading(true)
    try {
      const url = `${GEOAPIFY_AUTOCOMPLETE_URL}?text=${encodeURIComponent(
        text
      )}&apiKey=${GEOAPIFY_API_KEY}&lang=vi&filter=countrycode:vn&limit=5&bias=proximity:10.7769,106.6969`

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error("Lỗi khi gọi Geoapify Autocomplete")
      }
      const data = await response.json()
      setSuggestions(data.features || [])
    } catch (error) {
      console.error("Lỗi autocomplete:", error)
      Alert.alert("Lỗi", "Không thể tải gợi ý địa chỉ.")
    } finally {
      setIsAutocompleteLoading(false)
    }
  }

  const handleSearchTextChange = text => {
    setSearchText(text)
    setSelectedAddress(null)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current)
    }
    if (!text || text.length < 3) {
      setSuggestions([])
      return
    }
    debounceTimeout.current = setTimeout(() => {
      fetchAutocompleteSuggestions(text)
    }, 500)
  }

  const handleSuggestionPress = feature => {
    console.log(
      "DỮ LIỆU THÔ ĐÃ CHỌN:",
      JSON.stringify(feature.properties, null, 2)
    )
    const props = feature.properties
    setSearchText(props.formatted)
    setSelectedAddress(feature)
    setSuggestions([])
  }

  // --- LOGIC LƯU ĐỊA CHỈ ---
  const handleSave = async () => {
    if (!profile.id) {
      Alert.alert("Lỗi", "Không thể lấy thông tin người dùng.")
      return
    }
    if (!name || !phone) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập Tên và SĐT.")
      return
    }

    if (!selectedAddress) {
      Alert.alert(
        "Thiếu địa chỉ",
        "Vui lòng gõ và *chọn một* địa chỉ từ danh sách gợi ý."
      )
      return
    }

    setIsLoading(true)

    const props = selectedAddress.properties
    const street = `${props.housenumber || ""} ${props.street || ""}`.trim()

    const newAddress = {
      userId: profile.id,
      name,
      phone,
      city: props.city || null,
      district: props.district || null, // <-- Sẽ gửi null nếu Geoapify không trả về
      ward: props.suburb || props.county || null, // <-- Thử cả `suburb` và `county` (từ log), nếu cả 2 thiếu -> gửi null
      street: street.length > 0 ? street : null, // Gửi null nếu không có số nhà + đường
      addressLine: props.formatted,
      isDefault,
      latitude: props.lat,
      longitude: props.lon,
    }
    // --- KẾT THÚC SỬA LỖI ---

    console.log("Dữ liệu gửi lên BE (cho phép null):", JSON.stringify(newAddress, null, 2))

    try {
      await addAddress(newAddress)
      Alert.alert("Thành công", "Đã thêm địa chỉ mới.")
      setIsLoading(false)
      onAddressAdded()
      handleClose()
    } catch (error) {
      // Nếu BE của bạn (Database) không cho phép NULL,
      // Lỗi sẽ xảy ra ở đây (ví dụ: Lỗi 500)
      console.error("Error adding address:", error)
      Alert.alert("Lỗi", "Không thể thêm địa chỉ. Vui lòng thử lại. (Kiểm tra log server)")
      setIsLoading(false)
    }
  }

  // --- COMPONENT RENDER GỢI Ý ---
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionPress(item)}
    >
      <Text style={styles.suggestionText}>{item.properties.formatted}</Text>
    </TouchableOpacity>
  )

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.modalSafeView}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.modalHeaderText}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Địa chỉ mới</Text>
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#007aff" style={{ paddingHorizontal: 10 }} />
            ) : (
              <Text style={[styles.modalHeaderText, { fontWeight: "700" }]}>Lưu</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* --- Dùng FlatList làm component cuộn chính --- */}
        <FlatList
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContainer}
          keyboardShouldPersistTaps="handled"
          data={suggestions}
          keyExtractor={item => item.properties.place_id}
          renderItem={renderSuggestionItem}
          
          // Phần đầu (Form)
          ListHeaderComponent={
            <>
              <Text style={styles.inputLabel}>Thông tin liên hệ</Text>
              <TextInput
                style={styles.input}
                placeholder="Họ và tên"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Địa chỉ (Tìm kiếm tự động)</Text>

              {/* Ô tìm kiếm */}
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Gõ tìm số nhà, tên đường, phường..."
                  value={searchText}
                  onChangeText={handleSearchTextChange}
                />
                {isAutocompleteLoading && (
                  <ActivityIndicator style={styles.autocompleteLoading} />
                )}
              </View>
            </>
          }
          // Phần cuối (Công tắc Mặc định)
          ListFooterComponent={
            <>
              {selectedAddress && (
                <View>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                    <Switch
                      trackColor={{ false: "#767577", true: "#3B6C46" }}
                      thumbColor={isDefault ? "#f4f3f4" : "#f4f3f4"}
                      onValueChange={setIsDefault}
                      value={isDefault}
                    />
                  </View>
                  {isDefault && (
                    <Text style={styles.defaultWarningText}>
                      Địa chỉ mặc định cũ của bạn sẽ bị thay thế.
                    </Text>
                  )}
                </View>
              )}
            </>
          }
        />
      </SafeAreaView>
    </Modal>
  )
}

// --- STYLES ---

const styles = StyleSheet.create({
  modalSafeView: { flex: 1, backgroundColor: "#f9f9f9" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalHeaderText: { fontSize: 16, color: "#007aff" },

  modalScroll: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  modalScrollContainer: { paddingBottom: 20 },

  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    fontSize: 16,
    marginBottom: 12,
    color: "#333",
  },

  autocompleteLoading: {
    position: "absolute",
    right: 15,
    top: Platform.OS === "ios" ? 14 : 12,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 15,
  },

  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16, // Tăng khoảng cách
  },
  switchLabel: { fontSize: 16 },
  defaultWarningText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    marginHorizontal: 10,
    fontStyle: "italic",
  },
})