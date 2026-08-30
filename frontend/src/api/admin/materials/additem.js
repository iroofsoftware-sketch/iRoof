import axios from "axios";
import Api from "../../axiosConfig";

export const getAllMaterials = async () => {
  try {
   const response = await Api.get("/rates/getAllMaterials")
     console.log(response);
     
    return response.data; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};

// /------------------item adding--------------------

// export const itemAdding = async (payload) => {
//     try {
//      const response = await Api.post("/rates/materialItemAdding",payload)
//        console.log(response);
       
//       return response.data; // Return response data
//     } catch (error) {
//       throw error.response?.data?.message || "An error occurred while adding thickness.";
//     }
//   };
  
export const itemAdding = async (payload) => {
  try {
    const response = await Api.post("/rates/materialItemAdding", payload);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data?.message || "An error occurred while adding the item.";
  }
};


 
export const getAllitems = async () => {
  try {
    const response = await Api.get("/rates/getAllItems");
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data?.message || "An error occurred while adding the item.";
  }
};



export const updateItem = async (id,payload) => {
  try {
   const response = await Api.post(`/rates/editMaterialItem/${id}`,payload)
     console.log(response);
     
    return response; // Return response data
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};