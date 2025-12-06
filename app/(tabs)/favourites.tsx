import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ARButton from '../../components/ar/ARButton';
import { getProductById } from '../../service/product';
import { getFavoriteProducts, removeFavoriteProduct } from '../../service/product/favorites';

export default function FavouritesTab() {
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFavorites = async () => {
        try {
            const response = await getFavoriteProducts();
            if (response?.status === 200) {
                const favoriteItems = response.data.data || [];

                // Fetch full product details for each favorite
                const productsPromises = favoriteItems.map(async (fav: any) => {
                    try {
                        const productResponse = await getProductById(fav.productId);
                        if (productResponse?.status === 200) {
                            return {
                                ...productResponse.data.data,
                                favoriteId: fav.id, // Keep favorite ID for removal
                            };
                        }
                        return null;
                    } catch (error) {
                        console.error(`Lỗi khi lấy sản phẩm ${fav.productId}:`, error);
                        return null;
                    }
                });

                const products = await Promise.all(productsPromises);
                const validProducts = products.filter(p => p !== null);
                setFavorites(validProducts);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách yêu thích:', error);
            Toast.show({
                type: 'error',
                text1: 'Không thể tải danh sách yêu thích',
                position: 'top',
            });
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFavorites();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchFavorites();
    };

    const handleRemoveFavorite = async (productId: string) => {
        try {
            await removeFavoriteProduct(productId);
            setFavorites(favorites.filter(item => item.id !== productId));
            Toast.show({
                type: 'success',
                text1: 'Đã xóa khỏi yêu thích',
                position: 'top',
                visibilityTime: 1000,
            });
        } catch (error) {
            console.error('Lỗi khi xóa yêu thích:', error);
            Toast.show({
                type: 'error',
                text1: 'Không thể xóa sản phẩm',
                position: 'top',
            });
        }
    };

    const handleProductPress = (productId: string) => {
        router.push(`/(product)/${productId}`);
    };

    const renderItem = ({ item }: { item: any }) => {
        const hasModel = item.productColors?.[0]?.models3D?.length > 0;
        const modelUrl = hasModel ? item.productColors[0].models3D[0].modelUrl : null;
        const imageUrl = item.thumbnailImage || item.image || item.productColors?.[0]?.images?.[0]?.image;

        return (
            <View style={styles.card}>
                <TouchableOpacity
                    style={styles.imageContainer}
                    onPress={() => handleProductPress(item.id)}
                >
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.productImage}
                        resizeMode="cover"
                    />

                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveFavorite(item.id)}
                    >
                        <Ionicons name="heart" size={24} color="#e74c3c" />
                    </TouchableOpacity>

                    {hasModel && (
                        <View style={styles.arBadge}>
                            <Ionicons name="cube-outline" size={16} color="#fff" />
                            <Text style={styles.arBadgeText}>AR</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    <TouchableOpacity onPress={() => handleProductPress(item.id)}>
                        <Text style={styles.productName} numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text style={styles.productCategory}>
                            {item.categoryName || 'Danh mục khác'}
                        </Text>
                        <Text style={styles.productPrice}>
                            {item.price && item.price > 0
                                ? `${item.price.toLocaleString()} ₫`
                                : 'Liên hệ'}
                        </Text>
                    </TouchableOpacity>

                    {hasModel && modelUrl && (
                        <View style={styles.arButtonContainer}>
                            <ARButton
                                modelUrl={modelUrl}
                                buttonText="XEM AR"
                                size="small"
                                variant="gradient"
                            />
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => handleProductPress(item.id)}
                    >
                        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                        <Ionicons name="arrow-forward" size={16} color="#2f855a" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có sản phẩm yêu thích</Text>
            <Text style={styles.emptySubtitle}>
                Thêm sản phẩm vào danh sách yêu thích để xem lại sau
            </Text>
            <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push('/(tabs)/home')}
            >
                <LinearGradient
                    colors={['#2f855a', '#38a169']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.browseButtonGradient}
                >
                    <Text style={styles.browseButtonText}>Khám phá sản phẩm</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
                    <View style={styles.headerRight}>
                        <Text style={styles.countBadge}>0</Text>
                    </View>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2f855a" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Sản phẩm yêu thích</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerArButton}
                        onPress={() => router.push('/ar-room')}
                    >
                        <Ionicons name="cube" size={20} color="#2f855a" />
                    </TouchableOpacity>
                    <Text style={styles.countBadge}>{favorites.length}</Text>
                </View>
            </View>

            <FlatList
                data={favorites}
                renderItem={renderItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#2f855a']}
                        tintColor="#2f855a"
                    />
                }
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
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
        fontSize: 24,
        fontWeight: '700',
        color: '#212529',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    headerArButton: {
        padding: 8,
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dcfce7',
    },
    countBadge: {
        backgroundColor: '#2f855a',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        backgroundColor: '#f0f0f0',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    removeButton: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    arBadge: {
        position: 'absolute',
        top: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(47, 133, 90, 0.95)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    arBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    infoContainer: {
        padding: 16,
    },
    productName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    productCategory: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 8,
    },
    productPrice: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2f855a',
        marginBottom: 12,
    },
    arButtonContainer: {
        marginBottom: 12,
    },
    detailButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2f855a',
        backgroundColor: 'transparent',
        gap: 8,
    },
    detailButtonText: {
        color: '#2f855a',
        fontSize: 15,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#212529',
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 20,
    },
    browseButton: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    browseButtonGradient: {
        paddingVertical: 14,
        paddingHorizontal: 32,
    },
    browseButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
