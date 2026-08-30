import Api from "../axiosConfig";

export const showprofile = async (userId) => {
  try {
   const response = await Api.get(`/rates/getuser/${userId}`)
     console.log(response);
     
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};


export const editprofile = async (payload,userId) => {
  try {
   const response = await Api.post(`/rates/edit/${userId}`,payload)
     console.log(response);
     
    return response.data; 
  } catch (error) {
    throw error.response?.data?.message || "An error occurred while adding thickness.";
  }
};
