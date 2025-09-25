import { useNavigate } from "react-router-dom";
import ActivitesRecentes from "../component/ActivitesRecentes";

function ActivitesRecentesPage() {
    const navigate = useNavigate();

    // Redirige vers la page historique (ex: "/taches" ou autre selon ta route)
    const handleFermer = () => {
        navigate("/taches"); 
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-yellow-700">Activités récentes</h1>
                <ActivitesRecentes limit={20} onFermer={handleFermer} />
            </div>
        </div>
    );
}

export default ActivitesRecentesPage;