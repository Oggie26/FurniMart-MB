import axiosClient from "../axiosClient";

export const getOrderByCustomer = async (keyword = "", page = 0, size = 10) => {
  try {
    const encodedKeyword = encodeURIComponent(keyword || "");

    const response = await axiosClient.get(
      `/orders/search/customer?keyword=${encodedKeyword}&page=${page}&size=${size}`
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ getOrderByCustomer error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await axiosClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("getOrderById error:", error.response?.data || error.message);
    throw error;
  }
};

export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await axiosClient.post(`/orders/cancel`, { orderId, reason });
    return response.data;
  } catch (error) {
    console.error("cancelOrder error:", error.response?.data || error.message);
    throw error;
  }
};


export const getWarrantyByCustomerId = async (customerId) => {
  try {
    const response = await axiosClient.get(`/orders/warranty/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("getWarrantyByCustomer error:", error.response?.data || error.message);
    throw error;
  }
};

export const getWarrantyByOrderId = async (orderId) => {
  try {
    const response = await axiosClient.get(`/warranties/order/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("getWarrantyByOrderId error:", error.response?.data || error.message);
    throw error;
  }
};

export const createRequestWarranty = async (warrantyRequest) => {
  try {
    const response = await axiosClient.post(`/warranties/claims`, warrantyRequest);
    return response.data;
  } catch (error) {
    console.error("createRequestWarranty error:", error.response?.data || error.message);
    throw error;
  }
};