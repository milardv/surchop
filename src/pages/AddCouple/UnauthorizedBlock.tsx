import BackButton from '@/components/ui/BackButton';

export default function UnauthorizedBlock() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10">
            <div className="p-6 border rounded-2xl bg-white shadow">
                <h2 className="text-lg font-semibold mb-2">Ajouter ou éditer un couple</h2>
                <p className="text-gray-600">Connecte-toi pour accéder à cette fonctionnalité.</p>

                <BackButton to="/" label="Retour à la liste" className="mt-8"/>
            </div>
        </main>
    );
}
