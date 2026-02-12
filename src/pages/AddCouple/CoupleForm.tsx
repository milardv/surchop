import { PersonInput } from '@/components/PersonInput';
import Modal from '@/components/ui/Modal';

export default function CoupleForm({
    isEdit,
    personA,
    personB,
    setPersonA,
    setPersonB,
    consentChecked,
    setConsentChecked,
    nameErrors,
    error,
    loading,
    canSubmit,
    handleBlur,
    handleSubmit,
    showModerationModal,
    closeModerationModal,
}: any) {
    return (
        <>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PersonInput
                        label="Personne A"
                        person={personA}
                        setPerson={setPersonA}
                        err={nameErrors.A}
                        handleBlur={handleBlur}
                    />
                    <PersonInput
                        label="Personne B"
                        person={personB}
                        setPerson={setPersonB}
                        err={nameErrors.B}
                        handleBlur={handleBlur}
                    />
                </div>

                {/* ✔ Consentement */}
                {!isEdit && (
                    <div className="flex items-start gap-2 border-t pt-4 mt-6">
                        <input
                            id="consent"
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-1"
                        />
                        <label htmlFor="consent" className="text-sm text-gray-700">
                            Je certifie avoir obtenu le <strong>consentement explicite</strong> des
                            deux personnes représentées.
                        </label>
                    </div>
                )}

                {error && <div className="text-red-600 text-sm">{error}</div>}

                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`px-5 py-2.5 rounded text-white font-medium transition
                    ${
                        canSubmit
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    {loading
                        ? 'Enregistrement…'
                        : isEdit
                          ? 'Modifier le couple'
                          : 'Créer le couple'}
                </button>
            </form>

            {showModerationModal && (
                <Modal title="Couple envoyé pour modération" onClose={closeModerationModal}>
                    Merci, ton ajout a bien été enregistré. Un modérateur va vérifier le couple et
                    valider ou refuser sa publication.
                </Modal>
            )}
        </>
    );
}
