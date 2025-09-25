import { useState, useRef } from "react";
import serviceTache from "../services/serviceTache";
import { 
    FiPlus, 
    FiImage, 
    FiX, 
    FiSave, 
    FiArrowLeft,
    FiUpload,
    FiCheck,
    FiAlertCircle,
    FiMic,
    FiCalendar
} from "react-icons/fi";

function AjouterTache({ onTacheCreee, onAnnuler }) {
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [fichierPhoto, setFichierPhoto] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreurs, setErreurs] = useState({});
    const [erreurGenerale, setErreurGenerale] = useState("");
    const [enregistrementEnCours, setEnregistrementEnCours] = useState(false);
    const [previewAudio, setPreviewAudio] = useState(null);
    const [fichierAudio, setFichierAudio] = useState(null);
    const [timer, setTimer] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const mediaRecorderRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const startDateRef = useRef(null);
    const endDateRef = useRef(null);


    const gererSelectionPhoto = (e) => {
        const fichier = e.target.files[0];
        if (fichier) {
            setFichierPhoto(fichier);
            const lecteur = new FileReader();
            lecteur.onload = (event) => {
                setPreviewPhoto(event.target.result);
            };
            lecteur.readAsDataURL(fichier);
        }
    };


    const supprimerPhoto = () => {
        setFichierPhoto(null);
        setPreviewPhoto(null);
        document.getElementById('photo-input').value = '';
    };


    const soumettreFormulaire = async (e) => {
        e.preventDefault();
        

        setErreurs({});
        setErreurGenerale("");
        setChargement(true);

        try {
            let urlPhoto = null;



            if (fichierPhoto) {
                const resultatUpload = await serviceTache.uploaderPhoto(fichierPhoto);
                if (resultatUpload.success) {
                    urlPhoto = resultatUpload.data.url;
                } else {
                    throw new Error(resultatUpload.error || "Erreur lors de l'upload de la photo");
                }
            }
            let urlAudio = null;
            if (fichierAudio) {
                const resultatUpload = await serviceTache.uploaderAudio(fichierAudio);
                if (resultatUpload.success && resultatUpload.data && resultatUpload.data.url) {
                    urlAudio = resultatUpload.data.url;
                } else {
                    throw new Error(resultatUpload.error || "Erreur lors de l'upload du message vocal");
                }
            }


            const utilisateur = localStorage.getItem("user");
            const donneeUtilisateur = JSON.parse(utilisateur);
            const idUtilisateur = donneeUtilisateur?.token?.user?.id;

            if (!idUtilisateur) {
                throw new Error("Utilisateur non connecté");
            }


            const donneesToche = {
                title: titre,
                description: description || null,
                photoUrl: urlPhoto,
                audioUrl: urlAudio, 
                userId: idUtilisateur,
                startDate: startDate ? new Date(startDate).toISOString() : null,
                endDate: endDate ? new Date(endDate).toISOString() : null
            };

            const resultat = await serviceTache.creerTache(donneesToche);

            if (resultat.success) {

                setTitre("");
                setDescription("");
                setFichierPhoto(null);
                setPreviewPhoto(null);
                document.getElementById('photo-input').value = '';
                

                if (onTacheCreee) {
                    onTacheCreee(resultat.data);
                }
            } else {
                setErreurGenerale(resultat.error || "Erreur lors de la création de la tâche");
            }

        } catch (err) {
            console.error("Erreur:", err);
            if (err.details && Array.isArray(err.details)) {

                const erreursChamps = {};
                err.details.forEach(detail => {
                    if (detail.path && detail.path.length > 0) {
                        const nomChamp = detail.path[0];
                        erreursChamps[nomChamp] = detail.message;
                    }
                });
                setErreurs(erreursChamps);
                setErreurGenerale(err.error || "Erreur de validation");
            } else {
                setErreurGenerale(err.message || err.error || "Erreur lors de la création de la tâche");
            }
        } finally {
            setChargement(false);
        }
    };

    const demarrerEnregistrement = async () => {
        setEnregistrementEnCours(true);
        setPreviewAudio(null);
        setFichierAudio(null);
        setTimer(0);

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErreurGenerale("L'enregistrement audio n'est pas supporté sur ce navigateur.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new window.MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                setFichierAudio(audioBlob);
                setPreviewAudio(URL.createObjectURL(audioBlob));
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();

            timerIntervalRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev >= 1800) { // 30 minutes
                        arreterEnregistrement();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err) {
            setErreurGenerale("Impossible d'accéder au micro.");
            setEnregistrementEnCours(false);
        }
    };

    const arreterEnregistrement = () => {
        setEnregistrementEnCours(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-600 p-3 rounded-full">
                    <FiPlus size={24} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800">Ajouter une tâche</h2>
            </div>
            
            <form onSubmit={soumettreFormulaire} className="space-y-6">

                <div>
                    <label htmlFor="titre" className="block text-gray-700 mb-3 font-semibold text-lg">
                        Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="titre"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-black text-lg transition-all duration-200"
                        placeholder="Entrez le titre de la tâche"
                    />
                    {erreurs.title && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                            <FiAlertCircle size={16} />
                            {erreurs.title}
                        </div>
                    )}
                </div>


                <div>
                    <label htmlFor="description" className="block text-gray-700 mb-3 font-semibold text-lg">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-lg text-black transition-all duration-200"
                        placeholder="Entrez la description (optionnel)"
                        rows="4"
                    />
                    {erreurs.description && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                            <FiAlertCircle size={16} />
                            {erreurs.description}
                        </div>
                    )}
                </div>


                <div>
                    <label htmlFor="photo-input" className="block text-gray-700 mb-3 font-semibold text-lg">
                        <div className="flex items-center gap-2">
                            <FiImage size={20} />
                            Photo (optionnel)
                        </div>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center transition-colors duration-200">
                        <input
                            type="file"
                            id="photo-input"
                            accept="image/*"
                            onChange={gererSelectionPhoto}
                            className="hidden"
                        />
                        {!previewPhoto ? (
                            <label 
                                htmlFor="photo-input" 
                                className="cursor-pointer flex flex-col items-center gap-3"
                            >
                                <div className="bg-yellow-100 p-4 rounded-full">
                                    <FiUpload size={24} className="text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-gray-700 font-medium">Cliquez pour ajouter une photo</p>
                                    <p className="text-gray-500 text-sm">PNG, JPG, JPEG jusqu'à 5MB</p>
                                </div>
                            </label>
                        ) : (
                            <div className="relative flex flex-col items-center">
                                <img
                                    src={previewPhoto}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-xl border-2 border-yellow-400"
                                />
                                <button
                                    type="button"
                                    onClick={supprimerPhoto}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                    title="Supprimer la photo"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                    

                   
                </div>


                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                        Date/Heure de début
                    </label>
                    <div className="relative flex items-center">
                        <input
                            ref={startDateRef}
                            type="datetime-local"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md pr-10"
                        />
                        <FiCalendar
                            className="absolute right-3 text-gray-900 cursor-pointer"
                            size={20}
                            onClick={() => startDateRef.current && startDateRef.current.showPicker && startDateRef.current.showPicker()}
                            onMouseDown={e => {
                                e.preventDefault();
                                if (startDateRef.current) startDateRef.current.focus();
                            }}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                        Date/Heure de fin
                    </label>
                    <div className="relative flex items-center">
                        <input
                            ref={endDateRef}
                            type="datetime-local"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="w-full px-3 py-2 text-black border border-gray-300 rounded-md pr-10"
                            
                        />
                        <FiCalendar
                            className="absolute right-3 text-black  cursor-pointer"
                            size={20}
                            onClick={() => endDateRef.current && endDateRef.current.showPicker && endDateRef.current.showPicker()}
                            onMouseDown={e => {
                                e.preventDefault();
                                if (endDateRef.current) endDateRef.current.focus();
                            }}
                        />
                    </div>
                </div>


                <div>
                    <label className="block text-gray-700 mb-3 font-semibold text-lg">
                        Message vocal (optionnel)
                    </label>
                    <div className="flex gap-3 items-center">
                        {!enregistrementEnCours ? (
                            <button
                                type="button"
                                onClick={demarrerEnregistrement}
                                className="p-3 bg-yellow-500 text-black rounded-full hover:bg-yellow-600"
                                title="Enregistrer un message vocal"
                            >
                                <FiMic size={24} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={arreterEnregistrement}
                                className="py-2 px-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600"
                            >
                                Arrêter l'enregistrement ({Math.floor(timer/60)}:{('0'+(timer%60)).slice(-2)})
                            </button>
                        )}
                        {previewAudio && (
                            <audio controls src={previewAudio} className="ml-4 w-64" />
                        )}
                    </div>
                </div>


                {erreurGenerale && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <FiAlertCircle className="text-red-500" size={18} />
                            <span className="text-red-700 font-medium">{erreurGenerale}</span>
                        </div>
                    </div>
                )}


                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        disabled={chargement || !titre.trim()}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 ${
                            chargement || !titre.trim()
                                ? 'bg-gray-400 cursor-not-allowed text-white'
                                : 'bg-yellow-500 text-black hover:bg-yellow-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                        }`}
                    >
                        {chargement ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Création...
                            </>
                        ) : (
                            <>
                                <FiCheck size={22} />
                                Créer la tâche
                            </>
                        )}
                    </button>
                    
                    {onAnnuler && (
                        <button
                            type="button"
                            onClick={onAnnuler}
                            disabled={chargement}
                            className="flex items-center justify-center gap-3 py-4 px-6 bg-gray-500 text-white rounded-full hover:bg-gray-600 font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FiArrowLeft size={20} />
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

export default AjouterTache;
