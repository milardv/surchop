import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';

import { db } from './firebase';

import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';

import { setupDailyNotification } from './notifications/dailyNotifier';

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

// ✅ Fonction pour récupérer le dernier couple Firestore
async function getLatestCouple() {
    try {
        const q = query(collection(db, 'couples'), orderBy('createdAt', 'desc'), limit(1));
        const snap = await getDocs(q);
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const data = doc.data() as any;
        return {
            id: doc.id,
            personA: data.personA,
            personB: data.personB,
        };
    } catch (error) {
        console.error('Erreur lors de la récupération du dernier couple :', error);
        return null;
    }
}

// ✅ Active les notifications quotidiennes si supportées
setupDailyNotification(getLatestCouple);
