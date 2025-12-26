import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { TRACKING_CONFIG } from '../../constants/api';
import { getDeliveryAssignmentByOrderId } from '../../service/delivery/index';
import { updateDriverLocation } from '../../service/delivery/location';
import { cancelOrder } from '../../service/order/index';
export default function ShipperDeliveryScreen() {


    const router = useRouter();
    const params = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);

    const orderIdParam = Array.isArray(params.orderId) ? params.orderId[0] : params.orderId;
    const orderId = orderIdParam || '';
    const [driverId, setDriverId] = useState<string>('');
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [loading, setLoading] = useState(true);

    const getParam = (param: string | string[] | undefined): string => {
        return Array.isArray(param) ? param[0] : param || '';
    };

    const [deliveryData, setDeliveryData] = useState<any>(null);
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [warehouseLoc, setWarehouseLoc] = useState({
        latitude: params.storeLat ? parseFloat(getParam(params.storeLat)) : 10.0,
        longitude: params.storeLng ? parseFloat(getParam(params.storeLng)) : 106.0,
    });

    const [customerLoc, setCustomerLoc] = useState({
        latitude: params.customerLat ? parseFloat(getParam(params.customerLat)) : 10.0,
        longitude: params.customerLng ? parseFloat(getParam(params.customerLng)) : 106.0,
    });

    const requestLocationPermission = async () => {
        try {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

            if (foregroundStatus !== 'granted') {
                Alert.alert('Quyền truy cập bị từ chối', 'Vui lòng cấp quyền truy cập vị trí để sử dụng tính năng này.');
                setLoading(false);
                return false;
            }

            if (Platform.OS !== 'web') {
                const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
                if (backgroundStatus !== 'granted') {
                    console.warn('Background location permission not granted');
                }
            }

            setPermissionGranted(true);
            setLoading(false);
            return true;
        } catch (error) {
            console.error('Permission error:', error);
            Alert.alert('Lỗi', 'Không thể yêu cầu quyền truy cập vị trí');
            setLoading(false);
            return false;
        }
    };

    const fetchDeliveryData = async () => {
        console.log('Attempting to fetch data for OrderId:', orderId);
        if (!orderId) {
            setLoading(false);
            return;
        }

        try {
            const response = await getDeliveryAssignmentByOrderId(orderId);
            const data = response.data;
            console.log('API Response:', data);

            if (data) {


                setDeliveryData(data);
                setDriverId(data.deliveryStaffId);

                if (data.order?.address?.latitude && data.order?.address?.longitude) {
                    const newCustomerLoc = {
                        latitude: data.order.address.latitude,
                        longitude: data.order.address.longitude
                    };
                    console.log('--- FETCHED CUSTOMER LOC ---', newCustomerLoc);
                    setCustomerLoc(newCustomerLoc);
                }
            }
        } catch (error) {
            console.error('Failed to fetch delivery assignment:', error);
            Alert.alert('Lỗi', 'Không thể lấy thông tin giao hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoute = async (start: any, end: any) => {
        try {
            const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.routes && data.routes[0]) {
                const coordinates = data.routes[0].geometry.coordinates.map((coord: any) => ({
                    latitude: coord[1],
                    longitude: coord[0],
                }));
                setRouteCoords(coordinates);
                return coordinates;
            }
        } catch (error) {
            console.error('Failed to fetch route:', error);
        }
        return [];
    };

    const handleCancelOrder = () => {
        Alert.prompt(
            "Xác nhận huỷ",
            "Vui lòng nhập lý do huỷ đơn hàng:",
            [
                {
                    text: "Đóng",
                    style: "cancel"
                },
                {
                    text: "Xác nhận huỷ",
                    onPress: async (reason: string | undefined) => {
                        if (!reason || reason.trim() === "") {
                            Alert.alert("Lỗi", "Bạn phải nhập lý do huỷ");
                            return;
                        }
                        try {
                            setLoading(true);
                            await cancelOrder(orderId, reason);
                            Alert.alert("Thành công", "Đơn hàng đã được huỷ.");
                            router.back();
                        } catch (error) {
                            Alert.alert("Lỗi", "Không thể huỷ đơn hàng. Vui lòng thử lại.");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ],
            "plain-text"
        );
    };

    const startTracking = async () => {
        if (!permissionGranted) {
            const granted = await requestLocationPermission();
            if (!granted) return;
        }

        try {
            setIsTracking(true);

            const initialLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const initialCoords = {
                latitude: initialLocation.coords.latitude,
                longitude: initialLocation.coords.longitude,
            };

            setCurrentLocation(initialCoords);
            await updateDriverLocation({
                orderId: parseInt(orderId),
                driverId: driverId,
                lat: initialCoords.latitude,
                lng: initialCoords.longitude,
            });

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: TRACKING_CONFIG.UPDATE_INTERVAL,
                    distanceInterval: TRACKING_CONFIG.DISTANCE_FILTER,
                },
                async (location) => {
                    const newCoords = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };

                    setCurrentLocation(newCoords);

                    try {
                        await updateDriverLocation({
                            orderId: parseInt(orderId),
                            driverId: driverId,
                            lat: newCoords.latitude,
                            lng: newCoords.longitude,
                        });
                        console.log('Location updated:', newCoords);
                    } catch (error) {
                        console.error('Failed to update location:', error);
                    }
                }
            );

            setLocationSubscription(subscription);
            Alert.alert('Thành công', 'Bắt đầu theo dõi vị trí');
        } catch (error) {
            console.error('Start tracking error:', error);
            Alert.alert('Lỗi', 'Không thể bắt đầu theo dõi vị trí');
            setIsTracking(false);
        }
    };


    // Stop tracking location
    const stopTracking = () => {
        if (locationSubscription) {
            locationSubscription.remove();
            setLocationSubscription(null);
        }
        setIsTracking(false);
        Alert.alert('Đã dừng', 'Đã dừng theo dõi vị trí');
    };

    // Initialize
    useEffect(() => {
        requestLocationPermission();
        fetchDeliveryData();
    }, []);

    // Fetch route when locations are available
    useEffect(() => {
        if (warehouseLoc.latitude !== 10.0 && customerLoc.latitude !== 10.0) {
            console.log('Fetching route for:', warehouseLoc, customerLoc);
            fetchRoute(warehouseLoc, customerLoc);
        }
    }, [warehouseLoc, customerLoc]);

    // Handle cleanup
    useEffect(() => {
        return () => {
            if (locationSubscription) {
                locationSubscription.remove();
            }
        };
    }, []);

    // Log coordinates when they change
    useEffect(() => {
        console.log('Coordinates initialized/updated:');
        console.log('1. Warehouse (Blue):', warehouseLoc);
        console.log('2. Customer (Red):', customerLoc);
        console.log('3. Driver (Current):', currentLocation || 'Not started');
    }, [warehouseLoc, customerLoc, currentLocation]);

    // Fit map only once or when coordinates are vastly different
    const [hasInitialFit, setHasInitialFit] = useState(false);
    useEffect(() => {
        if (mapRef.current && (currentLocation || routeCoords.length > 0) && !hasInitialFit) {
            const coordinates = routeCoords.length > 0 ? routeCoords : [warehouseLoc, customerLoc];
            if (currentLocation) coordinates.push(currentLocation);

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
            });
            setHasInitialFit(true);
        }
    }, [currentLocation, routeCoords, hasInitialFit]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={styles.loadingText}>Đang khởi tạo...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Giao hàng</Text>
                    <Text style={styles.headerSubtitle}>Đơn #{orderId}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Map */}
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    ...warehouseLoc,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {/* Warehouse Marker */}
                <Marker coordinate={warehouseLoc} title="Kho hàng" description="Điểm xuất phát">
                    <View style={[styles.markerContainer, { backgroundColor: '#3b82f6' }]}>
                        <Ionicons name="business" size={20} color="white" />
                    </View>
                </Marker>

                {/* Customer Marker */}
                <Marker coordinate={customerLoc} title="Địa chỉ giao hàng" description="Điểm đến">
                    <View style={[styles.markerContainer, { backgroundColor: '#ef4444' }]}>
                        <Ionicons name="home" size={20} color="white" />
                    </View>
                </Marker>

                {/* Current Location Marker */}
                {currentLocation && (
                    <Marker
                        coordinate={currentLocation}
                        title="Vị trí của bạn"
                        description="Đang giao hàng"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.driverMarker}>
                            <Text style={styles.truckEmoji}>🚚</Text>
                        </View>
                    </Marker>
                )}

                {/* Route Polyline (Actual Road) */}
                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                    />
                )}

                {/* Tracking Path */}
                {currentLocation && (
                    <>
                        <Polyline
                            coordinates={[warehouseLoc, currentLocation]}
                            strokeColor="#10b981"
                            strokeWidth={3}
                        />
                        <Polyline
                            coordinates={[currentLocation, customerLoc]}
                            strokeColor="#94a3b8"
                            strokeWidth={3}
                            lineDashPattern={[10, 5]}
                        />
                    </>
                )}
            </MapView>

            <View style={styles.controlCard}>
                <View style={styles.statusSection}>
                    <View style={[styles.statusIndicator, { backgroundColor: isTracking ? '#dcfce7' : '#fee2e2' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isTracking ? '#16a34a' : '#ef4444' }]} />
                        <Text style={[styles.statusText, { color: isTracking ? '#16a34a' : '#ef4444' }]}>
                            {isTracking ? 'Đang giao hàng' : 'Chưa bắt đầu'}
                        </Text>
                    </View>
                </View>

                {currentLocation && (
                    <View style={styles.infoSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={16} color="#6b7280" />
                            <Text style={styles.infoText}>
                                {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                            </Text>
                        </View>
                        {isTracking && (
                            <View style={styles.infoRow}>
                                <Ionicons name="sync" size={16} color="#6b7280" />
                                <Text style={styles.infoText}>Cập nhật mỗi 3 giây</Text>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.buttonSection}>
                    {!isTracking ? (
                        <View style={{ gap: 10 }}>
                            <TouchableOpacity
                                style={[styles.controlButton, styles.startButton]}
                                onPress={startTracking}
                            >
                                <Ionicons name="play-circle" size={24} color="white" />
                                <Text style={styles.buttonText}>Bắt đầu giao hàng</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.controlButton, styles.cancelButton]}
                                onPress={handleCancelOrder}
                            >
                                <Ionicons name="close-circle" size={24} color="white" />
                                <Text style={styles.buttonText}>Huỷ đơn hàng</Text>
                            </TouchableOpacity>


                        </View>
                    ) : (
                        <TouchableOpacity
                            style={[styles.controlButton, styles.stopButton]}
                            onPress={stopTracking}
                        >
                            <Ionicons name="stop-circle" size={24} color="white" />
                            <Text style={styles.buttonText}>Dừng theo dõi</Text>
                        </TouchableOpacity>
                    )}
                </View>


                {isTracking && (
                    <View style={styles.warningSection}>
                        <Ionicons name="information-circle" size={16} color="#f59e0b" />
                        <Text style={styles.warningText}>
                            Vị trí của bạn đang được chia sẻ với khách hàng
                        </Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 3,
    },
    backButton: {
        padding: 8,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 2,
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height - 400,
    },
    markerContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    driverMarker: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#ffffff',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: '#16a34a',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    truckEmoji: {
        fontSize: 28,
    },
    controlCard: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    statusSection: {
        marginBottom: 16,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    infoSection: {
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 13,
        color: '#6b7280',
    },
    buttonSection: {
        marginBottom: 12,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    startButton: {
        backgroundColor: '#16a34a',
    },
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    stopButton: {
        backgroundColor: '#ef4444',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    warningSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fffbeb',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        color: '#92400e',
    },
});
