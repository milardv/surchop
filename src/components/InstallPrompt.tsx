import React, { useEffect, useState } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // 🧠 Vérifie si l'app est déjà installée
        const checkInstalled = () => {
            const isStandalone =
                window.matchMedia('(display-mode: standalone)').matches ||
                (window.navigator as any).standalone === true;
            setIsInstalled(isStandalone);
        };

        checkInstalled();

        // 🔔 Si l’utilisateur installe depuis le navigateur
        window.addEventListener('appinstalled', () => {
            console.log('✅ App installée');
            setIsInstalled(true);
        });

        // 💡 Capture l’événement "avant installation"
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', () => setIsInstalled(true));
        };
    }, []);

    // ❌ Si déjà installée → on masque le bouton
    if (isInstalled || !deferredPrompt) return null;

    const handleInstall = async () => {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('Utilisateur a accepté l’installation ✅');
            setIsInstalled(true);
        } else {
            console.log('Utilisateur a refusé l’installation ❌');
        }
        setDeferredPrompt(null);
    };

    return (
        <button
            onClick={handleInstall}
            className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
        >
            Installer l’app
        </button>
    );
}
