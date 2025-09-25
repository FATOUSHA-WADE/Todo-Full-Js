import { useState, useEffect } from "react";
import serviceHistorique from "../services/serviceHistorique";
import { 
    FiActivity,
    FiPlus, 
    FiEdit, 
    FiTrash2, 
    FiCheck, 
    FiClock,
    FiLogIn,
    FiShield,
    FiImage,
    FiRefreshCw,
    FiUser
} from "react-icons/fi";

const iconesActions = {
    'FiPlus': FiPlus,
    'FiEdit': FiEdit,
    'FiTrash2': FiTrash2,
    'FiCheck': FiCheck,
    'FiClock': FiClock,
    'FiLogIn': FiLogIn,
    'FiShield': FiShield,
    'FiImage': FiImage,
    'FiActivity': FiActivity
};

function ActivitesRecentes({ limit = 5 }) {
    const [logs, setLogs] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState("");

    const chargerActivitesRecentes = async () => {
        try {
            setChargement(true);
            setErreur("");
            
            const resultat = await serviceHistorique.obtenirLogsRecents(limit);
            
            if (resultat.success) {
                setLogs(resultat.data || []);
            } else {
                setErreur(resultat.error || "Erreur lors du chargement des activités");
            }
        } catch (err) {
            setErreur(err.message || "Erreur lors du chargement des activités");
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        chargerActivitesRecentes();
    }, [limit]);

    const formaterDate = (dateString) => {
        const date = new Date(dateString);
        const maintenant = new Date();
        const diffMs = maintenant - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenirIconeAction = (action) => {
        const nomIcone = serviceHistorique.obtenirIconeAction(action);
        const IconeComponent = iconesActions[nomIcone] || FiActivity;
        return IconeComponent;
    };

    if (erreur) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Activités récentes</h3>
                    <button
                        onClick={chargerActivitesRecentes}
                        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        title="Actualiser"
                    >
                        <FiRefreshCw size={16} className="text-gray-600" />
                    </button>
                </div>
                <div className="text-red-600 text-sm">{erreur}</div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Activités récentes</h3>
                <button
                    onClick={chargerActivitesRecentes}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    title="Actualiser"
                    disabled={chargement}
                >
                    <FiRefreshCw size={16} className={`text-gray-600 ${chargement ? 'animate-spin' : ''}`} />
                </button>
            </div>
            
            {chargement ? (
                <div className="text-center py-4">
                    <div className="text-gray-500 text-sm">Chargement...</div>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-4">
                    <div className="text-gray-500 text-sm">Aucune activité récente</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => {
                        const IconeAction = obtenirIconeAction(log.action);
                        const couleurAction = serviceHistorique.obtenirCouleurAction(log.action);
                        
                        return (
                            <div 
                                key={log.id} 
                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className={`p-2 rounded-full ${couleurAction}`}>
                                    <IconeAction size={16} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {serviceHistorique.formaterAction(log.action)}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <FiUser size={12} />
                                                    {log.user?.name || 'Utilisateur'}
                                                </span>
                                                <span>•</span>
                                                <span>
                                                    {serviceHistorique.formaterEntite(log.entity)}
                                                    {log.entityId && ` #${log.entityId}`}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                                            {formaterDate(log.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {logs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-cyan-600 hover:text-cyan-800 font-medium">
                        Voir toutes les activités
                    </button>
                </div>
            )}

        </div>
        
    );
}

export default ActivitesRecentes;
