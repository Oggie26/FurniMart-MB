import axiosClient from "../axiosClient";

export const getProducts = async () => {
    try {
        const response = await axiosClient.get("/products");
        return response;
    } catch (error) {
        throw error;
    }
};

export const getProductById = async (id) => {
    try {
        const response = await axiosClient.get(`/products/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getProductColorById = (id) => {
    try {
        const response = axiosClient.get(`/product-colors/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getAvailableProducts = async (productColorId) => {
    try {
        const response = await axiosClient.get(`/inventories/stock/total-available?productColorId=${productColorId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const getProductStock = async (productColorId) => {
    try {
        const response = await axiosClient.get(`/inventories/stock/locations/all?productColorId=${productColorId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export const addFavoriteProduct = async (productId) => {
    try {
        const response = await axiosClient.post(`/favorites`, {
            productId,
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export const removeFavoriteProduct = async (productId) => {
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

export const checkFavoriteProduct = async (productId) => {
    try {
        const response = await axiosClient.get(`/favorites/productId=${productId}/check`);
        return response;
    } catch (error) {
        throw error;
    }
}
