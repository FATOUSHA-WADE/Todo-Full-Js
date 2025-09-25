import { useState } from "react";
import servicePermissionTache from "../services/servicePermissionTache";
import { FiX, FiUser, FiPlus } from "react-icons/fi";

function AssignerPermission({ tache, onPermissionAssignee, onAnnuler }) {
    const [loginsUtilisateurs, setLoginsUtilisateurs] = useState("");
    const [utilisateursAjoutes, setUtilisateursAjoutes] = useState([]);
    const [peutModifier, setPeutModifier] = useState(false);
    const [peutSupprimer, setPeutSupprimer] = useState(false);
    const [chargement, setChargement] = useState(false);
    const [erreurGenerale, setErreurGenerale] = useState("");

    const gererChangementLogin = (e) => {
        const valeur = e.target.value;
        setLoginsUtilisateurs(valeur);

        if (valeur.includes(',')) {
            const parties = valeur.split(',');
            const loginsCompletes = parties.slice(0, -1);
            const dernierLogin = parties[parties.length - 1];
            
            const nouveauxLogins = loginsCompletes
                .map(login => login.trim())
                .filter(login => login.length > 0)
                .filter(login => !utilisateursAjoutes.some(user => user.login === login));

            if (nouveauxLogins.length > 0) {
                const nouveauxUtilisateurs = nouveauxLogins.map(login => ({
                    login,
                    id: Date.now() + Math.random(),
                }));

                setUtilisateursAjoutes(prev => [...prev, ...nouveauxUtilisateurs]);
            }
            
            setLoginsUtilisateurs(dernierLogin.trim());
        }
    };

    const ajouterUtilisateurs = () => {
        if (!loginsUtilisateurs.trim()) return;

        const nouveauxLogins = loginsUtilisateurs
            .split(',')
            .map(login => login.trim())
            .filter(login => login.length > 0)
            .filter(login => !utilisateursAjoutes.some(user => user.login === login));

        const nouveauxUtilisateurs = nouveauxLogins.map(login => ({
            login,
            id: Date.now() + Math.random(),
        }));

        setUtilisateursAjoutes(prev => [...prev, ...nouveauxUtilisateurs]);
        setLoginsUtilisateurs("");
    };

    const supprimerUtilisateur = (id) => {
        setUtilisateursAjoutes(prev => prev.filter(user => user.id !== id));
    };

    const gererToucheEntree = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ajouterUtilisateurs();
        }
    };

    const soumettreFormulaire = async (e) => {
        e.preventDefault();
        
        if (utilisateursAjoutes.length === 0) {
            setErreurGenerale("Veuillez ajouter au moins un utilisateur");
            return;
        }

        setErreurGenerale("");
        setChargement(true);

        try {
            const promessesAssignation = utilisateursAjoutes.map(async (utilisateur) => {
                const donneesPermission = {
                    todoId: tache.id,
                    userLogin: utilisateur.login,
                    canEdit: peutModifier,
                    canDelete: peutSupprimer
                };

                return servicePermissionTache.assignerPermissionParLogin(donneesPermission);
            });

            const resultats = await Promise.allSettled(promessesAssignation);
            
            const echecs = resultats.filter(resultat => resultat.status === 'rejected');
            const succes = resultats.filter(resultat => resultat.status === 'fulfilled' && resultat.value.success);

            if (echecs.length > 0) {
                setErreurGenerale(`Erreur lors de l'assignation pour ${echecs.length} utilisateur(s). Vérifiez les logins.`);
            } else if (succes.length > 0) {

                setUtilisateursAjoutes([]);
                setLoginsUtilisateurs("");
                setPeutModifier(false);
                setPeutSupprimer(false);
                
                if (onPermissionAssignee) {
                    onPermissionAssignee({ success: true, count: succes.length });
                }
            }

        } catch (err) {
            console.error("Erreur:", err);
            setErreurGenerale(err.message || err.error || "Erreur lors de l'assignation des permissions");
        } finally {
            setChargement(false);
        }
    };

    if (!tache) {
        return <div className="text-center">Tâche non trouvée</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Assigner des permissions</h2>
            
            <div className="mb-4 bg-blue-50 p-3 rounded-md">
                <p className="text-blue-800 font-medium">Tâche: {tache.title}</p>
                <p className="text-blue-600 text-sm">ID: {tache.id}</p>
            </div>
            
            <form onSubmit={soumettreFormulaire} className="space-y-4">

                <div>
                    <label htmlFor="loginsUtilisateurs" className="block text-gray-700 mb-2 font-medium">
                        Logins des utilisateurs <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            id="loginsUtilisateurs"
                            value={loginsUtilisateurs}
                            onChange={gererChangementLogin}
                            onKeyDown={gererToucheEntree}
                            className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Tapez les logins (ex: user1, user2, user3...)"
                        />
                        <button
                            type="button"
                            onClick={ajouterUtilisateurs}
                            disabled={!loginsUtilisateurs.trim()}
                            className={`px-4 py-2 rounded-md font-medium ${
                                loginsUtilisateurs.trim()
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <FiPlus size={18} />
                        </button>
                    </div>
                </div>


                {utilisateursAjoutes.length > 0 && (
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">
                            Utilisateurs à affecter ({utilisateursAjoutes.length})
                        </label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {utilisateursAjoutes.map((utilisateur) => (
                                <div
                                    key={utilisateur.id}
                                    className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                                >
                                    <div className="flex items-center gap-2">
                                        <FiUser className="text-gray-500" size={16} />
                                        <span className="text-gray-700 font-medium">{utilisateur.login}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => supprimerUtilisateur(utilisateur.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded"
                                        title="Supprimer de la liste"
                                    >
                                        <FiX size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                <div>
                    <label className="block text-gray-700 mb-3 font-medium">Permissions à accorder</label>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={peutModifier}
                                onChange={(e) => setPeutModifier(e.target.checked)}
                                className="rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-gray-700 font-medium">Peut modifier</span>
                                <p className="text-sm text-gray-500">L'utilisateur peut modifier le titre, la description et le statut de la tâche</p>
                            </div>
                        </label>
                        
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={peutSupprimer}
                                onChange={(e) => setPeutSupprimer(e.target.checked)}
                                className="rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                                <span className="text-gray-700 font-medium">Peut supprimer</span>
                                <p className="text-sm text-gray-500">L'utilisateur peut supprimer définitivement cette tâche</p>
                            </div>
                        </label>
                    </div>
                    
                    {!peutModifier && !peutSupprimer && (
                        <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                            Si aucune permission n'est cochée, les utilisateurs auront uniquement accès en lecture seule.
                        </p>
                    )}
                </div>


                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={chargement || utilisateursAjoutes.length === 0}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            chargement || utilisateursAjoutes.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-yellow-600 hover:bg-yellow-700'
                        } text-white focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    >
                        {chargement 
                            ? 'Assignation...' 
                            : `Assigner aux ${utilisateursAjoutes.length} utilisateur(s)`
                        }
                    </button>
                    
                    {onAnnuler && (
                        <button
                            type="button"
                            onClick={onAnnuler}
                            disabled={chargement}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                            Annuler
                        </button>
                    )}
                </div>


                {erreurGenerale && (
                    <div className="text-red-500 text-center mt-3 p-2 bg-red-50 rounded-md">
                        {erreurGenerale}
                    </div>
                )}
            </form>


           
        </div>
    );
}

export default AssignerPermission;
