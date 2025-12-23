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

## ✅ PHASE 15 : MODULE TV
- [x] Système d'upload S3 pour images (.PNG, .GIF, .JPEG, .JPG)
- [x] Système d'upload S3 pour vidéos (.MP4, .MOV, .WMV)
- [x] Page TV avec player vidéo
- [x] Galerie des médias uploadés (images + vidéos)
- [ ] TV partagée synchronisée entre tous les users (NEXT)
- [ ] Système "push to TV" pour broadcaster un média (NEXT)
- [ ] Gestion audio exclusive (Radio OU TV) (NEXT)
- [x] Routers backend (tv.upload, tv.list, tv.delete)
- [x] Validation des formats et tailles
- [x] Limite 200MB pour vidéos, 10MB pour images

## ✅ PHASE 16 : MODULE WALL (CREATIVE!)
- [x] Système d'upload multiformat (images, vidéos, audio, PDF)
- [x] Galerie style Pinterest avec masonry layout
- [x] Preview inline pour tous les formats
- [x] Likes système (toggle like/unlike)
- [x] Comments système (ajouter/supprimer commentaires)
- [x] Tags/Catégories pour organiser le contenu
- [x] Search bar pour filtrer par titre/tags
- [x] Bouton "PUSH TO TV" sur les vidéos (UI only, fonctionnalité à implémenter)
- [x] Audio player intégré pour les fichiers audio
- [x] PDF viewer inline
- [x] Routers backend (wall.getPosts, wall.createPost, wall.deletePost, wall.toggleLike, wall.addComment)
- [x] Validation formats : images (.PNG, .GIF, .JPEG, .JPG), vidéos (.MP4, .MOV, .WMV), audio (.MP3, .WAV), PDF (.PDF)
- [x] Limites : 10MB images, 200MB vidéos, 80MB audio, 20MB PDF

## ✅ PHASE 17 : MY LIBRARY (Personal Assets)
- [x] Table user_library dans le schéma DB
- [x] Page /library avec galerie personnelle
- [x] Upload multiformat dans library (images, vidéos, audio, PDF)
- [x] Assets privés par défaut (visible que par le user)
- [x] Bouton "SHARE TO WALL" → crée post public
- [x] Bouton "PUSH TO TV" → broadcast sur TV
- [x] Bouton "ADD TO RADIO" → ajoute à playlist
- [x] Delete asset de sa library
- [x] Routers backend (library.getAssets, library.uploadAsset, library.deleteAsset, library.shareToWall, library.pushToTV, library.addToRadio)
- [x] Navigation depuis Dashboard
