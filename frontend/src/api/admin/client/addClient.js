import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";

export const addNewclient = async(value)=>{
    try{
        const response = await Api.post(adminEndponits.addNewclient,value)
        return response;
    }catch(err){
        console.log(err)
        throw err;
    }
}
