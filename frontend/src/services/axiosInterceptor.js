import axios from "axios";
import authService from "./authService";

axios.interceptors.request.use(
    async (config) => {
        if (config.url?.includes('/users/login') || config.url?.includes('/users/refresh-token')) {
            return config;
        }


        const token = await authService.getValidToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axios.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;


        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {

                const newToken = await authService.refreshToken();
                
                if (newToken) {

                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {

                localStorage.removeItem("user");
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
