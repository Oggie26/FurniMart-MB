"use client"

import { addToCart } from "@/service/cart"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import Toast from "react-native-toast-message"
import Ionicons from "react-native-vector-icons/Ionicons"
import Model3DViewer from "../../components/product/Model3DViewer"
import {
  getAvailableProducts,
  getProductById,
  getProductStock
} from "../../service/product"
import {
  addFavoriteProduct,
  checkFavoriteProduct,
  removeFavoriteProduct
} from "../../service/product/favorites"


const { width, height } = Dimensions.get("window")

export default function ProductDetail() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stockLocations, setStockLocations] = useState<any[]>([])
  const [selectedColor, setSelectedColor] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [show3D, setShow3D] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(1)).current

  const handleToggleFavorite = async () => {
    try {

      if (isFavorite) {
        await removeFavoriteProduct(id)
        setIsFavorite(false)
        Toast.show({
          type: "success",
          text1: "Đã xóa khỏi yêu thích",
          position: "top",
          visibilityTime: 1000,
        })
      } else {
        await addFavoriteProduct(id)
        setIsFavorite(true)
        Toast.show({
          type: "success",
          text1: "Đã thêm vào yêu thích",
          position: "top",
          visibilityTime: 1000,
        })
      }
    } catch (error) {
      console.error("Lỗi khi toggle favorite:", error)
      Toast.show({
        type: "error",
        text1: "Có lỗi xảy ra",
        position: "top",
      })
    }
  }

  const handleAddToCart = async () => {
    if (!selectedColor) {
      Toast.show({ type: "error", text1: "Vui lòng chọn màu!", position: "top" })
      return
    }

    if (!selectedColor.stockQuantity || selectedColor.stockQuantity <= 0) {
      Toast.show({ type: "info", text1: "Sản phẩm đã hết hàng!", position: "top" })
      return
    }

    try {
      await addToCart({
        productColorId: selectedColor.id,
        quantity,
      })
      Toast.show({
        type: "success",
        text1: "Thêm vào giỏ thành công",
        position: "top",
        visibilityTime: 1000,
      })
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error)
    }
  }

  const animateImageChange = () => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start()
  }

  const fetchProduct = async () => {
    try {
      const response = await getProductById(id)
      if (response?.status === 200) {
        const data = response.data.data
        setProduct(data)
        if (data.productColors && data.productColors.length > 0) {
          setSelectedColor(data.productColors[0])
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLocations = async () => {
    if (selectedColor && selectedColor.id) {
      setStockLocations([])
      try {
        const response = await getProductStock(selectedColor.id)
        if (response?.data?.data?.locations) {
          const sorted = response.data.data.locations.sort((a: any, b: any) => b.available - a.available)
          setStockLocations(sorted)
        }
      } catch (error) {
        console.error("Lỗi fetch location:", error)
      }
    }
  }

  useEffect(() => {
    fetchProduct()
  }, [id])

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await checkFavoriteProduct(id)
        if (response?.status === 200) {
          setIsFavorite(response.data.data)
        }
      } catch (error) {
        console.error("Lỗi khi check favorite:", error)
      }
    }
    if (id) {
      checkFavorite()
    }
  }, [id])

  useEffect(() => {
    const fetchStockForSelectedColor = async () => {
      if (selectedColor && selectedColor.id) {
        try {
          const response = await getAvailableProducts(selectedColor.id)
          let stockInt = 0
          if (response?.status === 200) {
            stockInt = response.data.data
          }

          setSelectedColor((prevColor: any) => ({
            ...prevColor,
            stockQuantity: stockInt,
          }))

          fetchLocations()

        } catch (error) {
          console.error("Lỗi khi lấy số lượng tồn:", error)
          setSelectedColor((prevColor: any) => ({
            ...prevColor,
            stockQuantity: 0,
          }))
        }
      }
    }

    fetchStockForSelectedColor()
  }, [selectedColor?.id])

  useEffect(() => {
    if (selectedColor?.images?.length > 0) {
      setSelectedImage(selectedColor.images[0].image)
    } else if (product?.thumbnailImage) {
      setSelectedImage(product.thumbnailImage)
    } else if (product?.image) {
      setSelectedImage(product.image)
    }
  }, [selectedColor, product])

  const onSelectImage = (img: string) => {
    setSelectedImage(img)
    animateImageChange()
  }

  const increaseQuantity = () => {
    if (quantity < (selectedColor?.stockQuantity || 1)) {
      setQuantity(prev => prev + 1)
    } else {
      Toast.show({ type: "info", text1: "Đã đạt số lượng tồn tối đa", position: "top" })
    }
  }

  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b7a57" />
      </View>
    )
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Không tìm thấy sản phẩm</Text>
      </View>
    )
  }

  const isOutOfStock = !selectedColor || !(selectedColor.stockQuantity > 0)
  const isContactOnly = !product?.price || product.price <= 0
  const needsContact = isOutOfStock || isContactOnly

  const buttonLabel = needsContact ? "Liên hệ" : "Mua ngay"
  const handleMainButtonPress = () => {
    if (needsContact) {
      Toast.show({
        type: "info",
        text1: "Vui lòng liên hệ cửa hàng để biết thêm chi tiết!",
        position: "top",
      })
    } else {
      handleAddToCart()
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết sản phẩm</Text>
          <TouchableOpacity onPress={handleToggleFavorite}>
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={26}
              color={isFavorite ? "#e74c3c" : "#333"}
            />
          </TouchableOpacity>
        </View>

        {/* Image/3D Section */}
        <View style={styles.imageSection}>
          {!show3D ? (
            <Animated.Image
              source={{ uri: selectedImage || undefined }}
              style={[styles.productImage, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
              resizeMode="contain"
            />
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setIsFullscreen(true)}
            >
              {selectedColor?.models3D?.[0]?.modelUrl && (
                <Model3DViewer
                  modelUrl={selectedColor.models3D[0].modelUrl}
                  previewImage={selectedColor.models3D[0].previewImage || selectedImage || undefined}
                />
              )}
            </TouchableOpacity>
          )}

          {/* Fullscreen Button - Only show in 3D mode */}
          {show3D && (
            <TouchableOpacity
              style={styles.fullscreenButton}
              onPress={() => setIsFullscreen(true)}
            >
              <Ionicons name="expand-outline" size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {/* 3D Toggle Button - Floating */}
          {selectedColor?.models3D && selectedColor.models3D.length > 0 && (
            <TouchableOpacity
              style={styles.toggle3DButton}
              onPress={() => setShow3D(!show3D)}
            >
              <Ionicons name={show3D ? "image" : "cube"} size={18} color="#fff" />
              <Text style={styles.toggle3DText}>
                {show3D ? "2D" : "3D"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {!show3D && selectedColor?.images?.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
            {selectedColor.images.map((img: any, i: number) => (
              <TouchableOpacity key={i} onPress={() => onSelectImage(img.image)}>
                <Image
                  source={{ uri: img.image }}
                  style={[
                    styles.smallImage,
                    {
                      borderColor: selectedImage === img.image ? "#3b7a57" : "transparent",
                      borderWidth: 2,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productCategory}>{product.categoryName || "Danh mục khác"}</Text>

          <Text style={styles.price}>
            {product.price && product.price > 0 ? `${product.price.toLocaleString()} đ` : "Liên hệ"}
          </Text>

          {selectedColor && (
            <Text style={{ color: "#000", marginTop: 4 }}>
              Tổng tồn kho: <Text style={{ fontWeight: "700" }}>{selectedColor.stockQuantity || 0}</Text>
            </Text>
          )}

          {/* Màu sắc + Số lượng */}
          <View style={styles.colorQtyRow}>
            <View style={styles.colorRow}>
              {product.productColors?.map((pc: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: pc.color.hexCode,
                      borderWidth: selectedColor?.id === pc.id ? 2 : 0,
                      borderColor: "#222",
                    },
                  ]}
                  onPress={() => setSelectedColor(pc)}
                />
              ))}
            </View>

            {!needsContact ? (
              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyButton} onPress={decreaseQuantity}>
                  <Ionicons name="remove-outline" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity style={styles.qtyButton} onPress={increaseQuantity}>
                  <Ionicons name="add-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          <Text style={styles.description}>
            {product.description || "Không có mô tả cho sản phẩm này."}
          </Text>

          {/* Specs */}
          <View style={styles.specRow}>
            {[
              { label: `${product?.weight || "N/A"} kg`, icon: "barbell-outline" },
              { label: `${product?.height || "N/A"} cm`, icon: "arrow-up-outline" },
              { label: `${product?.width || "N/A"} cm`, icon: "arrow-forward-outline" },
              { label: `${product?.length || "N/A"} cm`, icon: "arrow-down-outline" },
            ].map((item, index) => (
              <View key={index} style={styles.specChip}>
                <Ionicons name={item.icon as any} size={16} color="#555" />
                <Text style={styles.specChipText}>{item.label}</Text>
              </View>
            ))}
          </View>

          {/* Material */}
          <Text style={styles.sectionTitle}>Chất liệu</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
            {product.materials?.map((m: any, i: number) => (
              <View key={i} style={styles.materialCard}>
                <Image source={{ uri: m.image }} style={styles.materialImage} />
                <Text style={styles.materialName}>{m.materialName}</Text>
              </View>
            ))}
          </ScrollView>

          {stockLocations.length > 0 && (
            <View style={styles.stockContainer}>
              <Text style={styles.stockHeader}>Tình trạng tại các kho:</Text>
              {stockLocations.map((loc, idx) => (
                <View key={idx} style={styles.stockItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="storefront-outline" size={16} color="#555" />
                    <Text style={styles.stockName} numberOfLines={1}>{loc.warehouseName}</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={[
                      styles.stockStatus,
                      { color: loc.available > 0 ? '#3b7a57' : '#d9534f' }
                    ]}>
                      {loc.available > 0 ? `Còn ${loc.available} cái` : 'Hết hàng'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* Thanh dưới */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Tổng cộng</Text>
          <Text style={styles.totalPrice}>
            {product.price && product.price > 0 && !isOutOfStock
              ? `${(product.price * quantity).toLocaleString()} đ`
              : "Liên hệ"}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.buyButton,
            needsContact && { backgroundColor: "#5a5a5a" },
          ]}
          onPress={handleMainButtonPress}
        >
          <Text style={styles.buyButtonText}>{buttonLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Modal - Only for 3D */}
      {show3D && (
        <Modal
          visible={isFullscreen}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setIsFullscreen(false)}
        >
          <View style={styles.fullscreenContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsFullscreen(false)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>

            {/* 3D Content */}
            <View style={styles.fullscreenContent}>
              {selectedColor?.models3D?.[0]?.modelUrl && (
                <View style={styles.fullscreen3DContainer}>
                  <Model3DViewer
                    modelUrl={selectedColor.models3D[0].modelUrl}
                    previewImage={selectedColor.models3D[0].previewImage || selectedImage || undefined}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  imageSection: { justifyContent: "center", alignItems: "center", marginVertical: 10 },
  productImage: { width: width * 0.7, height: height * 0.35, borderRadius: 20 },
  imageGallery: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 4 },
  smallImage: { width: 80, height: 80, borderRadius: 10, marginHorizontal: 6 },
  arButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    marginHorizontal: 10,
    borderRadius: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoSection: { paddingHorizontal: 20, marginTop: 10 },
  productName: { fontSize: 22, fontWeight: "700", color: "#222" },
  productCategory: { fontSize: 14, color: "#6c757d", marginTop: 4 },
  price: { fontSize: 20, fontWeight: "700", color: "#3b7a57", marginTop: 10 },

  colorQtyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  colorRow: { flexDirection: "row", gap: 10 },
  colorCircle: { width: 28, height: 28, borderRadius: 14 },
  quantityRow: { flexDirection: "row", alignItems: "center" },
  qtyButton: { backgroundColor: "#eee", padding: 8, borderRadius: 40 },
  quantityText: { fontSize: 16, fontWeight: "600", marginHorizontal: 10 },
  description: { fontSize: 14, color: "#555", lineHeight: 20, marginTop: 10 },
  specRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 10 },
  specChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  specChipText: { marginLeft: 6, fontSize: 13, color: "#333" },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginTop: 20, color: "#222" },
  materialCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  materialImage: { width: 70, height: 70, borderRadius: 8 },
  materialName: { marginTop: 5, fontSize: 13, fontWeight: "500", color: "#333" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  totalLabel: { fontSize: 14, color: "#888" },
  totalPrice: { fontSize: 20, fontWeight: "700", color: "#3b7a57" },
  buyButton: {
    backgroundColor: "#688A65",
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 14,
    shadowColor: "#3b7a57",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buyButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  // STYLES CHO LIST KHO (Được đặt ở cuối UI)
  stockContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  stockHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 5
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  stockName: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  badge: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stockStatus: {
    fontSize: 13,
    fontWeight: '700'
  },

  // 3D Viewer Styles
  toggle3DButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 122, 87, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  toggle3DText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },

  // Fullscreen Styles
  fullscreenButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 25,
  },
  fullscreenContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height,
  },
  fullscreen3DContainer: {
    width: width,
    height: height * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenToggle3D: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 122, 87, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  fullscreenToggle3DText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
})