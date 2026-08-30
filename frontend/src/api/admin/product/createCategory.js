import axios from "axios";
import Api from "../../axiosConfig";
 
export const createCategory = async (payload) => {
  try {
   const response = await Api.post("/admin/createCategory",payload)
     console.log(response);
     
    return response.data; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding categories.";
  }
};
 