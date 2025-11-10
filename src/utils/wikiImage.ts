import { collection, getDocs, updateDoc } from 'firebase/firestore';

import { db } from '@/firebase';

export async function fetchWikipediaImage(name: string): Promise<string | null> {
    try {
        const response = await fetch(
            `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
                name,
            )}&prop=pageimages&format=json&pithumbsize=400&origin=*`,
        );
        const data = await response.json();

        const pages = data.query?.pages;
        const page = pages ? Object.values(pages)[0] : null;
        const imageUrl = (page as any)?.thumbnail?.source;

        return imageUrl || null;
    } catch (e) {
        console.error('Erreur lors de la récupération de l’image Wikipédia', e);
        return null;
    }
}
async function setAllCouplesNonFictional() {
    const couplesSnap = await getDocs(collection(db, 'couples'));
    const updates = couplesSnap.docs.map((docSnap) =>
        updateDoc(docSnap.ref, { isFictional: false }),
    );
    await Promise.all(updates);
    alert('✅ Tous les couples ont été mis à jour en "réel" (isFictional = false)');
}
