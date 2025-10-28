import React from 'react';
import { motion } from 'framer-motion';

export default function SurchopeLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary bg-background">
            {/* 💘 Logo cœur animé */}
            <motion.img
                src="/icons/favicon.svg" // fichier dans public/icons/
                alt="Surchope"
                className="w-40 h-40 drop-shadow-[0_4px_10px_hsl(var(--primary)/0.4)]"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 1.2,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />

            {/* ✨ Texte animé */}
            <motion.p
                className="mt-10 text-xl sm:text-2xl font-semibold text-primary drop-shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            >
                Ça surchope fort… 💘
            </motion.p>
        </div>
    );
}
