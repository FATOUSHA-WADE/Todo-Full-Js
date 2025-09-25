import axios from "axios";
import { API_URL } from "../api/ApiUrl";

class ServiceHistorique {
    
    obtenirToken() {
        const utilisateur = localStorage.getItem("user");
        if (utilisateur) {
            const donneeUtilisateur = JSON.parse(utilisateur);
            return donneeUtilisateur.token?.accessToken || null;
        }
        return null;
    }

    obtenirHeaders() {
        const token = this.obtenirToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };
    }

    async obtenirTousLesLogs(filtres = {}, pagination = {}) {
        try {
            const params = new URLSearchParams();
            

            if (filtres.userId !== undefined) {
                params.append('userId', filtres.userId.toString());
            }
            if (filtres.action) {
                params.append('action', filtres.action);
            }
            if (filtres.entity) {
                params.append('entity', filtres.entity);
            }
            if (filtres.entityId !== undefined) {
                params.append('entityId', filtres.entityId.toString());
            }
            if (filtres.dateFrom) {
                params.append('dateFrom', filtres.dateFrom);
            }
            if (filtres.dateTo) {
                params.append('dateTo', filtres.dateTo);
            }
            
            if (pagination.page !== undefined) {
                params.append('page', pagination.page.toString());
            }
            if (pagination.limit !== undefined) {
                params.append('limit', pagination.limit.toString());
            }

            const reponse = await axios.get(
                `${API_URL}/activity-logs?${params.toString()}`,
                { headers: this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirMesLogs(limit = 50) {
        try {
            const params = new URLSearchParams();
            if (limit) {
                params.append('limit', limit.toString());
            }

            const reponse = await axios.get(
                `${API_URL}/activity-logs/my?${params.toString()}`,
                { headers: this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirLogParId(id) {
        try {
            const reponse = await axios.get(
                `${API_URL}/activity-logs/${id}`,
                { headers: this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirLogsUtilisateur(userId, limit = 50) {
        try {
            const params = new URLSearchParams();
            if (limit) {
                params.append('limit', limit.toString());
            }

            const reponse = await axios.get(
                `${API_URL}/activity-logs/user/${userId}?${params.toString()}`,
                { headers: this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }

 
    async nettoyerAnciensLogs(days = 90) {
        try {
            const reponse = await axios.delete(
                `${API_URL}/activity-logs/clean?days=${days}`,
                { headers: this.obtenirHeaders() }
            );
            return reponse.data;
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    async obtenirLogsParTache(tacheId, limit = 50) {
        try {
            const filtres = {
                entity: 'TODO',
                entityId: tacheId
            };
            const pagination = { limit };
            return await this.obtenirTousLesLogs(filtres, pagination);
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }

    async obtenirLogsRecents(limit = 20) {
        try {
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - 1);
            const filtres = {
                dateFrom: dateFrom.toISOString()
            };
            const pagination = { limit };
            return await this.obtenirTousLesLogs(filtres, pagination);
        } catch (error) {
            throw error.response ? error.response.data : new Error("Erreur réseau");
        }
    }


    formaterAction(action) {
        const actions = {
            'TODO_CREATE': 'Création d\'une tâche',
            'TODO_UPDATE': 'Modification d\'une tâche',
            'TODO_DELETE': 'Suppression d\'une tâche',
            'TODO_COMPLETE': 'Tâche marquée comme terminée',
            'TODO_INCOMPLETE': 'Tâche marquée comme en cours',
            'USER_LOGIN': 'Connexion utilisateur',
            'USER_LOGOUT': 'Déconnexion utilisateur',
            'USER_CREATE': 'Création d\'un utilisateur',
            'USER_UPDATE': 'Modification d\'un utilisateur',
            'USER_DELETE': 'Suppression d\'un utilisateur',
            'PERMISSION_GRANT': 'Attribution de permission',
            'PERMISSION_REVOKE': 'Révocation de permission',
            'PHOTO_UPLOAD': 'Upload d\'une photo',
            'PHOTO_DELETE': 'Suppression d\'une photo'
        };
        
        return actions[action] || action;
    }


    formaterEntite(entity) {
        const entites = {
            'TODO': 'Tâche',
            'USER': 'Utilisateur',
            'PERMISSION': 'Permission',
            'PHOTO': 'Photo'
        };
        
        return entites[entity] || entity;
    }


    obtenirCouleurAction(action) {
        if (action.includes('CREATE')) return 'text-green-600 bg-green-100';
        if (action.includes('UPDATE') || action.includes('COMPLETE') || action.includes('INCOMPLETE')) return 'text-blue-600 bg-blue-100';
        if (action.includes('DELETE')) return 'text-red-600 bg-red-100';
        if (action.includes('LOGIN')) return 'text-purple-600 bg-purple-100';
        if (action.includes('PERMISSION')) return 'text-orange-600 bg-orange-100';
        return 'text-gray-600 bg-gray-100';
    }

    obtenirIconeAction(action) {
        if (action.includes('CREATE')) return 'FiPlus';
        if (action.includes('UPDATE')) return 'FiEdit';
        if (action.includes('DELETE')) return 'FiTrash2';
        if (action.includes('COMPLETE')) return 'FiCheck';
        if (action.includes('INCOMPLETE')) return 'FiClock';
        if (action.includes('LOGIN')) return 'FiLogIn';
        if (action.includes('LOGOUT')) return 'FiLogOut';
        if (action.includes('PERMISSION')) return 'FiShield';
        if (action.includes('PHOTO')) return 'FiImage';
        return 'FiActivity';
    }
}

const serviceHistorique = new ServiceHistorique();
export default serviceHistorique;
