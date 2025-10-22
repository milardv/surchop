import React from 'react';
import { motion } from 'framer-motion';

export default function SurchopeLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-pink-600">
            {/* Logo coeur animé */}
            <motion.img
                src="/icons/favicon.svg" // fichier dans public/icons/
                alt="Surchope"
                className="w-48 h-48 drop-shadow-lg"
                animate={{
                    scale: [1, 1.25, 1],
                    opacity: [0.8, 1, 0.8],
                }}
                transition={{
                    duration: 1.1,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />

            {/* Texte animé */}
            <motion.p
                className="mt-10 text-2xl font-semibold text-pink-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'reverse',
                }}
            >
                Ça surchope fort… 💘
            </motion.p>
        </div>
    );
}
