import { useEffect, useState } from 'react';

export default function InstallPrompt() {
    const [promptEvent, setPromptEvent] = useState<any>(null);
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setPromptEvent(e);
        };
        const installedHandler = () => setInstalled(true);

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    if (!promptEvent || installed) return null;

    return (
        <button
            onClick={() => {
                promptEvent.prompt();
                promptEvent.userChoice.then((choice: any) => {
                    if (choice.outcome === 'accepted') {
                        setPromptEvent(null);
                    }
                });
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 active:bg-pink-700 transition shadow-sm"
        >
            💘 Installer
        </button>
    );
}
