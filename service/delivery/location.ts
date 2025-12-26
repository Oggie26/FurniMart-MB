import { DRIVER_LOCATION_ENDPOINTS } from '../../constants/api';
import axiosClient from '../axiosClient';

export interface DriverLocationUpdate {
    orderId: number;
    driverId: string;
    lat: number;
    lng: number;
}

export interface DriverLocationResponse {
    orderId: number;
    driverId: string;
    latitude: number;
    longitude: number;
    lastUpdated: string;
}

export const updateDriverLocation = async (data: DriverLocationUpdate) => {
    try {
        const response = await axiosClient.post(DRIVER_LOCATION_ENDPOINTS.UPDATE, data);
        return response.data;
    } catch (error) {
        console.error('updateDriverLocation error:', error);
        throw error;
    }
};


export const getDriverLocationByOrderId = async (orderId: number | string): Promise<DriverLocationResponse> => {
    try {
        const response = await axiosClient.get(DRIVER_LOCATION_ENDPOINTS.GET_BY_ORDER(orderId));
        return response.data;
    } catch (error) {
        console.error('getDriverLocationByOrderId error:', error);
        throw error;
    }
};

export const getDriverLocationByDriverId = async (driverId: string): Promise<DriverLocationResponse> => {
    try {
        const response = await axiosClient.get(DRIVER_LOCATION_ENDPOINTS.GET_BY_DRIVER(driverId));
        return response.data;
    } catch (error) {
        console.error('getDriverLocationByDriverId error:', error);
        throw error;
    }
};
