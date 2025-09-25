import axios from "axios";
import { API_URL } from "../api/ApiUrl";

const authService = {
    login: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/users/login`, userData);
            response && localStorage.setItem("user", JSON.stringify(response.data));
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    inscription: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/users`, userData);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    refreshToken: async () => {
        try {
            const utilisateur = localStorage.getItem("user");
            if (!utilisateur) {
                throw new Error("Aucun utilisateur connecté");
            }

            const donneeUtilisateur = JSON.parse(utilisateur);
            const refreshToken = donneeUtilisateur.token?.refreshToken;

            if (!refreshToken) {
                throw new Error("Aucun refresh token disponible");
            }

            const response = await axios.post(`${API_URL}/users/refresh-token`, {
                refreshToken: refreshToken
            });

            if (response.data.success) {

                donneeUtilisateur.token.accessToken = response.data.accessToken;
                localStorage.setItem("user", JSON.stringify(donneeUtilisateur));
                
                return response.data.accessToken;
            } else {
                throw new Error(response.data.error || "Erreur lors du renouvellement du token");
            }
        } catch (error) {

            localStorage.removeItem("user");
            window.location.href = "/login";
            throw error.response ? error.response.data : new Error("Network Error");
        }
    },

    isTokenExpired: (token) => {
        if (!token) return true;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            

            return payload.exp < (currentTime + 300);
        } catch {
            return true;
        }
    },

    getValidToken: async () => {
        const utilisateur = localStorage.getItem("user");
        if (!utilisateur) {
            return null;
        }

        const donneeUtilisateur = JSON.parse(utilisateur);
        const accessToken = donneeUtilisateur.token?.accessToken;

        if (!accessToken) {
            return null;
        }

        if (!authService.isTokenExpired(accessToken)) {
            return accessToken;
        }

        try {
            return await authService.refreshToken();
        } catch (refreshError) {
            console.error("Erreur lors du renouvellement du token:", refreshError);
            return null;
        }
    }
};

export default authService;