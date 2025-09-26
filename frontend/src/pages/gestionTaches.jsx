import { useState } from "react";
import ListerTaches from "../component/listerTaches";
import AjouterTache from "../component/AjouterTache";
import ModifierTache from "../component/ModifierTache";
import AfficherTache from "../component/AfficherTache";
import AssignerPermission from "../component/AssignerPermission";
import Historique from "../component/Historique";
import { useNavigate, Link } from "react-router-dom";
import { 
    FiList, 
    FiPlus, 
    FiEdit, 
    FiEye, 
    FiUsers, 
    FiLogOut,
    FiArrowLeft,
    FiClock 
} from "react-icons/fi";

function Taches({ setNotification }) {
    const [vueActuelle, setVueActuelle] = useState("liste");
    const [tacheSelectionnee, setTacheSelectionnee] = useState(null);
    const navigate = useNavigate();

    const obtenirUtilisateur = () => {
        const utilisateur = localStorage.getItem("user");
        if (utilisateur) {
            const donneeUtilisateur = JSON.parse(utilisateur);
            return donneeUtilisateur.token?.user || null;
        }
        return null;
    };

    const utilisateur = obtenirUtilisateur();

    const seDeconnecter = () => {
        localStorage.removeItem("user");
        navigate("/login");
    };

    const gererSelectionTache = (tache, modifier = false) => {
        setTacheSelectionnee(tache);
        setVueActuelle(modifier ? "modifier" : "afficher");
    };

    const gererCreationTache = () => {
        setTacheSelectionnee(null);
        setVueActuelle("ajouter");
    };

    const gererModificationTache = (tache) => {
        setTacheSelectionnee(tache);
        setVueActuelle("modifier");
    };

    const gererPermissions = (tache) => {
        setTacheSelectionnee(tache);
        setVueActuelle("permissions");
    };

    const retournerALaListe = () => {
        setTacheSelectionnee(null);
        setVueActuelle("liste");
    };

    const gererSucces = () => {
        retournerALaListe();
    };

    if (!utilisateur) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="bg-amber-50 p-8 rounded-2xl shadow-2xl text-center border-4 border-yellow-500">
                    <h2 className="text-3xl font-bold mb-4 text-yellow-600">Non connecté</h2>
                    <p className="text-gray-700 mb-4 text-lg">Vous devez être connecté pour accéder à vos tâches.</p>
                    <button
                        onClick={() => navigate("/login")}
                        className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold text-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 shadow-lg transition-all duration-200"
                    >
                        Se connecter
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-700">
            <header className="shadow-2xl ">
                <div className="max-w-6xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-yellow-600">ToDoList de Toufa</h1>
                            <p className="text-amber-50 mt-2 text-lg">
                                Bienvenue, <span className="font-semibold">{utilisateur.name || utilisateur.email}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 bg-yellow-100 px-4 py-2 rounded-full border border-yellow-400 font-semibold">
                                <span>Role :</span>
                                <span className="capitalize">{utilisateur.role}</span>
                            </div>
                            {vueActuelle === "historique" && (
                                <button
                                    onClick={retournerALaListe}
                                    className="flex items-center gap-2 bg-gray-200 text-black px-4 py-2 rounded-xl font-bold text-base hover:bg-gray-400 transition-all duration-200 shadow-lg"
                                >
                                    <FiArrowLeft size={18} />
                                    Retour
                                </button>
                            )}
                            <button
                                onClick={seDeconnecter}
                                className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-base hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 shadow-lg transition-all duration-200"
                            >
                                <FiLogOut size={18} />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-8">
                {vueActuelle === "liste" && (
                    <div>
                        <div className="flex gap-4 mb-8">
                            <button
                                onClick={gererCreationTache}
                                className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-base hover:bg-yellow-600 transition-all duration-200 shadow-lg"
                            >
                                <FiPlus size={18} />
                                Créer tâche
                            </button>
                            <button
                                onClick={() => setVueActuelle("historique")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-base transition-all duration-200 shadow-lg ${
                                    vueActuelle === "historique"
                                        ? "bg-yellow-500 text-black"
                                        : "bg-gray-200 text-black hover:bg-gray-300"
                                }`}
                            >
                                <FiClock size={18} />
                                Historique
                            </button>
                        </div>
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-yellow-200">
                            <ListerTaches
                                onSelectionnerTache={gererSelectionTache}
                                onCreerTache={gererCreationTache}
                                setNotification={setNotification}
                            />
                        </div>
                        {/* ActivitesRecentes supprimé */}
                    </div>
                )}

                {vueActuelle === "historique" && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                        <Historique />
                        <div className="mt-4">
                            <Link to="/activites-recentes" className="text-blue-600 underline">
                                Voir toutes les activités récentes
                            </Link>
                        </div>
                    </div>
                )}

                {vueActuelle === "ajouter" && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                        <AjouterTache
                            onTacheCreee={gererSucces}
                            onAnnuler={retournerALaListe}
                        />
                    </div>
                )}

                {vueActuelle === "modifier" && tacheSelectionnee && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                        <ModifierTache
                            tache={tacheSelectionnee}
                            onTacheModifiee={gererSucces}
                            onAnnuler={retournerALaListe}
                        />
                    </div>
                )}

                {vueActuelle === "afficher" && tacheSelectionnee && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                            <AfficherTache
                                tache={tacheSelectionnee}
                                onModifier={gererModificationTache}
                                onSupprimer={() => retournerALaListe()}
                                onFermer={retournerALaListe}
                            />
                        </div>
                        <div className="text-center">
                            <button
                                onClick={() => gererPermissions(tacheSelectionnee)}
                                className="flex items-center gap-3 mx-auto bg-yellow-500 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 shadow-lg transition-all duration-200"
                            >
                                <FiUsers size={26} />
                                Assigner des permissions
                            </button>
                        </div>
                    </div>
                )}

                {vueActuelle === "permissions" && tacheSelectionnee && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200">
                        <AssignerPermission
                            tache={tacheSelectionnee}
                            onPermissionAssignee={gererSucces}
                            onAnnuler={retournerALaListe}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default Taches;
