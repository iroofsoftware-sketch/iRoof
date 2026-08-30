import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";
 
export const product = async (values) => {
    try {
        const category = "Product";
        const response = await Api.post(`${adminEndponits.product}/${category}`, values);
        return response;
    } catch (err) {
        console.error("Error updating labour gst:", err);
        throw err;
    }
};
 
 
export const addGst = async (values) => {
    try {
       
        const response = await Api.post("/admin/gst", values);
        return response;
    } catch (err) {
        console.error("Error updating labour gst:", err);
        throw err;
    }
};
 