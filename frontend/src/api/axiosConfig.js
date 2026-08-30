import axios from "axios";

// const BASE_URL ="https://iroofing-backend.onrender.com/iRoof"

const BASE_URL =import.meta.env.VITE_BASE_URL
// const BASE_URL ='http://localhost:5000/iRoof'

console.log(`Base_URL:${BASE_URL}`);

const Api = axios.create({
    baseURL:BASE_URL,
    withCredentials:true,
})

export default Api;
