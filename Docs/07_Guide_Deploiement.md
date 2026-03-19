# Guide de Déploiement — StageOps

**Projet :** StageOps — Plateforme de gestion technique multi-théâtres  
**Version :** 1.0  
**Date :** Mars 2026  
**Public :** Administrateurs système, DevOps

---

## 1. Vue d'ensemble

### 1.1 Architecture de déploiement

StageOps est une application web full-stack composée de :
- **Frontend** : React 18 + Vite (SPA statique)
- **Backend** : Go Fiber (API REST)
- **Base de données** : CouchDB (NoSQL, synchronisation offline-first)

**Modes de déploiement supportés :**
1. **Docker Compose** (recommandé pour staging/production)
2. **Déploiement manuel** (développement local)
3. **Kubernetes** (production haute disponibilité, futur)

---

### 1.2 Prérequis

**Matériel serveur :**
- CPU : 2 vCPU minimum (4 vCPU recommandé)
- RAM : 2 GB minimum (4 GB recommandé)
- Stockage : 20 GB minimum SSD
- Réseau : Connexion internet stable (bande passante 10 Mbps minimum)

**Logiciels requis :**
- Docker 24.0+ et Docker Compose 2.20+
- Git 2.30+
- Certificat SSL (Let's Encrypt ou autre)

**Optionnel (déploiement manuel) :**
- Node.js 20 LTS + npm 10
- Go 1.22+
- CouchDB 3.3+

---

## 2. Déploiement Docker Compose (Recommandé)

### 2.1 Clone du repository

```bash
# Clone du repository frontend
git clone https://github.com/StageOps-EIP/StageOps-web-app.git
cd StageOps-web-app

# Clone du repository backend (à côté du frontend)
cd ..
git clone https://github.com/StageOps-EIP/StageOps-backend.git
```

**Structure finale attendue :**
```
/home/deploy/
├── StageOps-web-app/         # Frontend React
│   ├── StageOps_Web/
│   ├── docker-compose.yml    # ← Fichier de déploiement
│   └── Docs_Projet/
└── StageOps-backend/          # Backend Go
    ├── main.go
    ├── Dockerfile
    └── ...
```

---

### 2.2 Configuration des variables d'environnement

#### 2.2.1 Frontend (.env)

Créer le fichier `StageOps_Web/.env` :

```env
# API Backend URL
VITE_API_URL=https://api.stageops.votredomaine.fr

# Environment
VITE_ENV=production
```

#### 2.2.2 Backend (.env)

Créer le fichier `StageOps-backend/.env` :

```env
# Server
PORT=5000
ENV=production

# JWT Secret (générer avec: openssl rand -base64 32)
JWT_SECRET=votre_secret_jwt_super_securise_32_caracteres_minimum

# CouchDB
COUCHDB_URL=http://couchdb:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=votre_mot_de_passe_couchdb_securise

# CORS (domaines frontend autorisés)
CORS_ORIGINS=https://stageops.votredomaine.fr,https://www.stageops.votredomaine.fr
```

**⚠️ Sécurité :**
- Ne jamais committer les fichiers `.env` (déjà dans `.gitignore`)
- Générer des secrets forts (32+ caractères aléatoires)
- Changer tous les mots de passe par défaut

---

### 2.3 Configuration Docker Compose

Le fichier `docker-compose.yml` (racine `StageOps-web-app/`) :

```yaml
version: '3.8'

services:
  # Frontend React (build + serve avec Nginx)
  frontend:
    build:
      context: ./StageOps_Web
      dockerfile: Dockerfile
    ports:
      - "8080:80"
    environment:
      - VITE_API_URL=${VITE_API_URL}
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - stageops-network

  # Backend Go Fiber
  backend:
    build:
      context: ../StageOps-backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - PORT=5000
      - JWT_SECRET=${JWT_SECRET}
      - COUCHDB_URL=http://couchdb:5984
      - COUCHDB_USER=${COUCHDB_USER}
      - COUCHDB_PASSWORD=${COUCHDB_PASSWORD}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - ENV=production
    depends_on:
      - couchdb
    restart: unless-stopped
    networks:
      - stageops-network

  # CouchDB (base de données)
  couchdb:
    image: couchdb:3.3
    ports:
      - "5984:5984"
    environment:
      - COUCHDB_USER=${COUCHDB_USER}
      - COUCHDB_PASSWORD=${COUCHDB_PASSWORD}
    volumes:
      - couchdb-data:/opt/couchdb/data
    restart: unless-stopped
    networks:
      - stageops-network

volumes:
  couchdb-data:

networks:
  stageops-network:
    driver: bridge
```

---

### 2.4 Build et lancement

```bash
# Build des images Docker (peut prendre 5-10 minutes)
docker compose build

# Lancement des services
docker compose up -d

# Vérifier les logs
docker compose logs -f

# Vérifier que les conteneurs tournent
docker compose ps
```

**Résultat attendu :**
```
NAME                 STATUS         PORTS
frontend             Up 2 minutes   0.0.0.0:8080->80/tcp
backend              Up 2 minutes   0.0.0.0:5000->5000/tcp
couchdb              Up 2 minutes   0.0.0.0:5984->5984/tcp
```

---

### 2.5 Vérification du déploiement

#### 2.5.1 Healthchecks

```bash
# Frontend (Nginx)
curl http://localhost:8080
# → Devrait retourner le HTML de l'app React

# Backend (Go Fiber)
curl http://localhost:5000/api/health
# → {"status": "ok", "timestamp": "2026-03-19T10:30:00Z"}

# CouchDB
curl http://admin:password@localhost:5984/
# → {"couchdb": "Welcome", "version": "3.3.0", ...}
```

#### 2.5.2 Tests fonctionnels

1. Ouvrir navigateur : `http://localhost:8080`
2. Page de login s'affiche → ✅
3. Se connecter avec compte admin créé (cf. section 2.6)
4. Dashboard s'affiche → ✅
5. Créer un événement test → ✅
6. Vérifier dans CouchDB : `curl http://admin:password@localhost:5984/stageops/_all_docs`

---

### 2.6 Initialisation de la base de données

#### 2.6.1 Créer la base CouchDB

```bash
# Entrer dans le conteneur backend
docker compose exec backend sh

# Créer la base 'stageops' (si pas auto-créée)
curl -X PUT http://admin:password@couchdb:5984/stageops

# Créer les vues MapReduce (optionnel, auto-créées par l'app)
```

#### 2.6.2 Créer le premier utilisateur admin

**Option A : Via API backend**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@votretheâtre.fr",
    "password": "MotDePasseSecurise123",
    "name": "Admin Principal",
    "role": "rg"
  }'
