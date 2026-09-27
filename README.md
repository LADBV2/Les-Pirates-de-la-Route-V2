# Les Pirates de la Route — site pour GitHub Pages

Cette archive contient le site complet : HTML, styles, animations, images et logos. Le dossier `server/` contient le relais qui permet au formulaire de transmettre les messages à un salon Discord.

## 1. Mettre le site sur GitHub

1. Décompresse l’archive.
2. Place son contenu dans ton dépôt GitHub. `index.html` doit se trouver à la racine du dépôt.
3. Dans **Settings → Pages**, choisis **Deploy from a branch**, puis la branche `main` et le dossier **/ (root)**. Enregistre.
4. Ouvre l’adresse indiquée par GitHub Pages lorsque la publication est terminée.

Le site est statique : aucune compilation n’est nécessaire. Tous les chemins des images et des styles sont relatifs pour fonctionner dans un sous-dossier GitHub Pages.

## 2. Activer l’envoi du formulaire dans un salon Discord

État actuel : le bouton « Envoyer » est installé, mais l’envoi n’est pas activé. `config.js` ne contient pas encore l’adresse d’un relais déployé, dans cette version exportée. Si ton relais Cloudflare est déjà configuré, conserve son adresse et renseigne-la dans `config.js`. Les essais du relais ont été réalisés avec des réponses simulées, sans envoyer de message réel.

GitHub Pages sert les fichiers du site ; le relais `server/worker.mjs` doit être déployé séparément sur Cloudflare Workers.

### A. Créer le webhook du salon

Dans Discord, ouvre les paramètres du salon textuel de destination, puis **Intégrations → Webhooks**. Crée un webhook et copie son URL. Il faut disposer des droits de gestion des webhooks.

L’URL du webhook est un secret : ne la mets ni dans `config.js`, ni dans GitHub, ni dans un fichier public.

### B. Publier le relais

Avec Node.js installé, ouvre un terminal dans le dossier `server/` :

```sh
npx wrangler login
npx wrangler deploy
npx wrangler secret put DISCORD_WEBHOOK_URL
```

La dernière commande demande la valeur du secret : colle l’URL du webhook à ce moment-là.

Dans `server/wrangler.jsonc`, ajuste `ALLOWED_ORIGINS` à l’adresse d’origine de ton site : par exemple `https://ladb250726.github.io`, sans le chemin du dépôt. Plusieurs origines peuvent être séparées par des virgules. Publie de nouveau après toute modification de ce fichier.

### C. Relier le formulaire

Dans `config.js`, remplace la chaîne vide par l’adresse **publique du relais**, terminée par `/contact` :

```js
window.PIRATES_CONFIG = {
  contactEndpoint: "https://pirates-contact.VOTRE-COMPTE.workers.dev/contact"
};
```

Cette adresse n’est pas le webhook Discord. Enregistre le fichier dans GitHub, attends la publication, puis envoie un message d’essai depuis le site. Le message de réussite ne s’affiche que si le relais reçoit une confirmation de Discord.

Les champs sont vérifiés côté serveur ; les mentions automatiques sont désactivées. Le formulaire comporte un champ piège pour les robots. Cela ne remplace pas une protection complète contre le spam : en cas d’abus, ajoute une limitation des requêtes côté hébergeur.

## 3. Fichiers

- `index.html` : contenu, navigation et formulaire.
- `style.css` : structure, responsive et animations.
- `palette.css` : palette charbon, bordeaux et cuivre.
- `contact.css` : cartes et formulaire de contact.
- `script.js` : navigation, animations, envoi du formulaire.
- `config.js` : adresse publique du relais à renseigner.
- `*.webp`, `brands/` : images et logos utilisés.
- `server/worker.mjs` : relais serveur pour Discord.
- `server/wrangler.jsonc` : configuration Cloudflare Workers.
- `.nojekyll` : publication sans traitement Jekyll.

Les boutons Discord utilisent https://discord.gg/ZQGTz2RF72. Les liens de l’entreprise sont intégrés : https://trucksbook.eu/company/227882 et https://truckersmp.com/vtc/91658.

Polices : Inter et Barlow Condensed, chargées depuis Google Fonts, avec des polices de secours. Les logos restent la propriété de leurs marques. Le logo Discord provient de la page officielle de marque ; les icônes TrucksBook et TruckersMP proviennent des ressources du site de référence fourni.

Documentation :
- https://docs.discord.com/developers/resources/webhook
- https://developers.cloudflare.com/workers/configuration/secrets/
