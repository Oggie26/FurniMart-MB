import axiosClient from "../axiosClient";

export const getProducts = async () => {
    try {
        const response = await axiosClient.get("/products");
        return response;
    } catch (error) {
        throw error;
    }
};

export const getProductById = (id) => {
    try {
        const response = axiosClient.get(`/products/${id}`);
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