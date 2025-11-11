// ✅ Cache en mémoire pour éviter les requêtes répétées identiques
const cache = new Map<string, { title: string; thumbnail?: string }[]>();

// ✅ Timer global pour appliquer un petit délai entre deux requêtes
let lastFetchTime = 0;
const MIN_DELAY = 400; // 400 ms minimum entre 2 appels API

export async function fetchWikipediaSuggestions(
    query: string,
): Promise<{ title: string; thumbnail?: string }[]> {
    if (!query.trim() || query.length < 2) return [];

    // 🔁 Si on a déjà les résultats en cache → on les renvoie immédiatement
    if (cache.has(query)) {
        return cache.get(query)!;
    }

    // ⏱️ Attente minimum entre deux appels pour éviter le spam API
    const now = Date.now();
    const elapsed = now - lastFetchTime;
    if (elapsed < MIN_DELAY) {
        await new Promise((r) => setTimeout(r, MIN_DELAY - elapsed));
    }
    lastFetchTime = Date.now();

    try {
        const url = `https://fr.wikipedia.org/w/api.php?action=query&generator=prefixsearch&gpssearch=${encodeURIComponent(
            query,
        )}&prop=pageimages&piprop=thumbnail&pithumbsize=100&format=json&origin=*&gpslimit=5`;

        const response = await fetch(url);
        const data = await response.json();

        const pages = data?.query?.pages;
        if (!pages) return [];

        const results = Object.values(pages).map((p: any) => ({
            title: p.title,
            thumbnail: p.thumbnail?.source,
        }));

        // 🧠 Mise en cache pour éviter de redemander le même mot
        cache.set(query, results);

        return results;
    } catch (error) {
        console.error('Erreur Wikipédia autocomplete:', error);
        return [];
    }
}
// 🖼️ Récupère une image de meilleure qualité pour une page précise
export async function fetchWikipediaImageHD(title: string): Promise<string | null> {
    try {
        const url = `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
            title,
        )}&prop=pageimages&piprop=original|thumbnail&pithumbsize=1000&format=json&origin=*`;

        const response = await fetch(url);
        const data = await response.json();

        const pages = data?.query?.pages;
        if (!pages) return null;

        const firstPage = Object.values(pages)[0] as any;
        return firstPage?.original?.source || firstPage?.thumbnail?.source || null;
    } catch (error) {
        console.error('Erreur récupération image HD Wikipédia:', error);
        return null;
    }
}
