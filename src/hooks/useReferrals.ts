import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { db } from '@/firebase';

function getOrCreateReferralCode(voterId: string) {
    const key = `surchope_referral_code_${voterId}`;
    const existing = localStorage.getItem(key);
    if (existing) return existing;

    const code = crypto.randomUUID().replaceAll('-', '').slice(0, 12);
    localStorage.setItem(key, code);
    return code;
}

export default function useReferrals(voterId?: string) {
    const [code, setCode] = useState('');
    const [referralCount, setReferralCount] = useState(0);
    const [trackingReady, setTrackingReady] = useState<boolean | null>(null);

    useEffect(() => {
        if (!voterId) return;
        setCode(getOrCreateReferralCode(voterId));
    }, [voterId]);

    useEffect(() => {
        if (!code) return;
        const referralsQuery = query(
            collection(db, 'referrals'),
            where('referrerCode', '==', code),
        );
        return onSnapshot(
            referralsQuery,
            (snapshot) => {
                setReferralCount(snapshot.size);
                setTrackingReady(true);
            },
            (error) => {
                console.error('Impossible de charger les invitations :', error);
                setTrackingReady(false);
            },
        );
    }, [code]);

    return { code, referralCount, trackingReady };
}
