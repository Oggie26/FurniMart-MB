import axiosClient from "../axiosClient";

export const getCart = async () => {
    try {
        const response = await axiosClient.get("/carts");
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addToCart = async ({ productColorId, quantity }) => {
  try {
    const response = await axiosClient.post(
      `/carts/add?productColorId=${productColorId}&quantity=${quantity}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm vào giỏ:", error.response?.data || error);
    throw error;
  }
};

export const removeCart = async (productColorId) => {
  try {
    const response = await axiosClient.delete(`/carts/remove/${productColorId}`);
    return response;
  } catch (error) {
    console.error("removeCart error:", error.response?.data || error.message);
    throw error;
  }
};

export const updateCart = async (productColorId, quantity) => {
  try {
    const response = await axiosClient.patch(`/carts/update`, null, {
      params: {
        productColorId: productColorId,
        quantity: quantity,
      },
      paramsSerializer: {
        indexes: null,
      },
    });
    return response;
  } catch (error) {
    console.error("updateCart error:", error.response?.data || error.message);
    throw error;
  }
};
export const checkout = async ({ addressId, cartId, voucherCode, paymentMethod }) => {
  try {
    const url = `/orders/mobile/checkout?addressId=${addressId}&cartId=${cartId}${voucherCode ? `&voucherCode=${voucherCode}` : ""
    }&paymentMethod=${paymentMethod}`;

    const response = await axiosClient.post(url);
    return response.data;
  } catch (error) {
    console.error("Checkout error:", error.response?.data || error.message);
    throw error;
  }
};

export const getCartById = async (cartId) => {
    try {
        const response = await axiosClient.get(`/carts/${cartId}`);
        return response;
    } catch (error) {
        throw error;
    }
};

