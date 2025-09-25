import { useState } from "react";
import authService from "../services/authService";
import { useNavigate } from "react-router-dom";


function Inscription() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("USER");
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const navigate = useNavigate();

    const handleSubmitForm = (e) => {
        e.preventDefault();
        
        setErrors({});
        setGeneralError("");
        
        if (password !== confirmPassword) {
            setGeneralError("Les mots de passe ne correspondent pas");
            return;
        }
        
        authService.inscription({ email, password, name, role })
            .then((data) => {
                console.log("Inscription successful:", data);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setName("");
                setRole("USER");
                setErrors({});
                setGeneralError("");
                navigate("/login");
            })
            .catch((err) => {
                console.log("Error response:", err);
                if (err.details && Array.isArray(err.details)) {
                    const fieldErrors = {};
                    err.details.forEach(detail => {
                        if (detail.path && detail.path.length > 0) {
                            const fieldName = detail.path[0];
                            fieldErrors[fieldName] = detail.message;
                        }
                    });
                    setErrors(fieldErrors);
                    setGeneralError(err.error || "Erreur de validation");
                } else {
                    setGeneralError(err.message || err.error || "Inscription échouée");
                }
            });
    };

    
    return <>
        <div className="App flex flex-col items-center justify-center min-h-screen bg-gray-700">
            <form onSubmit={handleSubmitForm} className='flex flex-col gap-6 bg-amber-50 p-10 rounded-2xl shadow-2xl w-full max-w-lg border-4 border-yellow-500'>
                <h1 className="text-4xl font-bold mb-6 text-yellow-600 text-center">Inscription</h1>
                <div>
                    <label htmlFor="name" className='block text-gray-700 mb-2'>Nom complet:</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className='w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white' 
                        name="name"
                    />
                    {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                </div>
                <div>
                    <label htmlFor="email" className='block text-gray-700 mb-2'>Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white' 
                        name="email"    
                    />
                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                </div>
                <div>
                    <label htmlFor="password" className='block text-gray-700 mb-2'>Mot de passe:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white' 
                        name="password"
                    />
                    {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                </div>
                <div>
                    <label htmlFor="confirmPassword" className='block text-gray-700 mb-2'>Confirmer le mot de passe:</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className='w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white' 
                        name="confirmPassword"
                    />
                </div>
                <div>
                    <label htmlFor="role" className='block text-gray-700 mb-2'>Rôle:</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className='w-full px-4 py-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white' 
                        name="role"
                    >
                        <option value="USER">Utilisateur</option>
                        <option value="ADMIN">Administrateur</option>
                    </select>
                    {errors.role && <div className="text-red-500 text-sm mt-1">{errors.role}</div>}
                </div>
                <button
                    type="submit"
                    className='w-full py-3 bg-yellow-500 text-black rounded-xl font-bold text-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 shadow-lg transition-all duration-200'
                >
                    S'inscrire
                </button>
                {generalError && (
                    <div className="text-red-500 text-center mt-2">{generalError}</div>
                )}
                <h4 className="text-center mt-4 text-black">
                    Vous avez déjà un compte ? <a href="/login" className="text-yellow-600 font-semibold">Se connecter</a>
                </h4>
            </form>
        </div>
    </>;
}

export default Inscription;