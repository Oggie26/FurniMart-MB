import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { TRACKING_CONFIG } from '../../constants/api';
import { DriverLocationResponse, getDriverLocationByOrderId, updateDriverLocation } from '../../service/delivery/location';

export default function CustomerTrackingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const mapRef = useRef<MapView>(null);



    const getParam = (param: string | string[] | undefined): string => {
        return Array.isArray(param) ? param[0] : param || '';
    };

    const warehouseLoc = useMemo(() => ({
        latitude: params.storeLat ? parseFloat(getParam(params.storeLat)) : 10.79810,
        longitude: params.storeLng ? parseFloat(getParam(params.storeLng)) : 106.69165,
    }), [params.storeLat, params.storeLng]);

    const customerLoc = useMemo(() => ({
        latitude: params.customerLat ? parseFloat(getParam(params.customerLat)) : 10.7910517,
        longitude: params.customerLng ? parseFloat(getParam(params.customerLng)) : 106.6950748,
    }), [params.customerLat, params.customerLng]);

    const orderId = getParam(params.orderId);

    const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationInterval = useRef<any>(null);

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

    const startSimulation = async () => {
        if (simulationInterval.current) {
            clearInterval(simulationInterval.current);
            simulationInterval.current = null;
            setIsSimulating(false);
            return;
        }

        let coords = routeCoords;
        if (coords.length === 0) {
            coords = await fetchRoute(warehouseLoc, customerLoc);
        }

        if (coords.length === 0) {
            Alert.alert('Lỗi', 'Không thể tìm thấy đường đi');
            return;
        }

        setIsSimulating(true);
        let index = 0;
        simulationInterval.current = setInterval(async () => {
            if (index >= coords.length) {
                clearInterval(simulationInterval.current);
                simulationInterval.current = null;
                setIsSimulating(false);
                Alert.alert('🔔 Đã đến nơi', 'Shipper đã đến địa chỉ giao hàng thành công!');
                return;
            }

            const nextPos = coords[index];
            setDriverLocation(nextPos);

            try {
                // Update backend so others can see
                await updateDriverLocation({
                    orderId: parseInt(orderId),
                    driverId: "DEMO_DRIVER", // Mock driver ID for customer side simulation
                    lat: nextPos.latitude,
                    lng: nextPos.longitude,
                });
            } catch (e) {
                console.error('Simulation update error:', e);
            }

            index += 1;
        }, 1000);
    };



    const fetchDriverLocation = async () => {
        if (!orderId) {
            setError('Order ID not provided');
            setLoading(false);
            return;
        }

        try {
            const data: DriverLocationResponse = await getDriverLocationByOrderId(orderId);

            if (data && data.latitude && data.longitude) {
                setDriverLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                });
                setLastUpdated(new Date(data.lastUpdated).toLocaleTimeString('vi-VN'));
                setError('');
            }
        } catch (err: any) {
            console.warn('Failed to fetch driver location:', err);
            setError('Không thể lấy vị trí shipper');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDriverLocation();
        fetchRoute(warehouseLoc, customerLoc);
    }, [orderId]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchDriverLocation();
        }, TRACKING_CONFIG.UPDATE_INTERVAL);

        return () => {
            clearInterval(intervalId);
            if (simulationInterval.current) clearInterval(simulationInterval.current);
        };
    }, [orderId]);

    const [hasInitialFit, setHasInitialFit] = useState(false);
    useEffect(() => {
        if (mapRef.current && (driverLocation || routeCoords.length > 0) && !hasInitialFit) {
            const coordinates = routeCoords.length > 0 ? routeCoords : [warehouseLoc, customerLoc];
            if (driverLocation) coordinates.push(driverLocation);

            mapRef.current.fitToCoordinates(coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
            });
            setHasInitialFit(true);
        }
    }, [driverLocation, routeCoords, hasInitialFit]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
                    <Text style={styles.headerSubtitle}>#{orderId}</Text>
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
                showsUserLocation={false}
                showsMyLocationButton={false}
            >
                {/* Warehouse Marker - Blue */}
                <Marker
                    coordinate={warehouseLoc}
                    title="Kho hàng"
                    description="Điểm xuất phát"
                >
                    <View style={[styles.markerContainer, { backgroundColor: '#3b82f6' }]}>
                        <Ionicons name="business" size={20} color="white" />
                    </View>
                </Marker>

                <Marker
                    coordinate={customerLoc}
                    title="Địa chỉ giao hàng"
                    description="Điểm đến"
                >
                    <View style={[styles.markerContainer, { backgroundColor: '#ef4444' }]}>
                        <Ionicons name="home" size={20} color="white" />
                    </View>
                </Marker>

                {driverLocation && (
                    <Marker
                        coordinate={driverLocation}
                        title="Shipper"
                        description="Đang trên đường giao hàng"
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={[styles.driverMarker]}>
                            <Text style={styles.truckEmoji}>🚚</Text>
                        </View>
                    </Marker>
                )}

                {routeCoords.length > 0 && (
                    <Polyline
                        coordinates={routeCoords}
                        strokeColor="#3b82f6"
                        strokeWidth={4}
                    />
                )}

                {driverLocation && (
                    <>
                        <Polyline
                            coordinates={[warehouseLoc, driverLocation]}
                            strokeColor="#10b981"
                            strokeWidth={3}
                        />
                        <Polyline
                            coordinates={[driverLocation, customerLoc]}
                            strokeColor="#94a3b8"
                            strokeWidth={3}
                            lineDashPattern={[10, 5]}
                        />
                    </>
                )}
            </MapView>

            <View style={styles.infoCard}>
                {loading && !driverLocation ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#16a34a" />
                        <Text style={styles.loadingText}>Đang tải vị trí shipper...</Text>
                    </View>
                ) : error && !driverLocation ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle" size={24} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.errorSubtext}>Shipper chưa bắt đầu giao hàng</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.infoHeader}>
                            <View style={styles.statusBadge}>
                                <View style={styles.pulsingDot} />
                                <Text style={styles.statusText}>Đang giao hàng</Text>
                            </View>
                            <Text style={styles.orderIdText}>Đơn #{orderId}</Text>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Ionicons name="location" size={18} color="#6b7280" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Vị trí hiện tại</Text>
                                {driverLocation && (
                                    <Text style={styles.infoValue}>
                                        {driverLocation.latitude.toFixed(6)}, {driverLocation.longitude.toFixed(6)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="time" size={18} color="#6b7280" />
                            <View style={styles.infoTextContainer}>
                                <Text style={styles.infoLabel}>Cập nhật lần cuối</Text>
                                <Text style={styles.infoValue}>{lastUpdated || 'Đang tải...'}</Text>
                            </View>
                        </View>

                        <View style={styles.refreshIndicator}>
                            <View style={styles.refreshDot} />
                            <Text style={styles.refreshText}>Tự động cập nhật mỗi 3 giây</Text>
                        </View>

                        <TouchableOpacity
                            style={{ marginTop: 15, backgroundColor: '#6366f1', padding: 12, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }}
                            onPress={startSimulation}
                        >
                            <Ionicons name="flask" size={20} color="white" />
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>
                                {isSimulating ? 'Dừng mô phỏng' : 'Demo: Xem thử Shipper di chuyển'}
                            </Text>
                        </TouchableOpacity>


                    </>
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
        height: Dimensions.get('window').height - 350,
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
        borderColor: '#3b82f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    truckEmoji: {
        fontSize: 28,
    },
    infoCard: {
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
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
    },
    loadingText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    errorContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    errorText: {
        fontSize: 14,
        color: '#ef4444',
        fontWeight: '600',
        marginTop: 8,
    },
    errorSubtext: {
        fontSize: 12,
        color: '#9ca3af',
        marginTop: 4,
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    pulsingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#16a34a',
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#16a34a',
    },
    orderIdText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6b7280',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    infoTextContainer: {
        flex: 1,
        marginLeft: 12,
    },
    infoLabel: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    refreshIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    refreshDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#3b82f6',
        marginRight: 6,
    },
    refreshText: {
        fontSize: 11,
        color: '#9ca3af',
        fontStyle: 'italic',
    },
});
