import Api from "../../axiosConfig";


export const getSitevisitor = async ()=>{
    try {
      const response = await Api.get("/siteVisitor/getSiteVisitors")
      return response.data
    }catch (error){
     throw error.response?.data?.message 
    }
    
  }