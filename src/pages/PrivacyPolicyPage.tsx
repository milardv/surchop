import React from "react";

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-3xl mx-auto px-4 py-10 text-sm leading-relaxed text-gray-700">
            <h1 className="text-2xl font-semibold mb-4">Politique de confidentialité</h1>

            <p className="mb-4">
                Le site <strong>Surchope</strong> est un projet communautaire et ludique, sans but commercial,
                permettant aux utilisateurs de voter anonymement sur des couples fictifs ou réels.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">1. Données collectées</h2>
            <p>
                Le site collecte uniquement les données strictement nécessaires à son fonctionnement :
            </p>
            <ul className="list-disc ml-6 mb-4">
                <li>Adresse e-mail et photo de profil via Google (connexion Firebase Auth)</li>
                <li>Identifiants anonymes de vote (UID, couple_id, choix A/B)</li>
                <li>Éventuellement des images fournies par les utilisateurs (hébergées sur ImgBB)</li>
            </ul>

            <h2 className="text-lg font-semibold mt-6 mb-2">2. Finalité du traitement</h2>
            <p>
                Ces données sont utilisées uniquement pour permettre l’affichage des couples, la gestion
                des votes, et la modération des contenus. Aucune donnée n’est vendue, partagée ou exploitée
                à des fins commerciales.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">3. Base légale</h2>
            <p>
                Le traitement repose sur le <strong>consentement explicite</strong> des utilisateurs,
                notamment lors de la création d’un couple et du téléchargement d’images.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">4. Durée de conservation</h2>
            <p>
                Les données sont conservées tant que le compte utilisateur existe ou que le couple reste
                publié. Les utilisateurs peuvent demander la suppression de leurs données à tout moment.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">5. Droit d’accès et de suppression</h2>
            <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD),
                vous pouvez demander :
            </p>
            <ul className="list-disc ml-6 mb-4">
                <li>l’accès à vos données,</li>
                <li>leur rectification ou leur suppression,</li>
                <li>la suppression de vos votes ou de vos couples ajoutés.</li>
            </ul>
            <p>
                Pour exercer ces droits, vous pouvez contacter l’administrateur du site à l’adresse :
                <a
                    href="mailto:contact@surchope.app"
                    className="text-blue-600 underline ml-1"
                >
                    contact@surchope.app
                </a>
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">6. Hébergement et sous-traitants</h2>
            <p>
                Les données sont hébergées par :
            </p>
            <ul className="list-disc ml-6 mb-4">
                <li>
                    <strong>Firebase (Google Cloud)</strong> – authentification, base de données et stockage
                </li>
                <li>
                    <strong>ImgBB</strong> – hébergement des images uploadées
                </li>
            </ul>
            <p>
                Ces services peuvent transférer des données hors de l’Union européenne,
                conformément aux clauses contractuelles types de la Commission européenne.
            </p>

            <h2 className="text-lg font-semibold mt-6 mb-2">7. Contact</h2>
            <p>
                Pour toute question ou réclamation concernant vos données, contactez :
                <a href="mailto:contact@surchope.app" className="text-blue-600 underline ml-1">
                    contact@surchope.app
                </a>
            </p>

            <p className="mt-6 text-xs text-gray-500">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
            </p>
        </main>
    );
}
