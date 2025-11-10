import { useState, useRef, useEffect } from 'react';

import { fetchWikipediaSuggestions } from '@/utils/fetchWikipediaSuggestions';
import ImageUploader from '@/components/ImageUploader';

export function PersonInput({
    label,
    person,
    setPerson,
    err,
    handleBlur,
}: {
    label: string;
    person: { display_name: string; image_url: string; file: File | null };
    setPerson: (p: any) => void;
    err?: string;
    handleBlur: (key: 'A' | 'B') => void;
}) {
    const [suggestions, setSuggestions] = useState<{ title: string; thumbnail?: string }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null); // 👈 ref sur le bloc entier

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPerson({ ...person, display_name: value });

        if (value.length > 1) {
            const results = await fetchWikipediaSuggestions(value);
            setSuggestions(results);
        } else {
            setSuggestions([]);
        }
    };

    // 👇 Ferme la liste si clic en dehors
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setSuggestions([]);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <h3 className="font-medium mb-2">{label}</h3>

            <input
                type="text"
                placeholder="Nom"
                value={person.display_name}
                onChange={handleChange}
                onBlur={() => handleBlur(label === 'Personne A' ? 'A' : 'B')}
                className={`w-full border rounded p-2 mb-2 ${
                    err ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
            />

            {suggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 rounded-md shadow-md w-full mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <li
                            key={i}
                            onClick={() => {
                                setPerson({
                                    ...person,
                                    display_name: s.title,
                                    image_url: s.thumbnail || '',
                                });
                                setSuggestions([]);
                            }}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                        >
                            {s.thumbnail ? (
                                <img
                                    src={s.thumbnail}
                                    alt={s.title}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <span className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-xs text-gray-600">
                                    {s.title[0]}
                                </span>
                            )}
                            <span className="text-sm">{s.title}</span>
                        </li>
                    ))}
                </ul>
            )}

            {err && <div className="text-xs text-red-600 mb-2">{err}</div>}

            <ImageUploader
                label={label}
                imageUrl={person.image_url}
                file={person.file}
                onFileChange={(file) => setPerson({ ...person, file })}
                onUrlChange={(url) => setPerson({ ...person, image_url: url })}
            />
        </div>
    );
}
