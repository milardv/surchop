import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
    const [promptEvent, setPromptEvent] = useState<any>(null);
    const [installed, setInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isInStandalone, setIsInStandalone] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setPromptEvent(e);
        };
        const installedHandler = () => setInstalled(true);

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        const standalone = (window.navigator as any).standalone === true;
        setIsIOS(ios);
        setIsInStandalone(standalone);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    if (installed || isInStandalone) return null;

    const handleInstall = () => {
        if (promptEvent) {
            promptEvent.prompt();
            promptEvent.userChoice.then((choice: any) => {
                if (choice.outcome === 'accepted') setPromptEvent(null);
            });
        } else if (isIOS) {
            alert(
                "🍎 Sur iPhone/iPad :\n1️⃣ Appuie sur le bouton 'Partager' (carré avec la flèche)\n2️⃣ Sélectionne 'Sur l’écran d’accueil' 📲",
            );
        }
    };

    return (
        <div
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-primary cursor-pointer hover:bg-muted transition"
        >
            <Download size={16} className="text-primary" />
            <span className="font-medium">Installer</span>
        </div>
    );
}
