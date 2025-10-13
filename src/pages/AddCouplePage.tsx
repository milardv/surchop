import React, {useState} from "react";
import {User} from "firebase/auth";
import {addDoc, collection, doc, serverTimestamp, setDoc} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";
import ImageUploader from "../components/ImageUploader";


const IMGBB_API_KEY = "2857d634922be62f9aec8e82cb24cf90";

async function uploadToImgBB(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("key", IMGBB_API_KEY);
    formData.append("image", file);

    const response = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
    });
    const json = await response.json();
    if (json.success) {
        return json.data.url;  // URL publique de l’image
    } else {
        throw new Error("Upload à ImgBB échoué : " + JSON.stringify(json));
    }
}

export default function AddCouplePage({user}: { user: User | null }) {
    const navigate = useNavigate();

    const [personA, setPersonA] = useState({display_name: "", image_url: "", file: null as File | null});
    const [personB, setPersonB] = useState({display_name: "", image_url: "", file: null as File | null});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto px-4 py-10">
                <div className="p-6 border rounded-2xl bg-white">
                    <h2 className="text-lg font-semibold mb-2">Ajouter un couple</h2>
                    <p className="text-gray-600">Connecte-toi pour pouvoir ajouter un couple.</p>
                    <button onClick={() => navigate("/")} className="mt-4 px-3 py-2 rounded bg-gray-900 text-white">
                        Retour à l’accueil
                    </button>
                </div>
            </main>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!personA.display_name || !personB.display_name) {
            setError("Les deux noms sont obligatoires.");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            // 1️⃣ Upload images si fichier choisi
            let aImageURL = personA.image_url;
            let bImageURL = personB.image_url;

            if (personA.file) {
                aImageURL = await uploadToImgBB(personA.file);
            }
            if (personB.file) {
                bImageURL = await uploadToImgBB(personB.file);
            }

            // 2️⃣ Crée les deux personnes
            const peopleCol = collection(db, "people");
            const aRef = await addDoc(peopleCol, {
                display_name: personA.display_name,
                image_url: aImageURL ?? "",
            });
            const bRef = await addDoc(peopleCol, {
                display_name: personB.display_name,
                image_url: bImageURL ?? "",
            });

            // 3️⃣ Crée le couple
            const coupleRef = doc(collection(db, "couples"));
            await setDoc(coupleRef, {
                id: coupleRef.id,
                people_a_id: aRef.id,
                people_b_id: bRef.id,
                count_a: 0,
                count_b: 0,
                createdBy: user.uid,
                createdAt: serverTimestamp(),
            });

            // 4️⃣ Ajoute couple_id aux personnes
            await Promise.all([
                setDoc(aRef, {couple_id: coupleRef.id}, {merge: true}),
                setDoc(bRef, {couple_id: coupleRef.id}, {merge: true}),
            ]);

            navigate("/");
        } catch (err: any) {
            console.error(err);
            setError("Erreur lors de l’enregistrement : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getPreview = (person: typeof personA) => {
        if (person.file) {
            return URL.createObjectURL(person.file);
        }
        return person.image_url;
    };

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-lg font-semibold mb-6">Ajouter un nouveau couple</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        {label: "Personne A", data: personA, set: setPersonA},
                        {label: "Personne B", data: personB, set: setPersonB},
                    ].map(({label, data, set}) => (
                        <div key={label}>
                            <h3 className="font-medium mb-2">{label}</h3>
                            <input
                                type="text"
                                placeholder="Nom"
                                value={data.display_name}
                                onChange={(e) => set({...data, display_name: e.target.value})}
                                className="w-full border rounded p-2 mb-2"
                            />
                            <ImageUploader
                                label={label}
                                imageUrl={data.image_url}
                                file={data.file}
                                onFileChange={(file) => setPersonA({...data, file})}
                                onUrlChange={(url) => setPersonA({...data, image_url: url})}
                            />
                        </div>
                    ))}
                </div>

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    {loading ? "Enregistrement..." : "Créer le couple"}
                </button>
            </form>
        </main>
    );
}
