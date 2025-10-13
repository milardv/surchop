import React, {useState} from "react";
import {User} from "firebase/auth";
import {addDoc, collection, doc, serverTimestamp, setDoc} from "firebase/firestore";
import {db} from "../firebase";
import {useNavigate} from "react-router-dom";

export default function AddCouplePage({user}: { user: User | null }) {
    const navigate = useNavigate();

    const [personA, setPersonA] = useState({display_name: "", image_url: ""});
    const [personB, setPersonB] = useState({display_name: "", image_url: ""});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!user) {
        return (
            <main className="max-w-3xl mx-auto px-4 py-10">
                <div className="p-6 border rounded-2xl bg-white">
                    <h2 className="text-lg font-semibold mb-2">Ajouter un couple</h2>
                    <p className="text-gray-600">Connecte-toi pour pouvoir ajouter un couple.</p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-4 px-3 py-2 rounded bg-gray-900 text-white"
                    >
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
            // 1️⃣ Crée les deux personnes
            const peopleCol = collection(db, "people");
            const aRef = await addDoc(peopleCol, {
                display_name: personA.display_name,
                image_url: personA.image_url || "",
            });
            const bRef = await addDoc(peopleCol, {
                display_name: personB.display_name,
                image_url: personB.image_url || "",
            });

            // 2️⃣ Crée le couple
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

            // 3️⃣ Ajoute couple_id à chaque personne
            await Promise.all([
                setDoc(aRef, {couple_id: coupleRef.id}, {merge: true}),
                setDoc(bRef, {couple_id: coupleRef.id}, {merge: true}),
            ]);

            console.log("✅ Couple créé :", coupleRef.id);
            navigate("/");
        } catch (err: any) {
            console.error(err);
            setError("Erreur lors de l’enregistrement : " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <h2 className="text-lg font-semibold mb-6">Ajouter un nouveau couple</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* === Personne A === */}
                    <div>
                        <h3 className="font-medium mb-2">Personne A</h3>
                        <input
                            type="text"
                            placeholder="Nom"
                            value={personA.display_name}
                            onChange={(e) =>
                                setPersonA({...personA, display_name: e.target.value})
                            }
                            className="w-full border rounded p-2 mb-2"
                        />
                        <input
                            type="text"
                            placeholder="URL photo"
                            value={personA.image_url}
                            onChange={(e) =>
                                setPersonA({...personA, image_url: e.target.value})
                            }
                            className="w-full border rounded p-2"
                        />

                        {/* ✅ Aperçu de l'image A */}
                        {personA.image_url && (
                            <div className="mt-3">
                                <img
                                    src={personA.image_url}
                                    alt="Prévisualisation A"
                                    onError={(e) =>
                                        ((e.target as HTMLImageElement).style.display = "none")
                                    }
                                    className="rounded-xl border max-h-48 object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* === Personne B === */}
                    <div>
                        <h3 className="font-medium mb-2">Personne B</h3>
                        <input
                            type="text"
                            placeholder="Nom"
                            value={personB.display_name}
                            onChange={(e) =>
                                setPersonB({...personB, display_name: e.target.value})
                            }
                            className="w-full border rounded p-2 mb-2"
                        />
                        <input
                            type="text"
                            placeholder="URL photo"
                            value={personB.image_url}
                            onChange={(e) =>
                                setPersonB({...personB, image_url: e.target.value})
                            }
                            className="w-full border rounded p-2"
                        />

                        {/* ✅ Aperçu de l'image B */}
                        {personB.image_url && (
                            <div className="mt-3">
                                <img
                                    src={personB.image_url}
                                    alt="Prévisualisation B"
                                    onError={(e) =>
                                        ((e.target as HTMLImageElement).style.display = "none")
                                    }
                                    className="rounded-xl border max-h-48 object-cover"
                                />
                            </div>
                        )}
                    </div>
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
