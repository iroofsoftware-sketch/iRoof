import axios from "axios";
import Api from "../../axiosConfig";


export const getAllProjectType = async ()=>{
    try {
      const response = await Api.get("/admin/getAllProjectType")
      return response.data
    }catch (error){
     throw error.response?.data?.message 
    }
    
  }


  export const getAllCategories = async ()=>{
    try {
      const response = await Api.get("/admin/getAllCategories")
      return response.data
    }catch (error){
     throw error.response?.data?.message 
    }
    
  }
