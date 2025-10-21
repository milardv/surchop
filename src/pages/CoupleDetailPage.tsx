import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteDoc, doc } from 'firebase/firestore';

import { db } from '../firebase'; // ✅ assure-toi que ton import est correct
import { CoupleView } from '../models/models';
import CoupleCard from '../components/CoupleCard/CoupleCard';
import SurchopeLoader from '../components/SurchopeLoader';

export default function CoupleDetailPage({ couples, user }: { couples: CoupleView[]; user: any }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const couple = couples.find((c) => c.id === id);

    if (!couple)
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center text-gray-600">
                <SurchopeLoader />
                <p>Chargement du couple... 😢</p>
                <Link to="/" className="mt-4 text-pink-600 hover:underline">
                    ⬅️ Retourner à l'accueil
                </Link>
            </div>
        );

    // 🗑️ Fonction de suppression (visible uniquement si user connecté)
    const handleDelete = async (coupleId: string, userUid: string) => {
        const confirmDelete = window.confirm(`Souhaites-tu vraiment supprimer ce couple ?`);
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, 'couples', coupleId));
            alert('Le couple a bien été supprimé 💔');
            navigate('/'); // redirection après suppression
        } catch (err) {
            console.error(err);
            alert('Erreur lors de la suppression du couple 😢');
        }
    };

    return (
        <main className="max-w-md mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-center text-pink-600 mb-4">
                💘 {couple.personA.display_name} & {couple.personB.display_name}
            </h1>

            <CoupleCard
                couple={couple}
                user={user}
                compact={false}
                onlyMyVotes={false}
                onDelete={handleDelete} // ✅ bouton de suppression activé
            />

            <div className="text-center mt-6">
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                    ⬅️ Retour à la liste
                </Link>
            </div>
        </main>
    );
}
