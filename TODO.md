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

- [ ] **PROBLÈME TECHNIQUE : Communication frontend → backend**
  - Le frontend (Vite port 3000) ne peut pas communiquer avec le backend (Express port 3001)
  - Problème de proxy ou de CORS dans l'environnement Manus
  - **SOLUTION POSSIBLE** : Intégrer Vite dans Express (mode middleware) pour avoir un seul serveur

## 🔜 À FAIRE

### Système de chat avec bulles 3D
- [ ] Faire fonctionner le login (résoudre le problème frontend/backend)
- [ ] Tester le login et la création d'utilisateur
- [ ] Tester l'affichage des bulles utilisateurs flottantes
- [ ] Tester l'envoi de messages
- [ ] Tester l'affichage des messages flottants
- [ ] Tester le panel Settings (photo, couleur, mood)

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

1. **Le bouton "ENTER HUB" ne fonctionne pas**
   - Cause : Le client tRPC ne peut pas atteindre le serveur backend
   - Impact : Impossible de se connecter
   - Priorité : CRITIQUE

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
