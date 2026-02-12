import { useState } from 'react';

import { PersonForm } from './types';
import { useLoadCouple } from './useLoadCouple';
import { useNameValidation } from './useNameValidation';
import { useSubmitCouple } from './useSubmitCouple';

import { Category } from '@/models/models';

export function useAddCoupleForm(
    user: any,
    navigate: (path: string) => void,
    category: Category | null,
    coupleId?: string,
) {
    const isEdit = !!coupleId;

    const [personA, setPersonA] = useState<PersonForm>({
        display_name: '',
        image_url: '',
        file: null,
    });
    const [personB, setPersonB] = useState<PersonForm>({
        display_name: '',
        image_url: '',
        file: null,
    });

    const [consentChecked, setConsentChecked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nameErrors, setNameErrors] = useState<{ A?: string; B?: string }>({});
    const [showModerationModal, setShowModerationModal] = useState(false);

    // Load couple if editing
    useLoadCouple(isEdit, coupleId, setPersonA, setPersonB, setConsentChecked, setCategory);

    // Validation nom
    const { checkPersonExists } = useNameValidation(isEdit, personA, personB);

    const handleBlur = async (which: 'A' | 'B') => {
        const target = which === 'A' ? personA : personB;
        if (!target.display_name.trim()) return;

        const exists = await checkPersonExists(target.display_name);
        setNameErrors((prev) => ({
            ...prev,
            [which]: exists ? `Le nom "${target.display_name}" est déjà utilisé.` : '',
        }));
    };

    const { submit } = useSubmitCouple(user, navigate, isEdit, category, coupleId);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await submit(personA, personB);
            if (!isEdit && result?.created) {
                setShowModerationModal(true);
            }
        } catch (err: any) {
            setError(err.toString());
        } finally {
            setLoading(false);
        }
    };

    const closeModerationModal = () => {
        setShowModerationModal(false);
        navigate('/');
    };

    const canSubmit =
        !loading &&
        personA.display_name &&
        personB.display_name &&
        (personA.file || personA.image_url) &&
        (personB.file || personB.image_url) &&
        consentChecked &&
        !nameErrors.A &&
        !nameErrors.B;

    return {
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
    };
}
