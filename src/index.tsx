import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import App from './App';
import './index.css';

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
    <React.StrictMode>
        <BrowserRouter basename="/">
            <App />
        </BrowserRouter>
    </React.StrictMode>,
);

const updateSW = registerSW({
    immediate: true, // met à jour dès que possible
    onOfflineReady() {
        console.log('L’application est prête à être utilisée hors ligne.');
    },
});
