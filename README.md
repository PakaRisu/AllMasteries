# Mastery Forge — LoL Champion Mastery Tracker

Application web pour visualiser les masteries de champion League of Legends, triées et filtrées, avec la liste de champions dynamique via DDragon.

## Structure du projet

```
/
├── index.html          ← Frontend principal
├── vercel.json         ← Configuration Vercel
├── api/
│   └── mastery.js      ← Serverless function (proxy Riot API)
└── README.md
```

## Déploiement sur Vercel

### 1. Prérequis

- Un compte [Vercel](https://vercel.com)
- Une clé API Riot Games ([developer.riotgames.com](https://developer.riotgames.com))

> ⚠️ Les clés de développement Riot expirent toutes les 24h. Pour une production stable, faites une demande de clé "Personal" ou "Production".

### 2. Déploiement via CLI

```bash
npm i -g vercel
vercel
```

### 3. Variable d'environnement

Dans le dashboard Vercel → **Settings → Environment Variables** :

| Nom             | Valeur               |
|-----------------|----------------------|
| `RIOT_API_KEY`  | `RGAPI-xxxx-xxxx-…`  |

Ou via CLI :
```bash
vercel env add RIOT_API_KEY
```

### 4. Déploiement via GitHub

1. Push ce repo sur GitHub
2. Importez le projet sur [vercel.com/new](https://vercel.com/new)
3. Ajoutez la variable `RIOT_API_KEY` lors de la configuration
4. Deploy !

## Fonctionnalités

- **DDragon dynamique** : récupère automatiquement la dernière version (ex: 17.6) et la liste complète des champions
- **Tous les champions affichés** — y compris ceux jamais joués (0 pts, grisés)
- **Filtres** : Tous / Joués / Non joués / < 5 000 pts
- **Tri** : Points ↓↑, Nom A→Z / Z→A, Niveau mastery ↓
- **Badge de niveau** mastery (1–10) par champion
- **Barre de progression** relative au champion le plus masterisé
- **Responsive** mobile

## Développement local

Créez un fichier `.env.local` :
```
RIOT_API_KEY=RGAPI-votre-cle-ici
```

Puis lancez :
```bash
npx vercel dev
```
