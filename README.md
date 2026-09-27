# Les Pirates de la Route — site GitHub Pages

Le site est prêt à être publié sur GitHub Pages.

## Fichiers
- `index.html` : page principale
- `styles.css` : design et animations
- `script.js` : navigation + formulaire
- `config.js` : URL du service d’envoi
- `assets/` : images du site
- `worker/` : Cloudflare Worker qui transmet le formulaire à Discord

## Activer le bouton « Envoyer »
1. Dans Discord, crée un webhook dans le salon où tu souhaites recevoir les messages.
2. Dans Cloudflare Workers, déploie le fichier `worker/worker.js`.
3. Dans les paramètres du Worker, ajoute un **Secret** nommé `DISCORD_WEBHOOK_URL` contenant l’URL du webhook Discord.
4. Copie l’URL publique de ton Worker, par ex. `https://pirates-contact.ton-compte.workers.dev`.
5. Ouvre `config.js` et remplace la chaîne vide de `contactEndpoint` par cette URL.
6. Publie les fichiers du dossier sur GitHub Pages.

Ne mets jamais l’URL du webhook Discord directement dans `index.html`, `script.js` ou `config.js`.

Discord : https://discord.gg/ZQGTz2RF72
