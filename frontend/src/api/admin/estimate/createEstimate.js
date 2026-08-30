import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";
import axios from "axios";

export const finalEstimate = async (values) => {
  try {
    console.log("req values",values);
    
    const response = await Api.post(adminEndponits.finalEstimate, values)
    return response;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      return error.response;
    } else {
      console.error('Unexpected error:', error);
      throw error;
    }
  }
}