```

**Option B : Via script Go (backend)**
```bash
# Créer un script seed.go dans StageOps-backend/
# Lancer : go run seed.go
```

---

### 2.7 Configuration Nginx (reverse proxy production)

**Installer Nginx sur le serveur :**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**Configuration Nginx (`/etc/nginx/sites-available/stageops`) :**

```nginx
# Redirect HTTP → HTTPS
server {
    listen 80;
    server_name stageops.votredomaine.fr;
    return 301 https://$host$request_uri;
}

# Frontend (HTTPS)
server {
    listen 443 ssl http2;
    server_name stageops.votredomaine.fr;

    ssl_certificate /etc/letsencrypt/live/stageops.votredomaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/stageops.votredomaine.fr/privkey.pem;

    # Headers sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy vers frontend (port 8080)
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API (HTTPS)
server {
    listen 443 ssl http2;
    server_name api.stageops.votredomaine.fr;

    ssl_certificate /etc/letsencrypt/live/api.stageops.votredomaine.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.stageops.votredomaine.fr/privkey.pem;

    # Headers sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy vers backend (port 5000)
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers (si backend ne les gère pas)
        add_header Access-Control-Allow-Origin "https://stageops.votredomaine.fr" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
    }
}
```

**Activer la configuration :**
```bash
sudo ln -s /etc/nginx/sites-available/stageops /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Obtenir les certificats SSL (Let's Encrypt) :**
```bash
sudo certbot --nginx -d stageops.votredomaine.fr -d api.stageops.votredomaine.fr
```

---

## 3. Déploiement manuel (Développement)

### 3.1 Frontend

```bash
cd StageOps_Web/

# Installation dépendances
npm install

# Build production
npm run build

# Servir avec serveur HTTP local (optionnel)
npx serve -s dist -l 8080
```

**Ou avec Nginx :**
```bash
sudo cp -r dist/* /var/www/stageops/
# Configurer Nginx pour servir /var/www/stageops/
```

---

### 3.2 Backend

```bash
cd StageOps-backend/

# Installation dépendances Go
go mod download

# Build binaire
go build -o stageops-backend main.go

# Lancer le backend
./stageops-backend
```

**Ou avec systemd (service Linux) :**

Créer `/etc/systemd/system/stageops-backend.service` :
```ini
[Unit]
Description=StageOps Backend API
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/StageOps-backend
ExecStart=/home/deploy/StageOps-backend/stageops-backend
Restart=on-failure
Environment="PORT=5000"
Environment="JWT_SECRET=votre_secret"
Environment="COUCHDB_URL=http://localhost:5984"
Environment="COUCHDB_USER=admin"
Environment="COUCHDB_PASSWORD=password"

[Install]
WantedBy=multi-user.target
```

**Lancer le service :**
```bash
sudo systemctl daemon-reload
sudo systemctl enable stageops-backend
sudo systemctl start stageops-backend
sudo systemctl status stageops-backend
```

---

### 3.3 CouchDB

**Installation (Ubuntu/Debian) :**
```bash
sudo apt update
sudo apt install couchdb

# Configuration interactive lors de l'installation :
# - Mode standalone (développement) ou cluster (production)
# - Bind address : 0.0.0.0 (accessible réseau) ou 127.0.0.1 (local uniquement)
# - Mot de passe admin : définir un mot de passe fort
```

**Vérifier installation :**
```bash
curl http://admin:password@localhost:5984/
```

**Configuration fichier (`/opt/couchdb/etc/local.ini`) :**
```ini
[couchdb]
single_node=true

[chttpd]
port = 5984
bind_address = 0.0.0.0

[admins]
admin = -pbkdf2-hashed-password-here
```

---

## 4. Monitoring et logs

### 4.1 Logs Docker Compose

```bash
# Tous les services
docker compose logs -f

# Service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f couchdb

# Filtrer par timestamp
docker compose logs --since 1h

# Sauvegarder les logs dans un fichier
docker compose logs > logs_$(date +%Y%m%d_%H%M%S).txt
```

---

### 4.2 Monitoring avec Prometheus + Grafana (optionnel)

**Ajouter dans `docker-compose.yml` :**
```yaml
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    restart: unless-stopped
    networks:
      - stageops-network

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    volumes:
      - grafana-data:/var/lib/grafana
    restart: unless-stopped
    networks:
      - stageops-network

volumes:
  prometheus-data:
  grafana-data:
```

**Configuration Prometheus (`prometheus.yml`) :**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:5000']

  - job_name: 'couchdb'
    static_configs:
      - targets: ['couchdb:5984']
```

**Accès :**
- Prometheus : `http://localhost:9090`
- Grafana : `http://localhost:3000` (admin/admin par défaut)

---

### 4.3 Alertes (Uptime monitoring)

**Services recommandés :**
- UptimeRobot (gratuit jusqu'à 50 monitors)
- Pingdom
- Datadog
- New Relic

**Endpoints à monitorer :**
- Frontend : `https://stageops.votredomaine.fr` (HTTP 200)
- Backend : `https://api.stageops.votredomaine.fr/api/health` (HTTP 200)
- CouchDB : `https://api.stageops.votredomaine.fr:5984/` (HTTP 200)

---

## 5. Sauvegarde et restauration

### 5.1 Backup CouchDB

**Script backup automatique (`backup.sh`) :**
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/deploy/backups"
COUCHDB_USER="admin"
COUCHDB_PASSWORD="password"
COUCHDB_URL="http://localhost:5984"

# Créer le répertoire de backup
mkdir -p $BACKUP_DIR

# Backup de la base 'stageops'
curl -X GET "$COUCHDB_URL/stageops/_all_docs?include_docs=true" \
  -u "$COUCHDB_USER:$COUCHDB_PASSWORD" \
  | gzip > "$BACKUP_DIR/stageops_backup_$DATE.json.gz"

echo "Backup créé : $BACKUP_DIR/stageops_backup_$DATE.json.gz"

# Supprimer les backups de plus de 30 jours
find $BACKUP_DIR -type f -name "*.json.gz" -mtime +30 -delete
```

**Cron job (backup quotidien à 2h du matin) :**
```bash
crontab -e
# Ajouter :
0 2 * * * /home/deploy/backup.sh >> /var/log/stageops-backup.log 2>&1
```

---

### 5.2 Restauration CouchDB

```bash
# Décompresser le backup
gunzip stageops_backup_20260319_020000.json.gz

# Restaurer les documents
curl -X POST http://admin:password@localhost:5984/stageops/_bulk_docs \
  -H "Content-Type: application/json" \
  -d @stageops_backup_20260319_020000.json
```

---

### 5.3 Backup volumes Docker

```bash
# Backup du volume CouchDB
docker run --rm \
  -v stageops_couchdb-data:/data \
  -v /home/deploy/backups:/backup \
  ubuntu tar czf /backup/couchdb_volume_$(date +%Y%m%d).tar.gz /data
```

**Restauration :**
```bash
# Restaurer le volume
docker run --rm \
  -v stageops_couchdb-data:/data \
  -v /home/deploy/backups:/backup \
  ubuntu tar xzf /backup/couchdb_volume_20260319.tar.gz -C /
```

---

## 6. Mises à jour

### 6.1 Mise à jour de l'application

```bash
# Pull des dernières modifications Git
cd StageOps-web-app/
git pull origin main

cd ../StageOps-backend/
git pull origin main

# Rebuild et relancer Docker Compose
cd ../StageOps-web-app/
docker compose down
docker compose build
docker compose up -d

# Vérifier les logs
docker compose logs -f
```

---

### 6.2 Rollback (retour version précédente)

```bash
# Identifier le commit précédent
git log --oneline -5

# Revenir au commit précédent
git checkout <commit-hash>

# Rebuild
docker compose down
docker compose build
docker compose up -d
```

---

### 6.3 Migrations de base de données

**Si changement de schéma CouchDB (futur) :**
1. Créer un script de migration (`migrations/001_add_field.js`)
2. Lancer via script Node.js :
   ```bash
   node migrations/001_add_field.js
   ```
3. Vérifier l'intégrité des données :
   ```bash
   curl http://admin:password@localhost:5984/stageops/_all_docs?limit=10
   ```

---

## 7. Sécurité en production

### 7.1 Checklist pré-déploiement

- [ ] Tous les secrets changés (JWT_SECRET, COUCHDB_PASSWORD, etc.)
- [ ] HTTPS activé (certificat SSL valide)
- [ ] CORS configuré (uniquement domaines autorisés)
- [ ] Rate limiting activé (backend)
- [ ] Firewall configuré (ports 80, 443 ouverts, 5984 fermé)
- [ ] CouchDB non accessible publiquement (bind 127.0.0.1 ou firewall)
- [ ] Logs centralisés (syslog, Datadog, etc.)
- [ ] Backups automatiques configurés (cron)
- [ ] Monitoring actif (UptimeRobot, Prometheus)
- [ ] Scan vulnérabilités dépendances (`govulncheck`, Dependabot)

---

### 7.2 Configuration firewall (UFW)

```bash
# Installer UFW
sudo apt install ufw

# Règles par défaut
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH (important avant d'activer UFW !)
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Bloquer CouchDB en public (accessible uniquement localhost)
sudo ufw deny 5984/tcp

# Activer le firewall
sudo ufw enable
sudo ufw status
```

---

### 7.3 Fail2Ban (protection brute-force)

```bash
# Installer Fail2Ban
sudo apt install fail2ban

# Configuration jail StageOps (/etc/fail2ban/jail.local)
[stageops-backend]
enabled = true
port = 443
filter = stageops-backend
logpath = /var/log/nginx/access.log
maxretry = 5
bantime = 3600

# Créer le filtre (/etc/fail2ban/filter.d/stageops-backend.conf)
[Definition]
failregex = ^<HOST> .* "POST /api/auth/login HTTP.*" 401
ignoreregex =

# Redémarrer Fail2Ban
sudo systemctl restart fail2ban
```

---

## 8. Troubleshooting

### 8.1 Problèmes courants

#### Frontend ne se charge pas (404)

**Causes possibles :**
- Nginx mal configuré (root path incorrect)
- Build Vite non exécuté (dossier `dist/` manquant)
- Permissions fichiers incorrectes

**Solution :**
```bash
# Vérifier build
cd StageOps_Web/
ls -la dist/  # Doit contenir index.html, assets/, etc.

# Vérifier permissions
sudo chown -R www-data:www-data /var/www/stageops/

# Vérifier config Nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

---

#### Backend retourne 500 (Internal Server Error)

**Causes possibles :**
- CouchDB non accessible (URL incorrecte, mot de passe invalide)
- JWT_SECRET non défini (crash au démarrage)
- Erreur Go (panic non géré)

**Solution :**
```bash
# Vérifier logs backend
docker compose logs -f backend

# Tester connexion CouchDB depuis backend
docker compose exec backend sh
curl http://admin:password@couchdb:5984/
```

---

#### Synchronisation CouchDB ne fonctionne pas

**Causes possibles :**
- CORS CouchDB mal configuré
- URL backend incorrecte dans frontend (`.env`)

**Solution :**
```bash
# Activer CORS CouchDB
curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/httpd/enable_cors \
  -d '"true"'

curl -X PUT http://admin:password@localhost:5984/_node/_local/_config/cors/origins \
  -d '"*"'

# Vérifier config frontend
cat StageOps_Web/.env  # VITE_API_URL correct ?
```

---

### 8.2 Logs de débogage

**Activer logs verbeux backend :**
```bash
# Dans .env backend
LOG_LEVEL=debug

# Redémarrer
docker compose restart backend
```

**Activer logs CouchDB :**
```bash
# Dans /opt/couchdb/etc/local.ini
[log]
level = debug

# Redémarrer
docker compose restart couchdb
```

---

## 9. Annexes

### Annexe A : Ports utilisés

| Service | Port | Protocole | Accès |
|---------|------|-----------|-------|
| Frontend (Nginx) | 8080 | HTTP | Public (via reverse proxy Nginx : 80/443) |
| Backend (Go Fiber) | 5000 | HTTP | Public (via reverse proxy Nginx : 443) |
| CouchDB | 5984 | HTTP | **Local uniquement** (localhost, Docker network) |
| Prometheus | 9090 | HTTP | Local (monitoring) |
| Grafana | 3000 | HTTP | Local (monitoring) |

### Annexe B : Ressources

**Documentation officielle :**
- Docker : https://docs.docker.com/
- CouchDB : https://docs.couchdb.org/
- Nginx : https://nginx.org/en/docs/
- Let's Encrypt : https://letsencrypt.org/docs/

**Tutoriels utiles :**
- Docker Compose best practices : https://docs.docker.com/compose/production/
- CouchDB backup/restore : https://docs.couchdb.org/en/stable/maintenance/backups.html
- Nginx SSL hardening : https://ssl-config.mozilla.org/

---

**Fin du Guide de Déploiement**  
**Version 1.0 — Mars 2026**
