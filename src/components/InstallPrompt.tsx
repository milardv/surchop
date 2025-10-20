import { useEffect, useState } from 'react';

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

        // Détection iOS
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

    if (!promptEvent) return null;

    return (
        <button
            onClick={() => {
                promptEvent.prompt();
                promptEvent.userChoice.then((choice: any) => {
                    if (choice.outcome === 'accepted') setPromptEvent(null);
                });
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 active:bg-pink-700 transition shadow-sm"
        >
            Installer
        </button>
    );
}
