import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";

export const getEmployee = async()=>{
    try{
        const response = await Api.get(adminEndponits.getEmployee);
        return response;
    }catch(err){
        console.log(err);
    }
}

export const getUserById = async (userId) => {
    try {
        const response = await Api.get(`/admin/profile/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error?.response?.data || error.message);
        throw error;
    }
};

export const editUserById = async (userId, userData) => {
    try {
        const response = await Api.put(`/admin/profile/${userId}`, userData);
        return response.data;
    } catch (error) {
        console.error("Error updating user profile:", error?.response?.data || error.message);
        throw error;
    }
};

export const deleteEstimate = async (ids) => {
    try {
        const response = await Api.post('/estimate/delete',ids);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error?.response?.data || error.message);
        throw error;
    }
};
export const deleteEmploye = async (ids) => {
    try {
        const response = await Api.post('/admin/deteletEmploye',ids);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error?.response?.data || error.message);
        throw error;
    }
};
export const deleteClient = async (ids) => {
    try {
        const response = await Api.post('/admin/deteletClient',ids);
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error?.response?.data || error.message);
        throw error;
    }
};