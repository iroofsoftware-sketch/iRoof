
import axios from "axios";
import Api from "../../axiosConfig";

export const addThickness = async (payload) => {
  try {
   const response = await Api.post("/rates/addThickness",payload)
     console.log(response);
     
    return response.data; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};
 
export const getAllThicknessPricing = async () => {
  try {
    const response = await Api.get("/rates/thickness-pricing");
    console.log(response);
    return response.data; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while fetching thickness pricing.";
  }
};
