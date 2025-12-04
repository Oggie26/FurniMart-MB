import axiosClient from "../axiosClient";

export const getAddress = async (userId) => {
  try {
    const response = await axiosClient.get(`/addresses/user/${userId}`);
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  } catch (error) {
    throw error;
  }
};

export const addAddress = async (address) => {
  try {
    const response = await axiosClient.post(`/addresses`, address);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await axiosClient.delete(`/addresses/${addressId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const setDefaultAddress = async (addressId, userId) => {
  try {
    const response = await axiosClient.patch(`/addresses/${addressId}/set-default`, null, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAddressDefault = async (userId) => {
  try {
    const response = await axiosClient.get(`/addresses/user/${userId}/default`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


