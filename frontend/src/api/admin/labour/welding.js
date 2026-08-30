import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";

export const welding = async (values) => {
    try {
        const category = "Welding";
        const response = await Api.post(`${adminEndponits.sheeting}/${category}`, values); 
        return response;
    } catch (err) {
        console.error("Error updating labour cost:", err);
        throw err;
    }
};
