import axiosClient from "../axiosClient";

export const login = async (email, password) => {
    try {
        const response = await axiosClient.post("/auth/login", { email, password });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await axiosClient.post("/auth/register", userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = async (token) => {
  try {
    const response = await axiosClient.post(
      "/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getProfile = async () => {
    try {
        const response = await axiosClient.get("/users/profile");
        return response;
    } catch (error) {
        throw error;
    }
}

export const createWallete = async () => {
    try {
        const response = await axiosClient.post("/wallets");
        return response.data;
    } catch (error) {
        throw error;
    }
}


