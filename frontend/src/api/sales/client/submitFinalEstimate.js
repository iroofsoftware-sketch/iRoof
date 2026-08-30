import { adminEndponits } from "../../../endpoints/adminEndpoints"
import Api from "../../axiosConfig"

export const submitFinalEstimate = async (finalEstimate) => {
    try {
      const response = await Api.post(adminEndponits.finalEstimate,finalEstimate)
      return response;
    } catch (err) {
      console.log(err);
      throw err;
    }
  };