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
    FiLogOut,
    FiShield,
    FiImage,
    FiFilter,
    FiRefreshCw,
    FiChevronLeft,
    FiChevronRight,
    FiCalendar,
    FiUser,
    FiEye
} from "react-icons/fi";


const iconesActions = {
    'FiPlus': FiPlus,
    'FiEdit': FiEdit,
    'FiTrash2': FiTrash2,
    'FiCheck': FiCheck,
    'FiClock': FiClock,
    'FiLogIn': FiLogIn,
    'FiLogOut': FiLogOut,
    'FiShield': FiShield,
    'FiImage': FiImage,
    'FiActivity': FiActivity
};

function Historique({ tacheId = null, utilisateurId = null }) {
    const [logs, setLogs] = useState([]);
    const [chargement, setChargement] = useState(false);
    const [erreur, setErreur] = useState("");
    const [filtres, setFiltres] = useState({
        action: "",
        entity: "",
        dateFrom: "",
        dateTo: ""
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        chargerLogs();
    }, [pagination.currentPage, pagination.itemsPerPage, filtres, tacheId, utilisateurId]);

    const chargerLogs = async () => {
        try {
            setChargement(true);
            setErreur("");
            
            let resultat;
            const paginationOptions = {
                page: pagination.currentPage,
                limit: pagination.itemsPerPage
            };

            const filtresActifs = {};
            if (filtres.action) filtresActifs.action = filtres.action;
            if (filtres.entity) filtresActifs.entity = filtres.entity;
            if (filtres.dateFrom) filtresActifs.dateFrom = new Date(filtres.dateFrom).toISOString();
            if (filtres.dateTo) filtresActifs.dateTo = new Date(filtres.dateTo).toISOString();
            if (utilisateurId) filtresActifs.userId = utilisateurId;
            if (tacheId) {
                filtresActifs.entity = 'TODO';
                filtresActifs.entityId = tacheId;
            }

            if (tacheId) {
                resultat = await serviceHistorique.obtenirLogsParTache(tacheId);
            } else if (utilisateurId) {
                resultat = await serviceHistorique.obtenirLogsUtilisateur(utilisateurId);
            } else {
                resultat = await serviceHistorique.obtenirTousLesLogs(filtresActifs, paginationOptions);
            }
            
            if (resultat.success) {
                setLogs(resultat.data || []);
                if (resultat.pagination) {
                    setPagination(resultat.pagination);
                }
            } else {
                setErreur(resultat.error || "Erreur lors du chargement des logs");
            }
        } catch (err) {
            setErreur(err.message || "Erreur lors du chargement des logs");
        } finally {
            setChargement(false);
        }
    };

    const changerFiltre = (nouveauFiltres) => {
        setFiltres(prev => ({ ...prev, ...nouveauFiltres }));
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const reinitialiserFiltres = () => {
        setFiltres({
            action: "",
            entity: "",
            dateFrom: "",
            dateTo: ""
        });
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const allerALaPage = (numeroPage) => {
        if (numeroPage >= 1 && numeroPage <= pagination.totalPages) {
            setPagination(prev => ({
                ...prev,
                currentPage: numeroPage
            }));
        }
    };

    const pageSuivante = () => {
        if (pagination.hasNextPage) {
            allerALaPage(pagination.currentPage + 1);
        }
    };

    const pagePrecedente = () => {
        if (pagination.hasPrevPage) {
            allerALaPage(pagination.currentPage - 1);
        }
    };

    const changerLimiteParPage = (nouvelleLimite) => {
        setPagination(prev => ({
            ...prev,
            itemsPerPage: nouvelleLimite,
            currentPage: 1
        }));
    };

    const formaterDate = (dateString) => {
        const date = new Date(dateString);
        const maintenant = new Date();
        const diffMs = maintenant - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return "À l'instant";
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const obtenirIconeAction = (action) => {
        const nomIcone = serviceHistorique.obtenirIconeAction(action);
        const IconeComponent = iconesActions[nomIcone] || FiActivity;
        return IconeComponent;
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">
                    {tacheId ? "Historique de la tâche" : "Historique des activités"}
                </h2>
                
                <button
                    onClick={chargerLogs}
                    className="flex items-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-full hover:bg-yellow-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    <FiRefreshCw size={20} />
                    Actualiser
                </button>
            </div>


            {!tacheId && (
                <div className="mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <FiFilter className="text-gray-500" size={20} />
                            <span className="text-gray-700 font-medium">Filtres :</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <select
                                    value={filtres.action}
                                    onChange={(e) => changerFiltre({ action: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300  text-black rounded-lg focus:outline-none focus:ring-2 focus:text-black ring-cyan-500"
                                >
                                    <option value="">Toutes les actions</option>
                                    <option value="TODO_CREATE">Création de tâche</option>
                                    <option value="TODO_UPDATE">Modification de tâche</option>
                                    <option value="TODO_DELETE">Suppression de tâche</option>
                                    <option value="TODO_COMPLETE">Tâche terminée</option>
                                    <option value="TODO_INCOMPLETE">Tâche en cours</option>
                                    <option value="USER_LOGIN">Connexion</option>
                                    <option value="PERMISSION_GRANT">Permission accordée</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Entité</label>
                                <select
                                    value={filtres.entity}
                                    onChange={(e) => changerFiltre({ entity: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:text-black ring-cyan-500"
                                >
                                    <option value="">Toutes les entités</option>
                                    <option value="TODO">Tâches</option>
                                    <option value="USER">Utilisateurs</option>
                                    <option value="PERMISSION">Permissions</option>
                                    <option value="PHOTO">Photos</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                                <input
                                    type="date"
                                    value={filtres.dateFrom}
                                    onChange={(e) => changerFiltre({ dateFrom: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none text-black focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                                <input
                                    type="date"
                                    value={filtres.dateTo}
                                    onChange={(e) => changerFiltre({ dateTo: e.target.value })}
                                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus: text-blackring-cyan-500"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={reinitialiserFiltres}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Réinitialiser les filtres
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {erreur && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {erreur}
                </div>
            )}

            {chargement ? (
                <div className="text-center py-8">
                    <div className="text-gray-500">Chargement des logs...</div>
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-lg mb-4">
                        Aucun log d'activité trouvé
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {logs.map((log) => {
                        const IconeAction = obtenirIconeAction(log.action);
                        const couleurAction = serviceHistorique.obtenirCouleurAction(log.action);
                        
                        return (
                            <div 
                                key={log.id} 
                                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-yellow-600"
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-full ${couleurAction}`}>
                                        <IconeAction size={20} />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {serviceHistorique.formaterAction(log.action)}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {formaterDate(log.createdAt)}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                                            <span className="flex items-center gap-1">
                                                <FiUser size={14} />
                                                {log.user?.name || 'Utilisateur inconnu'}
                                            </span>
                                            
                                            <span>
                                                {serviceHistorique.formaterEntite(log.entity)}
                                                {log.entityId && ` #${log.entityId}`}
                                            </span>
                                            
                                            {log.ipAddress && (
                                                <span className="text-gray-500">
                                                    IP: {log.ipAddress}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {log.details && (
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <details>
                                                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                                        Voir les détails
                                                    </summary>
                                                    <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                                                        {typeof log.details === 'string' ? log.details : JSON.stringify(JSON.parse(log.details), null, 2)}
                                                    </pre>
                                                </details>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {!chargement && logs.length > 0 && (
                <div className="mt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-md">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-700 text-sm">Éléments par page :</span>
                            <select
                                value={pagination.itemsPerPage}
                                onChange={(e) => changerLimiteParPage(parseInt(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </div>


                        <div className="text-sm text-gray-600">
                            Affichage {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} à {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} sur {pagination.totalItems} logs
                        </div>


                        <div className="flex items-center gap-2">
                            <button
                                onClick={pagePrecedente}
                                disabled={!pagination.hasPrevPage}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                                    pagination.hasPrevPage
                                        ? "bg-cyan-500 text-white hover:bg-cyan-600 shadow-md hover:shadow-lg"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                title="Page précédente"
                            >
                                <FiChevronLeft size={20} />
                            </button>


                            <div className="flex gap-1">
                                {(() => {
                                    const pages = [];
                                    const totalPages = pagination.totalPages;
                                    const currentPage = pagination.currentPage;
                                    
                                    let startPage = Math.max(1, currentPage - 2);
                                    let endPage = Math.min(totalPages, startPage + 4);
                                    
                                    if (endPage - startPage < 4) {
                                        startPage = Math.max(1, endPage - 4);
                                    }
                                    
                                    for (let i = startPage; i <= endPage; i++) {
                                        pages.push(
                                            <button
                                                key={i}
                                                onClick={() => allerALaPage(i)}
                                                className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
                                                    i === currentPage
                                                        ? "bg-cyan-500 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                            >
                                                {i}
                                            </button>
                                        );
                                    }
                                    
                                    return pages;
                                })()}
                            </div>

                            <button
                                onClick={pageSuivante}
                                disabled={!pagination.hasNextPage}
                                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                                    pagination.hasNextPage
                                        ? "bg-cyan-500 text-white hover:bg-cyan-600 shadow-md hover:shadow-lg"
                                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                }`}
                                title="Page suivante"
                            >
                                <FiChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Historique;
