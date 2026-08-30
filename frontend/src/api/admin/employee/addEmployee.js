import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig"

export const addEmployee = async (values) => {
    try{
        const response = Api.post(adminEndponits.addEmployee, values);
        return response;
    }catch(err){
        console.log(err);
    }
}