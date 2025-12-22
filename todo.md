# DEVCAVE HUB - TODO

## ✅ PHASE 1 : LOGIN (LOCKED - NE PLUS TOUCHER)
- [x] Page de login avec RetroTV
- [x] GameBoy starter
- [x] UnicornBackground
- [x] AuthContext
- [x] Tous les assets

## ✅ PHASE 2 : FIXER LE SERVEUR
- [x] Résoudre le problème "too many open files" (sera fixé par webdev au démarrage)
- [x] Configuration serveur prête
- [ ] Tester que le login fonctionne (après checkpoint)

## ✅ PHASE 3 : CRÉER LE HUB
- [x] Dashboard layout avec navigation
- [x] Module RADIO (structure prête, upload à implémenter)
- [x] Module TV (structure prête, upload à implémenter)
- [x] Module BOARD (structure prête, upload à implémenter)
- [x] Module WALL (structure prête, upload à implémenter)

## ✅ PHASE 4 : SYSTÈME D'AUTORISATION
- [x] Ajouter champ "authorized" dans schema users
- [x] Couleur MAUVE = non autorisé (pas le droit d'upload)
- [x] Couleur VERT MENTHE = autorisé (peut upload)
- [x] Bloquer l'upload pour les users non autorisés (message d'avertissement)

## ✅ PHASE 5 : PANEL ADMIN
- [x] Page /admin (accessible seulement aux admins)
- [x] Liste de tous les users
- [x] Toggle autorisation (Mauve ↔ Vert menthe)
- [x] Créer nouveau user
- [x] Supprimer user
- [ ] Upload photo de profil (max 2MB) - à implémenter
- [ ] Choisir icône custom pour admin - à implémenter

## ✅ PHASE 11 : BACKGROUNDS & REDESIGN LOGIN
- [x] Intégrer les 3 backgrounds (dark.mp4, unicorn.mp4, light.jpeg)
- [x] Système de switch entre thèmes (ThemeToggle)
- [x] Redesign login window (style Apple Punk purple/fuchsia)
- [x] Ajouter minimize fonctionnel (bouton jaune)
- [x] Intégrer RetroTV DANS login window sur mobile
- [x] Garder TV à gauche sur PC

## 🐛 PHASE 12 : FIX MOBILE BUGS
- [ ] Enlever le double logo Apple Punk sur mobile

## ✅ PHASE 12 : FIX MOBILE BUGS
- [x] Enlever le double logo Apple Punk sur mobile
- [x] Fixer le zoom de la fenêtre (bouton vert)
- [x] Remettre le template/frame de la TV visible

## ✅ PHASE 13 : RESTORE DESKTOP LOCKED
- [x] Enlever le zoom (bouton vert inactif)
- [x] Vérifier que desktop est intact (comme avant)
- [x] Garder les fixes mobile

## ✅ PHASE 14 : MODULE RADIO
- [x] Système d'upload S3 pour fichiers audio (.MP3, .WAV, .MP4)
- [x] Page RADIO avec player audio
- [x] Playlist collaborative
- [x] Routers backend (upload, liste, delete)
- [x] Validation des formats (.MP3, .WAV, .MP4)
- [x] Limite 80MB par fichier
