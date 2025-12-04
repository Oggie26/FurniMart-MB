"use client";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Animated,
  Image,
  Dimensions,
  Platform,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { register } from "../../service/auth/index";

const { width, height } = Dimensions.get("window");

export default function Register() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isMale, setIsMale] = useState(true);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setIsValid(
      !!email.trim() &&
        !!password.trim() &&
        !!confirmPassword.trim() &&
        password === confirmPassword &&
        !!phone.trim() &&
        !!fullName.trim() &&
        !!birthDate
    );
  }, [email, password, confirmPassword, phone, fullName, birthDate]);

  const handleRegister = async () => {
    if (!isValid) {
      alert("Vui lòng điền đầy đủ thông tin hợp lệ");
      return;
    }
    try {
      const userData = {
        password,
        email,
        phone,
        gender: isMale,
        fullName,
        birthDay: birthDate?.toISOString().split("T")[0],
      };
      const response = await register(userData);
      if(response.status === 201){
        router.replace("/home");
      }
    } catch (error: any) {
      alert(error.message || "Đăng ký thất bại");
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/b3.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Đăng ký</Text>

            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Họ và tên"
                placeholderTextColor="#95A5A6"
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#95A5A6"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Row: Phone + BirthDay */}
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Số điện thoại"
                placeholderTextColor="#95A5A6"
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={[styles.input, { flex: 1, justifyContent: "center" }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: birthDate ? "#000" : "#95A5A6" }}>
                  {birthDate
                    ? birthDate.toLocaleDateString("vi-VN")
                    : "Ngày sinh"}
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
            <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "calendar"}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                if (event.type === "set" && selectedDate) {
                    setBirthDate(selectedDate)
                }
                if (Platform.OS === "android") {
                    setShowDatePicker(false)
                }
                }}
            />
            )}

            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Mật khẩu"
              placeholderTextColor="#95A5A6"
              secureTextEntry
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Xác nhận mật khẩu"
              placeholderTextColor="#95A5A6"
              secureTextEntry
              autoCapitalize="none"
            />

            <View style={styles.genderRow}>
              <Text style={styles.genderText}>Giới tính:</Text>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  isMale && styles.genderButtonActive,
                ]}
                onPress={() => setIsMale(true)}
              >
                <Text
                  style={[
                    styles.genderTextStyle,
                    { color: isMale ? "#fff" : "#688A65" },
                  ]}
                >
                  Nam
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  !isMale && styles.genderButtonActive,
                ]}
                onPress={() => setIsMale(false)}
              >
                <Text
                  style={[
                    styles.genderTextStyle,
                    { color: !isMale ? "#fff" : "#688A65" },
                  ]}
                >
                  Nữ
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, { opacity: isValid ? 1 : 0.6 }]}
              onPress={handleRegister}
              disabled={!isValid}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(tabs)/home")}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: 0,
  },
  formContainer: {
    width: width,
    minHeight: height * 0.7,
    backgroundColor: "rgba(255,255,255,0.98)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    color: "#688A65",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  row: { flexDirection: "row", marginBottom: 12 },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 12,
    color: "#2C3E50",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    justifyContent: "center",
  },
  genderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    justifyContent: "center",
  },
  genderText: { fontSize: 16, marginRight: 10, color: "#2C3E50" },
  genderButton: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#688A65",
    marginHorizontal: 5,
  },
  genderButtonActive: {
    backgroundColor: "#688A65",
  },
  genderTextStyle: {
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#688A65",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  loginLink: { alignItems: "center" },
  loginText: {
    color: "#688A65",
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
