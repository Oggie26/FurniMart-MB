"use client";
import { Pacifico_400Regular, useFonts } from "@expo-google-fonts/pacifico";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { getProfile } from "../../service/auth/index";
import { getProducts } from "../../service/product/index";

const Images = {
  banner: "https://images.unsplash.com/photo-1550581190-9c1c48d21d6c",
  placeholder:
    "https://img.freepik.com/free-vector/wooden-chair_1308-84495.jpg?w=1380&t=st=1698154027~exp=1698154627~hmac=f8c86f9a57b2b8f9dcfd1a6b8eaa52f17deaa90543f6e6a7c9c1eb7b9a51e2f3",
  empty:
    "https://i.pinimg.com/736x/09/23/69/092369c99558414bfbba65421df541a2.jpg",
};

const categories = [
  { name: "apps", label: "Tất cả" },
  { name: "chair", label: "Ghế" },
  { name: "table-bar", label: "Bàn" },
  { name: "lightbulb", label: "Đèn" },
  { name: "bed", label: "Giường" },
  { name: "weekend", label: "Tủ" },
  { name: "bathroom", label: "Phòng tắm" },
];

const CategoryIcon = ({ name, label, active, onPress }: any) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.85, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <TouchableOpacity activeOpacity={0.9} onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View
        style={[
          styles.categoryCircle,
          { transform: [{ scale }], backgroundColor: active ? "#3B6C46" : "#8CA98F" },
        ]}
      >
        <MaterialIcons name={name} size={26} color="#fff" />
      </Animated.View>
      <Text
        style={{
          textAlign: "center",
          marginTop: 5,
          fontSize: 12,
          color: active ? "#3B6C46" : "#333",
          fontWeight: active ? "700" : "400",
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("Bạn");
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [cartCount, setCartCount] = useState(0);

  const fetchData = async () => {
    try {
      const [userRes, productRes] = await Promise.all([getProfile(), getProducts()]);
      if (userRes.status === 200) setFullName(userRes.data.data.fullName);
      if (productRes.status === 200) setProducts(productRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const [fontsLoaded] = useFonts({ Pacifico: Pacifico_400Regular });
  if (!fontsLoaded) return null;

  const filteredProducts =
    selectedCategory === "Tất cả"
      ? products
      : products.filter((p) => p.categoryName?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <LinearGradient colors={["#C1D8A2", "#A3BFFA"]} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Xin chào {fullName}</Text>
          <TouchableOpacity>
            <MaterialIcons name="notifications-none" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#FFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm..."
            placeholderTextColor="#E5E7EB"
          />
        </View>

        <ImageBackground source={{ uri: Images.banner }} style={styles.bannerImage} imageStyle={{ borderRadius: 20 }} />

        <View style={styles.sectionWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 20, paddingVertical: 10 }}
          >
            {categories.map((cat) => (
              <CategoryIcon
                key={cat.label}
                name={cat.name}
                label={cat.label}
                active={selectedCategory === cat.label}
                onPress={() => setSelectedCategory(cat.label)}
              />
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>
            {selectedCategory === "Tất cả" ? "Sản phẩm nổi bật" : selectedCategory}
          </Text>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  activeOpacity={0.85}
                  onPress={() =>
                    router.push({
                      pathname: "/(product)/[id]",
                      params: { id: item.id },
                    })
                  }
                >
                  <Image
                    source={{ uri: item.thumbnailImage || Images.placeholder }}
                    style={styles.cardImage}
                  />
                  <View style={{ paddingHorizontal: 8, marginTop: 6 }}>
                    <Text style={styles.cardText} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.cardPrice}>{item.price.toLocaleString()}đ</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Image source={{ uri: Images.empty }} style={styles.emptyImage} />
              <Text style={styles.emptyText}>Chưa có sản phẩm trong danh mục này</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      <View style={styles.cartContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.shadowWrapper}
          onPress={() => router.push("/cart")}
        >
          <LinearGradient
            colors={["#2f855a", "#38a169"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cartButton}
          >
            <View style={styles.iconWrapper}>
              <Ionicons name="cart" size={24} color="#fff" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.cartText}>Xem giỏ hàng</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { paddingBottom: 120 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    marginBottom: 15,
  },
  greeting: { fontSize: 24, fontFamily: "Pacifico", color: "#FFF" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: "#FFF", paddingVertical: 10 },
  bannerImage: { height: 200, marginHorizontal: 20, marginBottom: 40 },
  sectionWrapper: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 20,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
  },
  categoryCircle: {
    padding: 14,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    borderRadius: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  cardText: { fontSize: 14, fontWeight: "600", color: "#333" },
  cardPrice: { fontSize: 15, color: "#3B6C46", fontWeight: "700", marginTop: 4 },

  // 🛒 Floating cart button
  cartContainer: {
    position: "absolute",
    bottom: 84,
    left: 20,
    right: 20,
    alignItems: "center",
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
    justifyContent: "center",
    borderRadius: 40,
    paddingVertical: 14,
    width: "100%",
  },
  cartText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  iconWrapper: { position: "relative" },
  badge: {
    position: "absolute",
    top: -8,
    right: -10,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  // 🧩 Empty State
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyImage: {
    width: 250,
    height: 250,
    resizeMode: "contain",
  },
  emptyText: {
    fontSize: 16,
    color: "#777",
    fontWeight: "500",
  },
});

export default HomeScreen;
