import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";
 
export const addCategory = async (values) => {
    try {
        const response = await Api.post(adminEndponits.addCategory, values);
        return response.data;
    } catch (error) {

        console.error("Error adding category:", error);
        throw error;
    }
};
 
 
 
 