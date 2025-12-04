"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { Animated, Image, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native"
import { login } from "../../service/auth/index"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()
  const fadeAnim = new Animated.Value(0)
  const scaleAnim = new Animated.Value(0.9)

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
    ]).start()
  }, [])

  const handleLogin = async () => {
    if (email.trim() && password.trim()) {
      try {
        await AsyncStorage.removeItem("token")
        await AsyncStorage.removeItem("user")
        const response = await login(email, password)
        const decoded = jwtDecode(response.data.token)
        if (response.data.token) {
          await AsyncStorage.setItem("token", response.data.token)
          await AsyncStorage.setItem("user", JSON.stringify(decoded))
          const userString = await AsyncStorage.getItem("user")
          const user = JSON.parse(userString)
          const role = user.role
          if (role === "DELIVERY") {
            router.push("/delivery")
          } else {
            router.push("/home")

          }
        } else {
          alert("Đăng nhập thất bại: không nhận được token")
        }
      } catch (error: any) {
        alert(error.message || "Đăng nhập thất bại")
      }
    } else {
      alert("Vui lòng nhập email và mật khẩu")
    }
  }

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/b3.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={2}
      />
      <KeyboardAvoidingView style={styles.inner} behavior="padding">
        <View style={styles.layoutContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/b3.jpg')}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.overlay} />
          </View>

          <Animated.View style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <View style={styles.logoContainer}>
              <Text style={styles.title}>FurniMart</Text>
            </View>

            <Text style={styles.subtitle}>Đăng nhập</Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(text) => setEmail(text)}
                  placeholder="Email"
                  placeholderTextColor="#95A5A6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#95A5A6"
                  secureTextEntry={true}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotLink}>
              <Text style={styles.forgotText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>hoặc</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity onPress={() => router.push("/register")} style={styles.registerButton}>
              <Text style={styles.registerText}>Đăng ký tài khoản mới</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 0,
  },
  layoutContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  formContainer: {
    flex: 2.5,
    justifyContent: "center",
    padding: 24,
    marginTop: -40,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 42,
    color: "#688A65",
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: "#688A65",
    textAlign: "center",
    marginBottom: 40,
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    color: "#2C3E50",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E6ED",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    backgroundColor: "#688A65",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#688A65",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  forgotLink: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotText: {
    color: "#688A65",
    fontSize: 15,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E6ED',
  },
  orText: {
    color: '#95A5A6',
    fontSize: 14,
    marginHorizontal: 16,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#688A65",
  },
  registerText: {
    color: "#688A65",
    fontSize: 16,
    fontWeight: "600",
  },
})