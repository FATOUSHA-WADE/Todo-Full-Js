import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Login() {
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [error, setError] = React.useState("");
    const navigate = useNavigate(true);

    const handleSubmitForm = (e) => {
        e.preventDefault();
        authService.login({ email, password })
            .then((data) => {
                console.log("Login successful:", data);
                setEmail("");
                setPassword("");
                setError("");

                navigate("/taches");
            })
            .catch((err) => {
                setError(err.message || "Login failed");
            });
    
    };

    useEffect(() => {
        const handlePopState = (e) => {
            navigate(0, { replace: true });
        };
        
    }, [navigate]);

    return <>
        <div className="App flex flex-col items-center justify-center min-h-screen bg-gray-700">
            <form 
                onSubmit={handleSubmitForm} 
                className='flex flex-col gap-6 bg-amber-50 p-10 rounded-2xl shadow-2xl w-full max-w-lg border-4 border-yellow-500'
            >
                <h1 className="text-4xl font-bold mb-6 text-yellow-600 text-center">Connexion</h1>
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
                </div>
                <button
                    type="submit"
                    className='w-full py-3 bg-yellow-500 text-black rounded-xl font-bold text-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-700 shadow-lg transition-all duration-200'
                >
                    Se connecter
                </button>
                {error && (
                    <div className="text-red-500 text-center mt-2">{error}</div>
                )}
                <h4 className="text-center mt-4 text-black">
                    Vous n'avez pas de compte? <a href="/inscription" className="text-yellow-600 font-semibold">S'inscrire</a>
                </h4>
            </form>
        </div>
    </>;
    }

export default Login;