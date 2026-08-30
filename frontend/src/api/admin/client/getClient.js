import { adminEndponits } from "../../../endpoints/adminEndpoints"
import Api from "../../axiosConfig"

export const getClient = async()=>{
    try{
        const response = await Api.get(adminEndponits.getClient)
        return response
    }catch(err){
        console.log(err)
        throw err;
    }
}