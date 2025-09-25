import { useState, useEffect, useRef } from "react";
import serviceTache from "../services/serviceTache";
import { FiMic, FiCalendar } from "react-icons/fi";

function ModifierTache({ tache, onTacheModifiee, onAnnuler }) {
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [termine, setTermine] = useState(false);
    const [fichierPhoto, setFichierPhoto] = useState(null);
    const [photoActuelle, setPhotoActuelle] = useState(null);
    const [previewPhoto, setPreviewPhoto] = useState(null);
    const [chargement, setChargement] = useState(false);
    const [erreurs, setErreurs] = useState({});
    const [erreurGenerale, setErreurGenerale] = useState("");
    const [fichierAudio, setFichierAudio] = useState(null);
    const [previewAudio, setPreviewAudio] = useState(tache?.audioUrl || null);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const startDateRef = useRef(null);
    const endDateRef = useRef(null);


    useEffect(() => {
        if (tache) {
            setTitre(tache.title || "");
            setDescription(tache.description || "");
            setTermine(tache.completed || false);
            setPhotoActuelle(tache.photoUrl);
            setPreviewAudio(tache.audioUrl || null);
            setStartDate(tache.startDate || "");
            setEndDate(tache.endDate || "");
        }
    }, [tache]);


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


    const supprimerNouvellePhoto = () => {
        setFichierPhoto(null);
        setPreviewPhoto(null);
        document.getElementById('photo-input').value = '';
    };


    const supprimerPhotoActuelle = () => {
        setPhotoActuelle(null);
    };


    // Sélection d'un fichier audio
    const gererSelectionAudio = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFichierAudio(file);
            setPreviewAudio(URL.createObjectURL(file));
        }
    };


    const supprimerAudio = () => {
        setFichierAudio(null);
        setPreviewAudio(null);
    };


    const soumettreFormulaire = async (e) => {
        e.preventDefault();
        

        setErreurs({});
        setErreurGenerale("");
        setChargement(true);

        try {
            let urlPhoto = photoActuelle;
            let urlAudio = tache.audioUrl;


            if (fichierPhoto) {
                const resultatUpload = await serviceTache.uploaderPhoto(fichierPhoto);
                if (resultatUpload.success) {
                    urlPhoto = resultatUpload.data.url;
                } else {
                    throw new Error(resultatUpload.error || "Erreur lors de l'upload de la photo");
                }
            }


            if (fichierAudio) {
                const resultatUpload = await serviceTache.uploaderAudio(fichierAudio);
                if (resultatUpload.success) {
                    urlAudio = resultatUpload.data.url;
                } else {
                    throw new Error(resultatUpload.error || "Erreur lors de l'upload du message vocal");
                }
            }

            const donneesToche = {
                title: titre,
                description: description || null,
                completed: termine,
                photoUrl: urlPhoto,
                audioUrl: urlAudio,
                startDate: startDate,
                endDate: endDate
            };


            const resultat = await serviceTache.modifierTache(tache.id, donneesToche);

            if (resultat.success) {

                if (onTacheModifiee) {
                    onTacheModifiee(resultat.data);
                }
            } else {
                setErreurGenerale(resultat.error || "Erreur lors de la modification de la tâche");
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
                setErreurGenerale(err.message || err.error || "Erreur lors de la modification de la tâche");
            }
        } finally {
            setChargement(false);
        }
    };

    if (!tache) {
        return <div className="text-center">Tâche non trouvée</div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Modifier la tâche</h2>
            
            <form onSubmit={soumettreFormulaire} className="space-y-4">

                <div>
                    <label htmlFor="titre" className="block text-gray-700 mb-2 font-medium">
                        Titre <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="titre"
                        value={titre}
                        onChange={(e) => setTitre(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300  text-black rounded-md focus:outline-none focus:ring-2 focus:text-black ring-blue-500"
                        placeholder="Entrez le titre de la tâche"
                        required
                    />
                    {erreurs.title && <div className="text-red-500 text-sm mt-1">{erreurs.title}</div>}
                </div>


                <div>
                    <label htmlFor="description" className="block text-black mb-2 font-medium">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 text-black rounded-md focus:outline-none focus:ring-2 focus: focus:text-black ring-blue-500"
                        placeholder="Entrez la description (optionnel)"
                        rows="3"
                    />
                    {erreurs.description && <div className="text-red-500 text-sm mt-1">{erreurs.description}</div>}
                </div>


                <div>
                    <label className="flex  text-black items-center gap-2">
                        <input
                            type="checkbox"
                            checked={termine}
                            onChange={(e) => setTermine(e.target.checked)}
                            className="rounded focus:ring-2 focus: focus:text-black ring-blue-500"
                        />
                        <span className="text-gray-700 font-medium">Tâche terminée</span>
                    </label>
                </div>


                {photoActuelle && (
                    <div>
                        <label className="block text-gray-700 mb-2 font-medium">Photo actuelle</label>
                        <div className="relative text-black">
                            <img
                                src={photoActuelle}
                                alt="Photo actuelle"
                                className="w-full text-black h-32 focus: object-cover rounded-md border"
                            />
                            <button
                                type="button"
                                onClick={supprimerPhotoActuelle}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}


                <div>
                    <label htmlFor="photo-input" className="block text-gray-700 mb-2 font-medium">
                        {photoActuelle ? 'Remplacer la photo' : 'Ajouter une photo'}
                    </label>
                    <input
                        type="file"
                        id="photo-input"
                        accept="image/*"
                        onChange={gererSelectionPhoto}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    

                    {previewPhoto && (
                        <div className="mt-3 relative">
                            <img
                                src={previewPhoto}
                                alt="Nouvelle photo"
                                className="w-full h-32 object-cover rounded-md border"
                            />
                            <button
                                type="button"
                                onClick={supprimerNouvellePhoto}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                            >
                                ×
                            </button>
                        </div>
                    )}
                </div>


                <div>
                    <label className="block text-gray-700 mb-2 font-medium flex items-center gap-2">
                        <FiMic /> Message vocal (optionnel)
                    </label>
                    <input type="file" accept="audio/*" onChange={gererSelectionAudio} />
                    {previewAudio && (
                        <div className="mt-2">
                            <audio controls src={previewAudio} className="w-64" />
                            <button type="button" onClick={supprimerAudio} className="ml-2 text-red-500">Supprimer</button>
                        </div>
                    )}
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
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md pr-10"
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
                            className="w-full px-3 py-2 border  border-gray-300 rounded-md pr-10"
                        />
                        <FiCalendar
                            className="absolute right-3 text-gray-400 cursor-pointer"
                            size={20}
                            onClick={() => endDateRef.current && endDateRef.current.showPicker && endDateRef.current.showPicker()}
                            onMouseDown={e => {
                                e.preventDefault();
                                if (endDateRef.current) endDateRef.current.focus();
                            }}
                        />
                    </div>
                </div>


                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        disabled={chargement || !titre.trim()}
                        className={`flex-1 py-2 px-4 rounded-md font-medium ${
                            chargement || !titre.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                        } text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                    >
                        {chargement ? 'Modification...' : 'Modifier la tâche'}
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

export default ModifierTache;
