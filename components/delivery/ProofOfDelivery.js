import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import SignatureScreen from "react-native-signature-canvas";

const ProofOfDelivery = ({ visible, onClose, onSubmit, orderId, qrCode }) => {
    const [proofImage, setProofImage] = useState(null);
    const [signature, setSignature] = useState(null);
    const [scannedQR, setScannedQR] = useState(null);
    const [confirmationMethod, setConfirmationMethod] = useState(null); // 'signature' or 'qr'
    const [deliveryNotes, setDeliveryNotes] = useState("");
    const [showSignaturePad, setShowSignaturePad] = useState(false);
    const [showQRInput, setShowQRInput] = useState(false);
    const [uploading, setUploading] = useState(false);
    const signatureRef = useRef();

    const requestCameraPermission = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert(
                "Quyền truy cập",
                "Cần cấp quyền truy cập camera để chụp ảnh"
            );
            return false;
        }
        return true;
    };

    const handleTakePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setProofImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error taking photo:", error);
            Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setProofImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
        }
    };

    const handleSignature = (sig) => {
        setSignature(sig);
        setShowSignaturePad(false);
    };

    const handleSubmit = async () => {
        // Validation: Image is always REQUIRED
        if (!proofImage) {
            Alert.alert(
                "Thiếu ảnh giao hàng",
                "Vui lòng chụp ảnh bằng chứng giao hàng"
            );
            return;
        }

        // Validation: Must have either signature OR scanned QR
        if (!signature && !scannedQR) {
            Alert.alert(
                "Thiếu xác nhận khách hàng",
                "Vui lòng thu thập chữ ký HOẶC quét mã QR xác nhận"
            );
            return;
        }

        setUploading(true);
        try {
            await onSubmit({
                image: proofImage,
                signature: signature,
                scannedQR: scannedQR,
                notes: deliveryNotes,
                confirmationMethod: confirmationMethod,
            });
            // Reset state
            setProofImage(null);
            setSignature(null);
            setScannedQR(null);
            setConfirmationMethod(null);
            setDeliveryNotes("");
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải lên bằng chứng. Vui lòng thử lại.");
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setProofImage(null);
        setSignature(null);
        setScannedQR(null);
        setConfirmationMethod(null);
        setDeliveryNotes("");
        setShowSignaturePad(false);
        setShowQRInput(false);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalOverlay}
            >
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Bằng chứng giao hàng</Text>
                        <TouchableOpacity onPress={handleClose}>
                            <Ionicons name="close" size={28} color="#2D3748" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 40 }}>
                        {/* QR Code Section - if available */}
                        {qrCode && (
                            <View style={styles.qrSection}>
                                <Ionicons name="qr-code" size={24} color="#2F855A" />
                                <View style={{ flex: 1, marginLeft: 12 }}>
                                    <Text style={styles.qrTitle}>Mã QR đơn hàng</Text>
                                    <Text style={styles.qrCode}>{qrCode}</Text>
                                </View>
                            </View>
                        )}

                        {/* Photo Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ảnh giao hàng</Text>
                            {proofImage ? (
                                <View style={styles.imagePreview}>
                                    <Image
                                        source={{ uri: proofImage }}
                                        style={styles.previewImage}
                                    />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => setProofImage(null)}
                                    >
                                        <Ionicons name="close-circle" size={24} color="#E53E3E" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View style={styles.photoButtons}>
                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={handleTakePhoto}
                                    >
                                        <Ionicons name="camera" size={32} color="#2F855A" />
                                        <Text style={styles.photoButtonText}>Chụp ảnh</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.photoButton}
                                        onPress={handlePickImage}
                                    >
                                        <Ionicons name="images" size={32} color="#3182CE" />
                                        <Text style={styles.photoButtonText}>Chọn từ thư viện</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Customer Confirmation Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Xác nhận khách hàng</Text>
                            <Text style={styles.sectionSubtitle}>Chọn 1 trong 2 phương thức:</Text>

                            {/* Method Selection Buttons */}
                            {!confirmationMethod && (
                                <View style={styles.methodSelection}>
                                    <TouchableOpacity
                                        style={styles.methodButton}
                                        onPress={() => {
                                            setConfirmationMethod('signature');
                                            setShowSignaturePad(true);
                                        }}
                                    >
                                        <Ionicons name="create-outline" size={32} color="#805AD5" />
                                        <Text style={styles.methodButtonText}>Chữ ký</Text>
                                        <Text style={styles.methodButtonSubtext}>Khách hàng ký tên</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.methodButton}
                                        onPress={() => {
                                            setConfirmationMethod('qr');
                                            setShowQRInput(true);
                                        }}
                                    >
                                        <Ionicons name="qr-code-outline" size={32} color="#3182CE" />
                                        <Text style={styles.methodButtonText}>Quét QR</Text>
                                        <Text style={styles.methodButtonSubtext}>Scan mã đơn hàng</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* Signature Preview */}
                            {confirmationMethod === 'signature' && signature && (
                                <View style={styles.confirmationPreview}>
                                    <View style={styles.confirmationHeader}>
                                        <Ionicons name="create" size={20} color="#805AD5" />
                                        <Text style={styles.confirmationLabel}>Chữ ký khách hàng</Text>
                                    </View>
                                    <Image source={{ uri: signature }} style={styles.signatureImage} />
                                    <TouchableOpacity
                                        style={styles.changeMethodButton}
                                        onPress={() => {
                                            setSignature(null);
                                            setConfirmationMethod(null);
                                        }}
                                    >
                                        <Text style={styles.changeMethodText}>Đổi phương thức</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {/* QR Scan Preview */}
                            {confirmationMethod === 'qr' && scannedQR && (
                                <View style={styles.confirmationPreview}>
                                    <View style={styles.confirmationHeader}>
                                        <Ionicons name="qr-code" size={20} color="#3182CE" />
                                        <Text style={styles.confirmationLabel}>Mã QR đã quét</Text>
                                    </View>
                                    <View style={styles.qrCodeDisplay}>
                                        <Text style={styles.qrCodeText}>{scannedQR}</Text>
                                        <Ionicons name="checkmark-circle" size={24} color="#38A169" />
                                    </View>
                                    <TouchableOpacity
                                        style={styles.changeMethodButton}
                                        onPress={() => {
                                            setScannedQR(null);
                                            setConfirmationMethod(null);
                                        }}
                                    >
                                        <Text style={styles.changeMethodText}>Đổi phương thức</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* Delivery Notes Section */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Ghi chú giao hàng (tùy chọn)</Text>
                            <TextInput
                                style={styles.notesInput}
                                placeholder="Nhập ghi chú nếu có..."
                                value={deliveryNotes}
                                onChangeText={setDeliveryNotes}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Info Message */}
                        <View style={styles.infoBox}>
                            <Ionicons name="information-circle" size={20} color="#3182CE" />
                            <Text style={styles.infoText}>
                                Cần có ảnh giao hàng VÀ xác nhận khách hàng (chữ ký HOẶC quét QR)
                            </Text>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                (!proofImage || (!signature && !scannedQR)) && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={(!proofImage || (!signature && !scannedQR)) || uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                    <Text style={styles.submitButtonText}>
                                        Xác nhận giao hàng thành công
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>

            {/* Signature Pad Modal */}
            {
                showSignaturePad && (
                    <Modal visible={showSignaturePad} animationType="slide">
                        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
                            <View style={styles.signaturePadContainer}>
                                <View style={styles.signaturePadHeader}>
                                    <Text style={styles.signaturePadTitle}>
                                        Vui lòng ký vào ô bên dưới
                                    </Text>
                                    <TouchableOpacity onPress={() => setShowSignaturePad(false)}>
                                        <Ionicons name="close" size={28} color="#2D3748" />
                                    </TouchableOpacity>
                                </View>
                                <SignatureScreen
                                    ref={signatureRef}
                                    onOK={handleSignature}
                                    webStyle={`.m-signature-pad {box-shadow: none; border: none;} 
                                              .m-signature-pad--body {border: none;}
                                              .m-signature-pad--footer {display: none;}`}
                                />
                                <View style={styles.signaturePadFooter}>
                                    <TouchableOpacity
                                        style={[styles.signaturePadButton, { backgroundColor: '#FED7D7' }]}
                                        onPress={() => signatureRef.current?.clearSignature()}
                                    >
                                        <Text style={[styles.signaturePadButtonText, { color: '#C53030' }]}>Xóa</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.signaturePadButton}
                                        onPress={() => setShowSignaturePad(false)}
                                    >
                                        <Text style={styles.signaturePadButtonText}>Hủy</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.signaturePadButton, { backgroundColor: '#2F855A', flex: 2 }]}
                                        onPress={() => signatureRef.current?.readSignature()}
                                    >
                                        <Text style={[styles.signaturePadButtonText, { color: '#fff' }]}>Lưu chữ ký</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                )
            }

            {/* QR Input Modal */}
            {
                showQRInput && (
                    <Modal visible={showQRInput} animationType="slide" transparent={true}>
                        <View style={styles.qrInputOverlay}>
                            <View style={styles.qrInputContainer}>
                                <View style={styles.qrInputHeader}>
                                    <Text style={styles.qrInputTitle}>Quét mã QR</Text>
                                    <TouchableOpacity onPress={() => {
                                        setShowQRInput(false);
                                        setConfirmationMethod(null);
                                    }}>
                                        <Ionicons name="close" size={28} color="#2D3748" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.qrInputBody}>
                                    <Ionicons name="qr-code" size={64} color="#3182CE" />
                                    <Text style={styles.qrInputInstruction}>
                                        Nhập mã QR của đơn hàng
                                    </Text>

                                    <TextInput
                                        style={styles.qrTextInput}
                                        placeholder="Nhập mã QR..."
                                        value={scannedQR || ''}
                                        onChangeText={setScannedQR}
                                        autoCapitalize="characters"
                                        autoCorrect={false}
                                    />

                                    <TouchableOpacity
                                        style={styles.simulateScanButton}
                                        onPress={() => {
                                            setScannedQR("SCANNED_QR_DATA");
                                        }}
                                    >
                                        <Ionicons name="scan-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.simulateScanText}>Giả lập quét QR</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[
                                            styles.qrConfirmButton,
                                            !scannedQR && styles.qrConfirmButtonDisabled
                                        ]}
                                        onPress={() => {
                                            if (scannedQR) {
                                                setShowQRInput(false);
                                            }
                                        }}
                                        disabled={!scannedQR}
                                    >
                                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                                        <Text style={styles.qrConfirmButtonText}>Xác nhận</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )
            }
        </Modal >
    );
};

