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
