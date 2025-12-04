import { Pacifico_400Regular, useFonts } from "@expo-google-fonts/pacifico";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getProfile, logout } from "../../service/auth/index";

// 🎨 Khai báo màu icon ở đây để dễ tái sử dụng
const PRIMARY_ICON_COLOR = "#2f855a";

const Setting = () => {
  const [fullName, setFullName] = useState("Bạn");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      const res = await getProfile();
      if (res.status === 200) {
        setFullName(res.data.data.fullName);
      }
    } catch (error) {
      console.error("Lỗi khi lấy tên:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await SecureStore.deleteItemAsync('token');
      if (token) {
        await logout(token);
      }
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      router.replace("/");
    } catch (err) {
      console.error("Lỗi khi logout:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [fontsLoaded] = useFonts({
    Pacifico: Pacifico_400Regular,
  });

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setModalVisible(true);
  };

  const privacyPolicyContent = `
1. Thu thập thông tin:
Chúng tôi thu thập thông tin cá nhân của bạn (tên, số điện thoại, địa chỉ) để xử lý đơn hàng và giao nhận nội thất.

2. Sử dụng thông tin:
Thông tin của bạn được sử dụng để:
- Xác nhận và xử lý đơn hàng.
- Liên lạc về tình trạng giao hàng.
- Cải thiện dịch vụ khách hàng.

3. Chia sẻ thông tin:
Chúng tôi chỉ chia sẻ thông tin cần thiết với đối tác vận chuyển để thực hiện giao hàng. Chúng tôi cam kết không bán thông tin của bạn cho bên thứ ba.

4. Bảo mật:
Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép.
`;

  const termsOfServiceContent = `
1. Đặt hàng:
Khách hàng có thể đặt hàng qua ứng dụng. Đơn hàng được xác nhận khi có thông báo từ hệ thống.

2. Thanh toán:
Chúng tôi chấp nhận thanh toán qua thẻ, chuyển khoản hoặc tiền mặt khi nhận hàng (COD).

3. Vận chuyển & Giao nhận:
- Phí vận chuyển được tính dựa trên khoảng cách và khối lượng hàng hóa.
- Thời gian giao hàng dự kiến sẽ được thông báo khi đặt hàng.
- Khách hàng cần kiểm tra kỹ sản phẩm nội thất ngay khi nhận hàng.

4. Đổi trả & Bảo hành:
- Đổi trả trong vòng 7 ngày nếu có lỗi từ nhà sản xuất.
- Bảo hành sản phẩm nội thất theo chính sách cụ thể của từng loại sản phẩm (thường là 12-24 tháng).

5. Trách nhiệm:
Khách hàng chịu trách nhiệm cung cấp thông tin giao hàng chính xác.
`;

  const helpContent = `
Q: Làm sao để theo dõi đơn hàng?
A: Bạn có thể vào mục "Lịch sử đơn hàng" để xem trạng thái cập nhật.

Q: Phí vận chuyển được tính như thế nào?
A: Phí vận chuyển phụ thuộc vào địa chỉ giao hàng và kích thước sản phẩm. Bạn sẽ thấy phí ship trước khi xác nhận đơn.

Q: Tôi có thể thay đổi địa chỉ giao hàng không?
A: Bạn có thể liên hệ hotline hỗ trợ để thay đổi trước khi đơn hàng được chuyển đi.

Q: Chính sách bảo hành ra sao?
A: Các sản phẩm nội thất gỗ thường được bảo hành 12 tháng cho các lỗi kỹ thuật.

Liên hệ hỗ trợ:
Hotline: 1900 xxxx
Email: support@furnimart.com
`;

  if (!fontsLoaded) return null;

  const sections = [
    {
      title: "Tài khoản",
      icon: "person-circle-outline",
      items: [
        { title: "Thông tin", icon: "pencil-outline", route: "/profile" },
        { title: "Lịch sử đơn hàng", icon: "time-outline", route: "/order" },
      ],
    },
    {
      title: "Thông báo",
      icon: "notifications-outline",
      items: [{ title: "Thông báo đẩy", icon: "notifications" }],
    },
    {
      title: "Giới thiệu",
      icon: "information-circle-outline",
      items: [{ title: "Phiên bản ứng dụng", subtitle: "1.0.0" }],
    },
    {
      title: "Chính sách",
      icon: "document-text-outline",
      items: [
        {
          title: "Chính sách bảo mật",
          icon: "shield-checkmark-outline",
          onPress: () => openModal("Chính sách bảo mật", privacyPolicyContent)
        },
        {
          title: "Điều khoản dịch vụ",
          icon: "reader-outline",
          onPress: () => openModal("Điều khoản dịch vụ", termsOfServiceContent)
        },
        {
          title: "Giúp đỡ",
          icon: "help-circle-outline",
          onPress: () => openModal("Giúp đỡ", helpContent)
        },
        { title: "Đăng xuất", icon: "exit-outline", onPress: handleLogout },
      ],
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* Sections */}
        {sections.map((section, idx) => (
          <View style={styles.section} key={idx}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={22} color={PRIMARY_ICON_COLOR} />
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <View style={styles.sectionContent}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.item}
                  onPress={() => {
                    if (item.route) {
                      router.push(item.route);
                    } else if (item.onPress) {
                      item.onPress();
                    } else {
                      console.log(item.title);
                    }
                  }}
                >
                  <View style={styles.itemLeft}>
                    {item.icon && (
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={PRIMARY_ICON_COLOR}
                        style={{ marginRight: 10 }}
                      />
                    )}
                    <Text style={styles.itemTitle}>{item.title}</Text>
                  </View>
                  {item.subtitle && (
                    <Text style={styles.versionText}>{item.subtitle}</Text>
                  )}
                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color="#ccc"
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Info Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalText}>{modalContent}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: "#f4f6f8",
    marginTop: 60,
  },
  header: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#0b7a39ff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Pacifico",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#e0f7fa",
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2f855a",
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemTitle: {
    fontSize: 16,
    color: "#444",
  },
  versionText: {
    fontSize: 16,
    color: "#555",
    marginRight: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d9534f",
    padding: 14,
    borderRadius: 12,
    justifyContent: "center",
    marginHorizontal: 16,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f855a",
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});

export default Setting;
