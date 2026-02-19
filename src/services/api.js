import axios from 'axios' ;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  ; 

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials:true,
}) ;

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if(error.response){
            console.error('API Error:', error.response.status, error.response.data) ;
        }
        else if(error.request){
            console.error('No response received:', error.request) ;
        }else{
            console.error('Error setting up request:', error.message) ;
        }
        return Promise.reject(error) ;
    }
);

export default api ;    