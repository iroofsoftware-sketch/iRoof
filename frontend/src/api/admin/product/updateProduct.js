import Api from "../../axiosConfig";

export const updateProduct = async (id, payload) => {
    try {
      const response = await Api.put(`/admin/updateProduct/${id}`, payload);
      console.log(response);
      return response.data; // Return response data
    } catch (error) {
      throw error.response?.data?.message || "An error occurred while updating the product.";
    }
  };
   
   
   
   
   
  export const getFilteredProducts = async (filters) => {
      try {
       
        const queryParams = new URLSearchParams();
     
        if (filters.roofType) queryParams.append("roofType", filters.roofType);
        if (filters.roofModel) queryParams.append("roofModel", filters.roofModel);
        if (filters.roofPreference) queryParams.append("roofPreference", filters.roofPreference);
   
        // API call
        const response = await Api.get(`/admin/getFilteredProducts?${queryParams.toString()}`);
   
        console.log("Filtered Products API Response:", response.data);
        return response.data; // Return response data
      } catch (error) {
        console.error("Error fetching filtered products:", error);
        throw error.response?.data?.message || "An error occurred while fetching filtered products.";
      }
    };