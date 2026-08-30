import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";
 
export const getAllCategories = async () => {
    try {
        const response = await Api.get(adminEndponits.getAllCategories);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const getAllProjectTypes = async () => {
    try {
        const response = await Api.get(adminEndponits.getAllProjectTypes);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};




export const fetchAllProjectType = async () => {
    try {
     const response = await Api.get("/admin/getAllProjectType")
       console.log(response);
       
      return response.data; // Return response data
    } catch (error) {
      throw error.response?.data?.message || "An error occurred while adding thickness.";
    }
  };
   
  export const  addProduct = async (payload) => {
   
      try {
        console.log('payloadsss',payload);
       
       const response = await Api.post("/admin/addProduct",payload)
         console.log('Api',response);
         
        return response.data; // Return response data
      } catch (error) {
        throw error
      }
    };
   

   
    export const getAllMaterialItem = async () => {
      try {
        const response = await Api.get("/rates/getAllItems");
        return response.data; // Ensure correct response structure
      } catch (error) {
        throw error.response?.data?.message || "Error fetching categories.";
      }
    };
   