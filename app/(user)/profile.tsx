import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getProfile } from "../../service/auth/index";

const ThemedView: React.FC<any> = ({ children, style, ...rest }) => {
  const cs = useColorScheme();
  return (
    <View
      {...rest}
      style={[
        { backgroundColor: cs === "dark" ? "#0f172a" : "#f8fafc", flex: 1 },
        style,
      ]}
    >
      {children}
    </View>
  );
};

interface Profile {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: boolean;
  birthday?: string;
  avatar?: string | null;
  cccd?: string;
  point?: number | null;
  role?: string;
  status?: string;
  createdAt?: string;
}

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = React.useState<Profile>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editAvatar, setEditAvatar] = React.useState("");
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const fetchData = React.useCallback(async () => {
    try {
      const res = await getProfile();
      if (res && res.status === 200) {
        const data = res.data?.data || {};
        setProfile(data);
        setEditName(data.fullName || "");
        setEditAvatar(data.avatar || "");
      }
    } catch (error) {
      console.error("Lỗi khi lấy profile:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleSave = () => {
    setProfile((prev) => ({
      ...prev,
      fullName: editName,
      avatar: editAvatar,
    }));
    setModalVisible(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Chưa có";
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  const handleUpdateProfile = () => {
    Alert.alert(
      "CẬP NHẬT HỒ SƠ",
      "Bạn có muốn cập nhật thông tin hồ sơ không?",
      [
        { text: "HỦY", style: "cancel" },
        {
          text: "CẬP NHẬT",
          onPress: () => {
            Alert.alert("THÀNH CÔNG", "Đã cập nhật hồ sơ thành công!");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 50 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View
            style={[
              styles.header,
              {
                backgroundColor: isDark ? "#FFFFFF" : "#2f855a",
              },
            ]}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatarRing}>
                <Image
                  source={{
                    uri:
                      profile.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                  }}
                  style={styles.avatar}
                />
              </View>
            </View>

            <Text style={styles.name}>
              {(profile.fullName || "NGƯỜI DÙNG").toUpperCase()}
            </Text>
            <Text style={styles.email}>{profile.email || ""}</Text>

            <View style={styles.badgeContainer}>
              <View style={[styles.badge, styles.roleBadge]}>
                <Ionicons name="shield-checkmark" size={14} color="#fff" />
                <Text style={styles.badgeText}>
                  {(profile.role || "CUSTOMER").toUpperCase()}
                </Text>
              </View>
              <View style={[styles.badge, styles.statusBadge]}>
                <View style={styles.statusDot} />
                <Text style={styles.badgeText}>
                  {(profile.status || "ACTIVE").toUpperCase()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: isDark ? "#1a3a2e" : "#22543d" },
              ]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="create-outline" size={18} color="#fff" />
              <Text style={styles.editText}>CHỈNH SỬA HỒ SƠ</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pointsCardWrapper}>
            <View
              style={[
                styles.pointsCard,
                {
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                },
              ]}
            >
              <View style={styles.pointsIconContainer}>
                <Ionicons name="star" size={28} color="#fbbf24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.pointsLabel,
                    { color: isDark ? "#94a3b8" : "#64748b" },
                  ]}
                >
                  ĐIỂM TÍCH LŨY
                </Text>
                <Text
                  style={[
                    styles.pointsValue,
                    { color: isDark ? "#f1f5f9" : "#0f172a" },
                  ]}
                >
                  {profile.point?.toLocaleString() || "0"}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? "#64748b" : "#cbd5e1"}
              />
            </View>
          </View>

          <View style={styles.infoWrapper}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? "#f1f5f9" : "#0f172a" },
              ]}
            >
              THÔNG TIN CÁ NHÂN
            </Text>

            <View
              style={[
                styles.infoSection,
                {
                  backgroundColor: isDark ? "#1e293b" : "#fff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                },
              ]}
            >
              <InfoCard
                icon="call"
                label="SỐ ĐIỆN THOẠI"
                value={profile.phone}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <InfoCard
                icon="transgender"
                label="GIỚI TÍNH"
                value={profile.gender === true ? "NAM" : "NỮ"}
                isDark={isDark}
              />
              <View style={styles.divider} />
              {/* <CHANGE> Applied date formatting to birthday field */}
              <InfoCard
                icon="calendar"
                label="NGÀY SINH"
                value={formatDate(profile.birthday)}
                isDark={isDark}
              />
              <View style={styles.divider} />
              <InfoCard
                icon="card"
                label="CCCD"
                value={profile.cccd}
                isDark={isDark}
              />
            </View>

            {/* <CHANGE> Added Update Profile button */}
            <TouchableOpacity
              style={[
                styles.updateButton,
                { backgroundColor: isDark ? "#22543d" : "#2f855a" },
              ]}
              onPress={handleUpdateProfile}
            >
              <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
              <Text style={styles.updateButtonText}>CẬP NHẬT HỒ SƠ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ThemedView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? "#1e293b" : "#fff" },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text
                style={[
                  styles.modalTitle,
                  { color: isDark ? "#f1f5f9" : "#0f172a" },
                ]}
              >
                CHỈNH SỬA HỒ SƠ
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons
                  name="close-circle"
                  size={28}
                  color={isDark ? "#64748b" : "#94a3b8"}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#cbd5e1" : "#475569" },
                ]}
              >
                HỌ VÀ TÊN
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Nhập họ và tên"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                  },
                ]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: isDark ? "#cbd5e1" : "#475569" },
                ]}
              >
                LINK AVATAR
              </Text>
              <TextInput
                value={editAvatar}
                onChangeText={setEditAvatar}
                placeholder="Nhập URL hình ảnh"
                placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                  },
                ]}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  styles.cancelBtn,
                  { backgroundColor: isDark ? "#334155" : "#e2e8f0" },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text
                  style={[
                    styles.btnText,
                    { color: isDark ? "#f1f5f9" : "#475569" },
                  ]}
                >
                  HỦY
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.saveBtn]}
                onPress={handleSave}
              >
                <Ionicons name="checkmark-circle" size={20} color="#fff" />
                <Text style={[styles.btnText, { color: "#fff", marginLeft: 6 }]}>
                  LƯU THAY ĐỔI
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
  isDark,
}: {
  icon: string;
  label: string;
  value?: string | null;
  isDark: boolean;
}) => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon as any} size={20} color={isDark ? "#2f855a" : "#22543d"} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: isDark ? "#94a3b8" : "#64748b" }]}>
        {label}
      </Text>
      <Text style={[styles.infoText, { color: isDark ? "#f1f5f9" : "#0f172a" }]}>
        {value || "CHƯA CÓ"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 56,
  },
  name: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  email: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 16,
  },
  badgeContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  roleBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.9)",
  },
  statusBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.9)",
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  editText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  pointsCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 24,
  },
  pointsCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  pointsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  pointsLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  infoWrapper: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  infoSection: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#d1fae5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 72,
  },
  updateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 14,
  },
  cancelBtn: {},
  saveBtn: {
    backgroundColor: "#2f855a",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileScreen;