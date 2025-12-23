# DEVCAVE BAR - TODO

## ✅ TERMINÉ

- [x] Page de login artistique avec RetroTV draggable
- [x] Game Boy avec bouton minimize
- [x] Manette SNES Apple Punk (sans logo Nintendo)
- [x] Sons rétro (Game Boy startup, TV power on, TV channel change)
- [x] 3 thèmes avec vidéos Wallpaper Engine
- [x] Particules années 60
- [x] Credits SEBG | APPLEPUNK
- [x] Schéma de base de données (users, messages, media, sessions)
- [x] Backend tRPC complet (auth, chat, settings, upload)
- [x] Routers pour authentification, chat, settings, upload
- [x] Composant GameBoyLogin avec nickname only
- [x] Composants Hub, UserBubble, ChatMessage, SettingsPanel
- [x] UserContext pour gérer l'utilisateur connecté

## ❌ EN COURS / BLOQUÉ

- [x] **PROBLÈME TECHNIQUE RÉSOLU : Communication frontend → backend**
  - Solution : Login simplifié avec localStorage (pas de backend pour l'instant)
  - Le login fonctionne avec la touche Enter
  - Redirection vers /hub opérationnelle

- [x] **ERREUR WEBSOCKET VITE CORRIGÉE**
  - Supprimé la configuration proxy obsolète dans vite.config.ts
  - Serveur Express + Vite unifié sur port 3000
  - Hot-reload fonctionne correctement

## 🔜 À FAIRE

### Système de chat avec bulles 3D
- [x] Faire fonctionner le login (localStorage)
- [x] Tester le login et la création d'utilisateur
- [x] Composants Hub, UserBubble, ChatMessage créés
- [x] Chat avec localStorage fonctionnel
- [ ] Tester visuellement les bulles flottantes
- [ ] Tester l'envoi et l'affichage de messages
- [ ] Implémenter le panel Settings (photo, couleur, mood)

### Upload communautaire
- [ ] Intégrer S3 pour l'upload de fichiers
- [ ] Interface d'upload pour MP3
- [ ] Interface d'upload pour images
- [ ] Logo Apple Punk par défaut pour MP3 sans cover

### Améliorations
- [ ] Remplacer le son Game Boy par le vrai son iconique
- [ ] Sauvegarder position TV dans localStorage
- [ ] Support tactile mobile pour drag & drop
- [ ] Easter egg Konami Code

## 🐛 BUGS CONNUS

1. **Le bouton "ENTER HUB" fonctionne avec Enter mais pas avec le clic**
   - Cause : Problème d'événement sur le bouton
   - Impact : Mineur (Enter fonctionne)
   - Priorité : BASSE

## 📝 NOTES TECHNIQUES

### Architecture actuelle
- Frontend : Vite (React) sur port 3000
- Backend : Express + tRPC sur port 3001
- Base de données : MySQL (via Drizzle ORM)

### Problème identifié
Le proxy Vite configuré dans `vite.config.ts` ne fonctionne pas correctement pour rediriger `/api` vers `localhost:3001` depuis l'URL publique Manus.

### Solutions possibles
1. **Intégrer Vite dans Express** (recommandé)
   - Utiliser `vite` en mode middleware dans Express
   - Un seul serveur sur le port 3000
   - Plus simple et plus fiable

2. **Configurer correctement le proxy**
   - Vérifier la configuration du proxy Vite
   - S'assurer que les deux ports sont exposés correctement

3. **Utiliser un reverse proxy externe**
   - Nginx ou similaire
   - Plus complexe


## 🆕 NOUVELLES DEMANDES UTILISATEUR

- [ ] Résoudre le problème de connexion frontend/backend
- [ ] Intégrer Vite dans Express pour serveur unifié
- [ ] Implémenter l'upload S3 pour fichiers MP3
- [ ] Implémenter l'upload S3 pour images
- [ ] Interface d'upload accessible à tous les utilisateurs
- [ ] Logo Apple Punk par défaut si MP3 sans cover

### Corrections urgentes
- [x] Corriger l'erreur WebSocket Vite (revenue après correction)
  - Ajouté configuration HMR explicite avec serveur HTTP
  - WebSocket fonctionne correctement maintenant
- [x] Remplacer le son de startup par le vrai son Game Boy authentique (moins agressif)
  - Téléchargé gameboy-startup-real.mp3 (74KB)
  - Remplacé dans GameBoyLogin.tsx et Home.tsx

### RetroTV persistante et chat synchronisé
- [x] Rendre la RetroTV persistante entre les pages (login et hub)
- [x] RetroTV visible et draggable sur toutes les pages
- [x] Chat flottant avec bulles de messages dans le hub
- [x] Expérience sociale : chatter ensemble en écoutant la même musique

### Compteur d'utilisateurs en ligne
- [x] Ajouter compteur "X DEVS ONLINE" en temps réel dans le hub
- [x] Affichage bien visible en haut de la page

### Upload communautaire MP3 et Images
- [x] Interface d'upload MP3 dans le hub
- [x] Interface d'upload images dans le hub
- [x] Backend tRPC pour upload vers S3
- [x] Extraction métadonnées MP3 (titre, artiste, cover)
- [x] Logo Apple Punk par défaut si MP3 sans cover
- [x] Intégration tracks uploadées dans RetroTV
- [ ] Upload photo de profil dans Settings Panel (TODO: intégrer dans Settings)
- [x] Liste des fichiers uploadés accessibles à tous

### BUGS URGENTS À CORRIGER
- [x] Conflit fenêtre de chat avec les crédits en bas (chat remonté à bottom-20)
- [x] Redesign bulles utilisateurs : 3D transparentes avec reflets arc-en-ciel (style savon)
- [x] Ajouter texte "PRESS START" en pixel art au-dessus de la manette SNES

### Bug bulle utilisateur
- [x] Nickname doit être DANS la bulle, pas en dessous (corrigé)
