const VOTER_COOKIE_NAME = 'surchope_voter_id';
const TEN_YEARS_IN_SECONDS = 60 * 60 * 24 * 365 * 10;

function readCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const encodedName = `${encodeURIComponent(name)}=`;
    const parts = document.cookie.split(';');
    for (const rawPart of parts) {
        const part = rawPart.trim();
        if (part.startsWith(encodedName)) {
            return decodeURIComponent(part.slice(encodedName.length));
        }
    }
    return null;
}

function writeCookie(name: string, value: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${TEN_YEARS_IN_SECONDS}; SameSite=Lax`;
}

function generateGuestId() {
    const random =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    return `guest_${random}`;
}

export function getOrCreateGuestVoterId(): string {
    const existing = readCookie(VOTER_COOKIE_NAME);
    if (existing) return existing;

    const created = generateGuestId();
    writeCookie(VOTER_COOKIE_NAME, created);
    return created;
}
