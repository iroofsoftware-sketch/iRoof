import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";

export const getCustomers = async()=>{
    try{
        const response = await Api.get(adminEndponits.getCustomers);
        return response;
    }catch(err){
        console.log(err);
    }
}