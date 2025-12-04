import axiosClient from "../axiosClient";

export const getProfileStaff = async () => {
    try {
        const response = await axiosClient.get("/employees/profile");
        return response;
    } catch (error) {
        throw error;
    }
}

export const getOrderByDeliveryStaff = async (deliveryStaffId) => {
    try {
        const response = await axiosClient.get(`/delivery/assignments/staff/${deliveryStaffId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const getDeliveryStats = async (deliveryStaffId) => {
    try {
        const response = await axiosClient.get(`/delivery/assignments/${deliveryStaffId}`);
        return response.data;
    } catch (error) {
        console.error("getDeliveryStats error:", error.response?.data || error.message);
        throw error;
    }
};

export const updateDeliveryStatus = async (assignmentId, status) => {
    try {
        const response = await axiosClient.put(`/delivery/assignments/${assignmentId}/status`, null, {
            params: { status }
        });
        return response;
    } catch (error) {
        console.error("updateDeliveryStatus error:", error.response?.data || error.message);
        throw error;
    }
}

export const updateStatusDeliveryAssignment = async (assignmentId, status) => {
    try {
        const response = await axiosClient.put(`/delivery/assignments/${assignmentId}/status`, null, {
            params: { status }
        });
        return response;
    } catch (error) {
        console.error("updateStatusDeliveryAssignment error:", error.response?.data || error.message);
        throw error;
    }
}

export const getDeliveryAssignmentByOrderId = async (orderId) => {
    try {
        const response = await axiosClient.get(`/delivery/assignments/order/${orderId}`);
        return response;
    } catch (error) {
        console.error("getDeliveryAssignmentByOrderId error:", error.response?.data || error.message);
        throw error;
    }
}

export const confirmDeliveryAssignment = async (request) => {
    try {
        const response = await axiosClient.post(`/delivery-confirmations`, request);
        return response;
    } catch (error) {
        console.error("confirmDeliveryAssignment error:", error.response?.data || error.message);
        throw error;
    }
}

export const confirmDeliveryAssignmentQRScan = async (request) => {
    try {
        const response = await axiosClient.post(`/delivery-confirmations/scan-qr`, request);
        return response;
    } catch (error) {
        console.error("confirmDeliveryAssignmentQRScan error:", error.response?.data || error.message);
        throw error;
    }
}
