import axios from "axios";
import { API_URL } from "../api/ApiUrl";
import authService from "./authService";

class ServiceTache {
    

    obtenirToken() {
        const utilisateur = localStorage.getItem("user");
        if (utilisateur) {
            const donneeUtilisateur = JSON.parse(utilisateur);
            return donneeUtilisateur.token?.accessToken || null;
        }
        return null;
    }


    async obtenirHeaders() {
        const token = await authService.getValidToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }


    async creerTache(donneesToche) {
        try {
            const reponse = await axios.post(
                `${API_URL}/todo`,
                donneesToche,
                { headers: await this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirToutesLesTaches(filtres = {}, pagination = {}) {
        try {
            let url = `${API_URL}/todo`;
            const params = new URLSearchParams();

            if (filtres.completed !== undefined) {
                params.append('completed', filtres.completed);
            }
            if (filtres.userId !== undefined) {
                params.append('userId', filtres.userId);
            }

            if (pagination.page !== undefined) {
                params.append('page', pagination.page);
            }
            if (pagination.limit !== undefined) {
                params.append('limit', pagination.limit);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const reponse = await axios.get(url, { headers: await this.obtenirHeaders() });
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirTacheParId(id) {
        try {
            const reponse = await axios.get(
                `${API_URL}/todo/${id}`,
                { headers: await this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async modifierTache(id, donneesToche) {
        try {
            const reponse = await axios.put(
                `${API_URL}/todo/${id}`,
                donneesToche,
                { headers: await this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async supprimerTache(id) {
        try {
            const reponse = await axios.delete(
                `${API_URL}/todo/${id}`,
                { headers: await this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async uploaderPhoto(fichierPhoto, dossier = 'todos') {
        try {
            const formData = new FormData();
            formData.append('file', fichierPhoto);
            formData.append('folder', dossier);

            const headers = await this.obtenirHeaders();
            headers['Content-Type'] = 'multipart/form-data';

            const reponse = await axios.post(
                `${API_URL}/upload-file`,
                formData,
                { headers }
            );
            return {
                success: true,
                data: {
                    url: reponse.data.url
                }
            };
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }

    async uploaderAudio(fichierAudio, dossier = 'todos') {
        try {
            const formData = new FormData();
            formData.append('file', fichierAudio);
            formData.append('folder', dossier);

            const headers = await this.obtenirHeaders();
            headers['Content-Type'] = 'multipart/form-data';

            const reponse = await axios.post(
                `${API_URL}/upload-file`,
                formData,
                { headers }
            );
            return {
                success: true,
                data: {
                    url: reponse.data.url
                }
            };
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }

}

const serviceTache = new ServiceTache();
export default serviceTache;
