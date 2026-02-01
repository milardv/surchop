import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { PlusCircle } from 'lucide-react';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Category } from '@/models/models';

export default function CategorySelector({
    categories,
    value,
    onChange,
    onCreate,
}: {
    categories: Category[];
    value: Category | null;
    onChange: (c: Category) => void;
    onCreate: (name: string) => Promise<Category>;
}) {
    const [creatingName, setCreatingName] = useState('');

    const IconComponent = (id: string) => {
        const Comp = Icons[id as keyof typeof Icons] as React.ComponentType<any> | undefined;
        return Comp ? <Comp className="w-4 h-4 text-pink-600 mr-2" /> : null;
    };

    const handleCreate = async () => {
        if (!creatingName.trim()) return;
        const newCat = await onCreate(creatingName.trim());
        onChange(newCat);
        setCreatingName('');
    };

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Catégorie</label>

            <Select
                onValueChange={(id) => {
                    const cat = categories.find((c) => c.id === id);
                    if (cat) onChange(cat);
                }}
                value={value?.id}
            >
                <SelectTrigger className="w-full h-11 rounded-xl border-gray-300">
                    <SelectValue placeholder="Sélectionner une catégorie…" />
                </SelectTrigger>

                <SelectContent
                    // 👇 clé : position + z-index fort
                    position="popper"
                    className="z-[80] rounded-xl shadow-xl border border-gray-200 p-2 bg-white"
                >
                    {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="py-2">
                            <div className="flex items-center gap-3">
                                {IconComponent(c.lucideId)}
                                <span className="text-sm">{c.name}</span>
                            </div>
                        </SelectItem>
                    ))}

                    <div className="border-t my-2" />

                    <div className="p-2 space-y-2">
                        <div className="flex items-center gap-2">
                            <PlusCircle className="w-4 h-4 text-pink-600" />
                            <Input
                                className="h-9"
                                placeholder="Nouvelle catégorie…"
                                value={creatingName}
                                onChange={(e) => setCreatingName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            />
                        </div>

                        <button
                            onClick={handleCreate}
                            className="w-full bg-pink-600 text-white rounded-lg py-2 text-sm hover:bg-pink-700 transition"
                        >
                            Ajouter
                        </button>
                    </div>
                </SelectContent>
            </Select>
        </div>
    );
}
