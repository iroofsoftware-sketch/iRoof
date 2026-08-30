import axios from "axios";
import Api from "../../axiosConfig";

export const addMaterial = async (payload) => {
  try {
   const response = await Api.post("/rates/addMaterial",payload)
     console.log(response);
     
    return response; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};


// -------------------------------------------------------



export const updateMaterial = async (id,payload) => {
  try {
   const response = await Api.post(`/rates/updateMaterial/${id}`,payload)
     console.log(response);
     
    return response; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};