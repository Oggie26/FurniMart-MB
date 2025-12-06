import axiosClient from "../axiosClient";

export const addFavoriteProduct = async (productId: string | string[]) => {
    try {
        const response = await axiosClient.post(`/favorites`, {
            productId,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const removeFavoriteProduct = async (productId: string | string[]) => {
    try {
        const response = await axiosClient.delete(`/favorites/${productId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getFavoriteProducts = async () => {
    try {
        const response = await axiosClient.get(`/favorites`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const checkFavoriteProduct = async (productId: string | string[]) => {
    try {
        const response = await axiosClient.get(`/favorites/productId=${productId}/check`);
        return response;
    } catch (error) {
        throw error;
    }
}
