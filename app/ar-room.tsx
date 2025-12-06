import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ARRoomViewer from '../components/ar/ARRoomViewer';
import { getProductById } from '../service/product';
import { getFavoriteProducts } from '../service/product/favorites';

export default function ARRoomScreen() {
    const router = useRouter();
    const [showARRoom, setShowARRoom] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [favoriteItems, setFavoriteItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchFavorites = async () => {
        try {
            const response = await getFavoriteProducts();
            if (response?.status === 200) {
                const favs = response.data.data || [];
                setFavoriteItems(favs);
                console.log('favoriteItems', favs);
                const productsPromises = favs.map(async (fav: any) => {
                    try {
                        const productResponse = await getProductById(fav.productId);
                        if (productResponse?.status === 200) {
                            return productResponse.data.data;
                        }
                        return null;
                    } catch (error) {
                        console.error(`Lỗi khi lấy sản phẩm ${fav.productId}:`, error);
                        return null;
                    }
                });

                const fetchedProducts = await Promise.all(productsPromises);

                const arProducts = fetchedProducts
                    .filter((p: any) => p !== null)
                    .map((p: any) => {
                        // Tìm color có models3D
                        const modelColor = p.productColors.find((c: any) => c.models3D?.length > 0);
                        if (!modelColor) return null;

                        return {
                            id: p.id,
                            name: p.name,
                            thumbnailImage: p.thumbnailImage || p.image || modelColor.images?.[0]?.image,
                            price: p.price,
                            modelUrl: modelColor.models3D[0].modelUrl
                        };
                    })
                    .filter(p => p !== null);

                setProducts(arProducts);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách AR:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={[styles.header, { justifyContent: 'flex-start', gap: 16 }]}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={26} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AR Room</Text>
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2f855a" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <>
            {showARRoom ? (
                <ARRoomViewer
                    products={products}
                    onClose={() => setShowARRoom(false)}
                />
            ) : (
                <SafeAreaView style={styles.container} edges={['top']}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons name="arrow-back" size={26} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>AR Room</Text>
                            <View style={{ width: 26 }} />
                        </View>

                        {/* Hero Section */}
                        <LinearGradient
                            colors={['#2f855a', '#38a169']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.heroSection}
                        >
                            <Ionicons name="cube-outline" size={80} color="#fff" />
                            <Text style={styles.heroTitle}>Thiết Kế Phòng Của Bạn</Text>
                            <Text style={styles.heroSubtitle}>
                                Đặt nhiều sản phẩm vào không gian thật
                            </Text>
                            <Text style={styles.heroSubtitle}>
                                Giống như IKEA Place
                            </Text>
                        </LinearGradient>

                        {/* Features */}
                        <View style={styles.featuresSection}>
                            <Text style={styles.sectionTitle}>✨ Tính Năng</Text>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="camera" size={24} color="#2f855a" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Camera AR</Text>
                                    <Text style={styles.featureDescription}>
                                        Bật camera và nhận diện bề mặt tự động
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="infinite" size={24} color="#2f855a" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Đặt Vô Hạn</Text>
                                    <Text style={styles.featureDescription}>
                                        Thêm bao nhiêu sản phẩm tùy thích
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="hand-left" size={24} color="#2f855a" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Tương Tác Dễ Dàng</Text>
                                    <Text style={styles.featureDescription}>
                                        Chọn sản phẩm → Nhấn màn hình → Đặt
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.featureCard}>
                                <View style={styles.featureIcon}>
                                    <Ionicons name="trash" size={24} color="#2f855a" />
                                </View>
                                <View style={styles.featureContent}>
                                    <Text style={styles.featureTitle}>Xóa & Làm Lại</Text>
                                    <Text style={styles.featureDescription}>
                                        Xóa tất cả và bắt đầu lại bất cứ lúc nào
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* How to Use */}
                        <View style={styles.instructionsSection}>
                            <Text style={styles.sectionTitle}>📖 Cách Sử Dụng</Text>

                            <View style={styles.stepCard}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>1</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    Nhấn nút "Mở AR Room" bên dưới
                                </Text>
                            </View>

                            <View style={styles.stepCard}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>2</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    Camera sẽ bật và quét bề mặt
                                </Text>
                            </View>

                            <View style={styles.stepCard}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>3</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    Chọn sản phẩm từ danh sách bên dưới
                                </Text>
                            </View>

                            <View style={styles.stepCard}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>4</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    Nhấn vào màn hình để đặt sản phẩm
                                </Text>
                            </View>

                            <View style={styles.stepCard}>
                                <View style={styles.stepNumber}>
                                    <Text style={styles.stepNumberText}>5</Text>
                                </View>
                                <Text style={styles.stepText}>
                                    Lặp lại để đặt thêm sản phẩm khác
                                </Text>
                            </View>
                        </View>

                        {/* Sample Products */}
                        <View style={styles.productsSection}>
                            <Text style={styles.sectionTitle}>
                                🛋️ Sản Phẩm Yêu Thích Của Bạn ({favoriteItems.length})
                            </Text>
                            <Text style={styles.productsSubtitle}>
                                {favoriteItems.length > 0
                                    ? 'Các sản phẩm sau đã sẵn sàng AR'
                                    : 'Chưa có sản phẩm nào có AR trong danh sách yêu thích'}
                            </Text>

                            {favoriteItems
                                .map(fav => products.find(p => p.id === fav.productId))
                                .filter(p => p) // loại bỏ null
                                .map(product => (
                                    <View key={product.id} style={styles.productPreview}>
                                        <Image
                                            source={{ uri: product.thumbnailImage }}
                                            style={styles.productPreviewImage}
                                            resizeMode="cover"
                                        />
                                        <Text style={styles.productPreviewName} numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                    </View>
                                ))}
                        </View>

                        {/* Important Notes */}
                        <View style={styles.notesSection}>
                            <Text style={styles.sectionTitle}>⚠️ Lưu Ý</Text>

                            <View style={styles.noteCard}>
                                <Ionicons name="phone-portrait" size={20} color="#e67e22" />
                                <Text style={styles.noteText}>
                                    Chỉ hoạt động trên thiết bị thật (không phải emulator)
                                </Text>
                            </View>

                            <View style={styles.noteCard}>
                                <Ionicons name="sunny" size={20} color="#e67e22" />
                                <Text style={styles.noteText}>
                                    Cần ánh sáng tốt để nhận diện bề mặt
                                </Text>
                            </View>

                            <View style={styles.noteCard}>
                                <Ionicons name="wifi" size={20} color="#e67e22" />
                                <Text style={styles.noteText}>
                                    Cần kết nối internet để tải mô hình 3D
                                </Text>
                            </View>
                        </View>

                        {/* Start Button */}
                        <TouchableOpacity
                            style={styles.startButton}
                            onPress={() => setShowARRoom(true)}
                        >
                            <LinearGradient
                                colors={['#2f855a', '#38a169']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.startButtonGradient}
                            >
                                <Ionicons name="cube" size={24} color="#fff" />
                                <Text style={styles.startButtonText}>Mở AR Room</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#212529',
    },
    heroSection: {
        padding: 40,
        alignItems: 'center',
        marginBottom: 24,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    heroSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginBottom: 16,
    },
    featureCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        color: '#6c757d',
        lineHeight: 20,
    },
    instructionsSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    stepCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2f855a',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    stepNumberText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepText: {
        flex: 1,
        fontSize: 15,
        color: '#212529',
    },
    productsSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    productsSubtitle: {
        fontSize: 14,
        color: '#6c757d',
        marginBottom: 16,
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    productPreview: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productPreviewImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#f0f0f0',
    },
    productPreviewName: {
        padding: 12,
        fontSize: 13,
        fontWeight: '600',
        color: '#212529',
    },
    notesSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3cd',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        gap: 12,
    },
    noteText: {
        flex: 1,
        fontSize: 13,
        color: '#856404',
    },
    startButton: {
        marginHorizontal: 20,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#2f855a',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    startButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        gap: 12,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
