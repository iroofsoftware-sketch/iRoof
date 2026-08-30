import { adminEndponits } from "../../../endpoints/adminEndpoints";
import Api from "../../axiosConfig";

export const login =async(value)=>{
    try{
        const response = await Api.post(adminEndponits.login,value)
        return response;
    }catch(err){
        console.log(err)
        throw err;
    }
}
export const forgotpassword =async(email)=>{
    try{
        console.log(email);
        
        const response = await Api.post(adminEndponits.forgotpassword,{email})
        return response;
    }catch(err){
        console.log(err)
        throw err;
    }
}


export const verifyotp =async(value)=>{
    try{
      
        
        const response = await Api.post(adminEndponits.verifyotp,value)
        return response;
    }catch(err){
        console.log(err)
        throw err;
    }
}

export const resetpassword = async (value) => {
    try {
        const response = await Api.post(adminEndponits.resetpassword, value);
        return response;
    } catch (err) {
        console.log(err);
        throw err;
    }
};

export const logout =async()=>{
    try{
        const response = await Api.post(adminEndponits.logout)
        return response;
    }catch(err){
        console.log(err)
        throw err;
    }
}