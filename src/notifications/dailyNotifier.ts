export async function setupDailyNotification(
    getLatestCouple: () => Promise<{ id: string; personA: any; personB: any } | null>,
) {
    if (!('Notification' in window)) return;

    // Demande la permission une seule fois
    if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
    }

    const sendNotification = async () => {
        const latestCouple = await getLatestCouple();
        if (!latestCouple) return;

        const { id, personA, personB } = latestCouple;

        // Vérifie si le couple a déjà été voté (stocké en localStorage)
        const myVotes = JSON.parse(localStorage.getItem('myVotes') || '{}');
        if (myVotes[id]) return;

        // Envoi d'une notification locale
        new Notification('💘 Voici le couple du jour', {
            body: `${personA.display_name} & ${personB.display_name}`,
            icon: '/pwa-192x192.png',
            data: { url: `https://surchope.fr/couple/${id}` },
        });
    };

    // Vérifie maintenant, puis toutes les 24h
    sendNotification();
    setInterval(sendNotification, 24 * 60 * 60 * 1000);
}
