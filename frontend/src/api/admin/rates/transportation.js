
import axios from "axios";
import Api from "../../axiosConfig";

export const addTransportation = async (payload) => {
  try {
   const response = await Api.post("/rates/editTransportation",payload)
     console.log(response);
     
    return response.data; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};

export const getAllTransportation = async (payload)=>{
  try {
    const response = await Api.get("/rates/getAllTransportation",payload)
    return response.data
  }catch (error){
   throw error.response?.data?.message 
  }
  
}



