

export const DRIVER_LOCATION_ENDPOINTS = {
    UPDATE: '/driver-location/update',
    GET_BY_ORDER: (orderId: number) => `/driver-location/order/${orderId}`,
    GET_BY_DRIVER: (driverId: string) => `/driver-location/driver/${driverId}`,
};

export const TRACKING_CONFIG = {
    UPDATE_INTERVAL: 3000,
    LOCATION_ACCURACY: 'high' as const,
    DISTANCE_FILTER: 10,
};
