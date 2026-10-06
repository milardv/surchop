import { useState } from 'react';
import { ArrowUpRight, Check, Gift, Users } from 'lucide-react';

import { shareLink } from '@/utils/shareLink';

export default function ReferralInvite({
    code,
    referralCount,
    trackingReady,
}: {
    code: string;
    referralCount: number;
    trackingReady: boolean | null;
}) {
    const [message, setMessage] = useState('');
    const progress = Math.min(100, (referralCount / 3) * 100);

    const invite = async () => {
        const url = new URL('/', window.location.origin);
        url.searchParams.set('ref', code);
        try {
            const result = await shareLink(
                url.toString(),
                'Viens voter sur Surchope',
                'Je te défie de départager ces duos avec moi !',
            );
            setMessage(result === 'copied' ? 'Lien copié, à toi de jouer !' : '');
        } catch {
            setMessage('Le partage a échoué. Réessaie dans un instant.');
        }
    };

    return (
        <section className="rounded-[20px] bg-[#dff2f1] p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-white text-secondary">
                        {trackingReady && referralCount >= 3 ? (
                            <Gift size={20} />
                        ) : (
                            <Users size={20} />
                        )}
                    </span>
                    <div>
                        <h2 className="font-display text-lg font-extrabold text-foreground">
                            {trackingReady && referralCount >= 3
                                ? 'Badge Ambassadeur débloqué'
                                : 'Fais tourner le jeu'}
                        </h2>
                        <p className="mt-0.5 text-xs text-foreground/75">
                            {trackingReady === false
                                ? 'Le partage marche, mais le suivi des participations doit être autorisé dans Firebase.'
                                : trackingReady === null
                                  ? 'Préparation de ton lien personnel…'
                                  : referralCount >= 3
                                    ? 'Trois amis sont venus voter grâce à toi.'
                                    : `${referralCount}/3 amis ont voté grâce à ton lien.`}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={invite}
                    disabled={!code}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full bg-secondary px-4 py-2 text-xs font-bold text-white transition-[transform,background-color] duration-150 ease-out active:scale-[0.97]"
                >
                    Inviter <ArrowUpRight size={15} />
                </button>
            </div>
            <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-white/70"
                aria-label={
                    trackingReady === false
                        ? 'Suivi des invitations indisponible'
                        : `${referralCount} amis sur 3`
                }
            >
                <div
                    className="h-full rounded-full bg-secondary transition-[width] duration-200 ease-out"
                    style={{ width: `${trackingReady === false ? 0 : progress}%` }}
                />
            </div>
            {message && (
                <p
                    role="status"
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-primary"
                >
                    {message.includes('copié') && <Check size={14} />} {message}
                </p>
            )}
        </section>
    );
}