export default ProofOfDelivery;

const styles = StyleSheet.create({
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
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#2D3748",
        marginBottom: 12,
    },
    photoButtons: {
        flexDirection: "row",
        gap: 12,
    },
    photoButton: {
        flex: 1,
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    photoButtonText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
    },
    imagePreview: {
        position: "relative",
        borderRadius: 12,
        overflow: "hidden",
    },
    previewImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
    },
    removeButton: {
        position: "absolute",
        top: 8,
        right: 8,
        backgroundColor: "#fff",
        borderRadius: 12,
    },
    signatureButton: {
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    signatureButtonText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "500",
        color: "#4A5568",
    },
    signaturePreview: {
        position: "relative",
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 10,
    },
    signatureImage: {
        width: "100%",
        height: 150,
        borderRadius: 8,
    },
    submitButton: {
        backgroundColor: "#2F855A",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 12,
    },
    submitButtonDisabled: {
        backgroundColor: "#CBD5E0",
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    sectionSubtitle: {
        fontSize: 13,
        color: "#718096",
        marginBottom: 12,
    },
    methodSelection: {
        flexDirection: "row",
        gap: 12,
    },
    methodButton: {
        flex: 1,
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#E2E8F0",
        borderStyle: "dashed",
    },
    methodButtonText: {
        marginTop: 8,
        fontSize: 15,
        fontWeight: "600",
        color: "#2D3748",
    },
    methodButtonSubtext: {
        marginTop: 4,
        fontSize: 12,
        color: "#718096",
    },
    confirmationPreview: {
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#E2E8F0",
    },
    confirmationHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    confirmationLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
    },
    qrCodeDisplay: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    qrCodeText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2D3748",
        fontFamily: "monospace",
    },
    changeMethodButton: {
        alignItems: "center",
        paddingVertical: 8,
    },
    changeMethodText: {
        fontSize: 14,
        color: "#3182CE",
        fontWeight: "500",
    },
    notesInput: {
        backgroundColor: "#F7FAFC",
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        fontSize: 14,
        color: "#2D3748",
        minHeight: 80,
    },
    infoBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EBF8FF",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
        gap: 8,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: "#2C5282",
        lineHeight: 18,
    },
    qrSection: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0FFF4",
        padding: 16,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#9AE6B4",
    },
    qrTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#2F855A",
        marginBottom: 4,
    },
    qrCode: {
        fontSize: 12,
        color: "#22543D",
        fontFamily: "monospace",
    },
    signaturePadContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    signaturePadHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    signaturePadTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#2D3748",
    },
    signaturePadFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#E2E8F0",
        flexDirection: "row",
        gap: 12,
    },
    signaturePadButton: {
        backgroundColor: "#E2E8F0",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        flex: 1,
    },
    signaturePadButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#4A5568",
    },
    qrInputOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    qrInputContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        width: "100%",
        maxWidth: 400,
    },
    qrInputHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    qrInputTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#2D3748",
    },
    qrInputBody: {
        padding: 24,
        alignItems: "center",
    },
    qrInputInstruction: {
        fontSize: 16,
        color: "#4A5568",
        marginTop: 16,
        marginBottom: 20,
        textAlign: "center",
    },
    qrTextInput: {
        width: "100%",
        backgroundColor: "#F7FAFC",
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: "#E2E8F0",
        fontSize: 16,
        color: "#2D3748",
        textAlign: "center",
        fontWeight: "600",
        marginBottom: 20,
    },
    simulateScanButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#805AD5",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        gap: 8,
    },
    simulateScanText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
    qrConfirmButton: {
        backgroundColor: "#3182CE",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
    },
    qrConfirmButtonDisabled: {
        backgroundColor: "#CBD5E0",
    },
    qrConfirmButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
