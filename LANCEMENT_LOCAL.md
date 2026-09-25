# Lancer StageOps en local

Ce guide démarre la pile de développement StageOps : CouchDB, l'API Go, le
frontend React et, en option, l'application mobile Expo.

## Prérequis

- Git
- Docker avec Docker Compose
- Node.js 20 ou plus récent pour l'application mobile
- Les dépôts `StageOps-web-app`, `StageOps-backend` et
  `StageOps-mobile-app` clonés côte à côte dans le même dossier

Exemple d'arborescence :

```text
StageOps-EIP/
├── StageOps-backend/
├── StageOps-mobile-app/
└── StageOps-web-app/
```

## 1. Configurer l'environnement

Depuis `StageOps-web-app`, copier le fichier d'exemple :

```bash
cp .env.example .env
```

Sous PowerShell :

```powershell
Copy-Item .env.example .env
```

Modifier ensuite `.env` et remplacer au minimum `COUCHDB_PASSWORD` et
`JWT_SECRET`. Le fichier `.env` ne doit jamais être commité.

`STAGEOPS_NET_BRIDGE` est facultatif. Il sert uniquement lorsqu'un proxy HTTP
est nécessaire pendant la construction des images Docker.

## 2. Démarrer la pile web

Toujours depuis `StageOps-web-app` :

```bash
docker compose up --build
```

Pour lancer les services en arrière-plan :

```bash
docker compose up --build -d
```

Les services sont ensuite accessibles ici :

- Frontend : <http://localhost:3001>
- API : <http://localhost:8080>
- CouchDB : <http://localhost:5984>
- Administration CouchDB : <http://localhost:5984/_utils>

Le frontend ouvre directement le tableau de bord en mode démonstration, sans
compte. Les écrans d'inscription et de connexion restent disponibles depuis
<http://localhost:3001/register> et <http://localhost:3001/login>.

## 3. Démarrer l'application mobile

Dans un second terminal :

```bash
cd ../StageOps-mobile-app/apps/mobile
npm install
npm start
```

Expo affiche un QR code à ouvrir avec Expo Go. Pour imposer un autre port :

```bash
npm start -- --port 8082
```

Le téléphone et l'ordinateur doivent être sur le même réseau local.

## Commandes utiles

Afficher l'état des services :

```bash
docker compose ps
```

Afficher les journaux :

```bash
docker compose logs -f
```

Arrêter la pile sans supprimer les données :

```bash
docker compose stop
```

Arrêter et supprimer les conteneurs :

```bash
docker compose down
```

Pour supprimer également les données CouchDB locales, utiliser
`docker compose down -v`. Cette dernière commande efface la base locale.
