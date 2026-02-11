# StageOps IoT Gateway

Service intermédiaire chargé de collecter et transmettre l’état des équipements techniques vers l’API StageOps.

## Objectif

Permettre la remontée automatique d’informations terrain :

- état matériel
- connectivité
- monitoring
- télémétrie

## Rôle dans l’architecture

Équipement → Gateway → API StageOps

Le gateway agit comme un pont entre les dispositifs techniques et le backend.

## Fonctionnalités

- Collecte d’état équipement
- Transmission vers API
- Normalisation des données
- Gestion de la connectivité intermittente

## Architecture

src/
  adapters/
  transport/
  config/
  client-api/

## Stack technique

- Node.js
- Communication HTTP / MQTT
- Architecture orientée événement

## Installation

git clone <repo>
cd StageOps-iot-gateway
npm install

Créer `.env`

API_URL=
DEVICE_ID=

Lancer :

npm start

## Cas d’usage

- monitoring rack son
- suivi projecteurs connectés
- supervision technique

## Statut

Prototype expérimental.
