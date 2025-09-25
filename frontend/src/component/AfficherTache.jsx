import { useState, useEffect } from "react";
import servicePermissionTache from "../services/servicePermissionTache";
import Historique from "./Historique";
import { FiUser } from "react-icons/fi";

function AfficherTache({ tache, onModifier, onSupprimer, onFermer }) {
    const [permissions, setPermissions] = useState([]);
    const [chargementPermissions, setChargementPermissions] = useState(false);
    const [afficherPermissions, setAfficherPermissions] = useState(false);
    const [afficherHistorique, setAfficherHistorique] = useState(false);
    const [utilisateurConnecte, setUtilisateurConnecte] = useState(null);

    useEffect(() => {
        const utilisateur = localStorage.getItem("user");
        if (utilisateur) {
            const donneeUtilisateur = JSON.parse(utilisateur);
            setUtilisateurConnecte(donneeUtilisateur.token?.user || null);
        }
    }, []);

    const chargerPermissions = async () => {
        if (!tache || afficherPermissions) return;

        setChargementPermissions(true);
        try {
            const resultat = await servicePermissionTache.obtenirPermissions(tache.id);
            if (resultat.success) {
                setPermissions(resultat.data || []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des permissions:", error);
        } finally {
            setChargementPermissions(false);
        }
    };

    const basculerPermissions = () => {
        if (!afficherPermissions) {
            chargerPermissions();
        }
        setAfficherPermissions(!afficherPermissions);
    };

    const formaterDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!tache) {
        return <div className="text-center">Tâche non trouvée</div>;
    }

    const estTacheUtilisateur = utilisateurConnecte && tache.userId === utilisateurConnecte.id;
    const permissionUtilisateur = tache.permissions?.find(
        perm => perm.userId === utilisateurConnecte?.id
    );
    
    const peutModifier = estTacheUtilisateur || (permissionUtilisateur && permissionUtilisateur.canEdit);
    const peutSupprimer = estTacheUtilisateur || (permissionUtilisateur && permissionUtilisateur.canDelete);

    return (
        <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-yellow-200 max-w-4xl mx-auto">

            <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{tache.title}</h2>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        tache.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {tache.completed ? '✓ Terminée' : '○ En cours'}
                    </div>
                </div>
                
                                <div className="flex gap-2 ml-4">
                    {onModifier && peutModifier && (
                        <button
                            onClick={() => onModifier(tache)}
                            className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        >
                            Modifier
                        </button>
                    )}
                    {onModifier && !peutModifier && (
                        <button
                            disabled
                            className="px-3 py-1 bg-gray-400 text-gray-200 text-sm rounded-md cursor-not-allowed"
                            title="Vous n'avez pas la permission de modifier cette tâche"
                        >
                            Modifier
                        </button>
                    )}
                    {onSupprimer && peutSupprimer && (
                        <button
                            onClick={() => onSupprimer(tache.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Supprimer
                        </button>
                    )}
                    {onSupprimer && !peutSupprimer && (
                        <button
                            disabled
                            className="px-3 py-1 bg-gray-400 text-gray-200 text-sm rounded-md cursor-not-allowed"
                            title="Vous n'avez pas la permission de supprimer cette tâche"
                        >
                            Supprimer
                        </button>
                    )}
                    {onFermer && (
                        <button
                            onClick={onFermer}
                            className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Fermer
                        </button>
                    )}
                </div>
            </div>


            <div className="flex gap-3 mb-6">
                <button
                    onClick={basculerPermissions}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        afficherPermissions
                            ? "bg-indigo-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    disabled={chargementPermissions}
                >
                    {chargementPermissions 
                        ? "Chargement..." 
                        : (afficherPermissions ? "Masquer permissions" : "Voir permissions")
                    }
                </button>
                
                <button
                    onClick={() => setAfficherHistorique(!afficherHistorique)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        afficherHistorique
                            ? "bg-cyan-500 text-white shadow-md"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                    {afficherHistorique ? "Masquer historique" : "Voir historique"}
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    {tache.description && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Description</h3>
                            <p className="text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md">
                                {tache.description}
                            </p>
                        </div>
                    )}


                    {tache.photoUrl && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Photo</h3>
                            <img
                                src={tache.photoUrl}
                                alt="Photo de la tâche"
                                className="w-full max-w-md h-auto rounded-md border shadow-sm cursor-pointer"
                                onClick={() => window.open(tache.photoUrl, '_blank')}
                            />
                        </div>
                    )}


                    {tache.audioUrl && (
                        <div className="mb-6 flex flex-col items-center">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Message vocal</h3>
                            <audio controls src={tache.audioUrl} className="w-full max-w-xs rounded-lg shadow" />
                        </div>
                    )}
                </div>

                <div>
                    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">Informations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Créée le:</span>{' '}
                                {formaterDate(tache.createdAt)}
                            </div>
                            <div>
                                <span className="font-medium">Modifiée le:</span>{' '}
                                {formaterDate(tache.updatedAt)}
                            </div>
                            <div>
                                <span className="font-medium">Créateur:</span> 
                                <span className="inline-flex items-center gap-2 ml-2 bg-blue-50 px-3 py-1 rounded-full">
                                    <FiUser size={16} className="text-blue-600" />
                                    <span className="font-medium text-blue-800">
                                        {tache.user?.name || 'Utilisateur inconnu'}
                                    </span>
                                </span>
                            </div>
                            <div>
                                <span className="font-medium">ID tâche:</span> {tache.id}
                            </div>
                        </div>
                    </div>


                    {afficherPermissions && (
                        <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                            <h3 className="text-lg font-semibold text-indigo-800 mb-3">Permissions partagées</h3>
                            <div>
                                {permissions.length > 0 ? (
                                    <div className="space-y-2">
                                        {permissions.map((permission) => (
                                            <div
                                                key={`${permission.todoId}-${permission.userId}`}
                                                className="bg-white p-3 rounded border border-indigo-200"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-gray-700">
                                                            {permission.user?.name || "Utilisateur inconnu"}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-2">
                                                            ({permission.user?.email || `ID: ${permission.userId}`})
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {permission.canEdit && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                                                Peut modifier
                                                            </span>
                                                        )}
                                                        {permission.canDelete && (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                                                                Peut supprimer
                                                            </span>
                                                        )}
                                                        {!permission.canEdit && !permission.canDelete && (
                                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                                                Lecture seule
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Accordée le: {formaterDate(permission.createdAt)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-indigo-600">Aucune permission partagée pour cette tâche.</p>
                                )}
                            </div>
                        </div>
                    )}


                    {afficherHistorique && (
                        <div className="mb-6">
                            <Historique tacheId={tache.id} />
                        </div>
                    )}
                </div>
            </div>


            <div className="border-t pt-4">
                <p className="text-sm text-gray-500 text-center">
                      {/* Cette tâche peut être partagée avec d'autres utilisateurs via les permissions. */}
                </p>
            </div>
        </div>
    );
}

export default AfficherTache;
