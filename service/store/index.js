import axiosClient from "../axiosClient";
export const getStoreById = async (storeId) => {
    try {
        const response = await axiosClient.get(`/stores/${storeId}`);
        return response;
    } catch (error) {
        throw error;
    }
}