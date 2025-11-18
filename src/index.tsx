import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';

import { db } from './firebase';

import { collection, getDocs, orderBy, limit, query, getDoc, doc } from 'firebase/firestore';

import { setupDailyNotification } from './notifications/dailyNotifier';

import { Couple, Person } from '@/models/models';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter basename="/">
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);

// ✅ Enregistrement du service worker PWA (géré par Vite)
const updateSW = registerSW({
    immediate: true, // met à jour dès que possible
    onOfflineReady() {
        console.log('L’application est prête à être utilisée hors ligne.');
    },
});

// 🔄 cache local pour éviter de redemander plusieurs fois les mêmes personnes
const personCache = new Map<string, Person>();

async function loadPerson(id: string): Promise<Person | null> {
    if (personCache.has(id)) return personCache.get(id)!;
    const snap = await getDoc(doc(db, 'people', id));
    if (!snap.exists()) return null;
    const person = { id: snap.id, ...(snap.data() as any) } as Person;
    personCache.set(id, person);
    return person;
}

// ✅ Fonction complète : récupère le dernier couple avec les personnes associées
export async function getLatestCouple(): Promise<Couple | null> {
    try {
        const q = query(collection(db, 'couples'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return null;

        const d = snap.docs[0];
        const c = d.data() as Couple;

        const personA = await loadPerson(c.people_a_id);
        const personB = await loadPerson(c.people_b_id);
        if (!personA || !personB) return null;

        return {
            id: d.id,
            personA,
            personB,
            countA: c.count_a ?? 0,
            countB: c.count_b ?? 0,
            countTie: c.count_tie ?? 0,
            category: c.category ?? 'friends',
        };
    } catch (error) {
        console.error('Erreur lors de la récupération du dernier couple :', error);
        return null;
    }
}
