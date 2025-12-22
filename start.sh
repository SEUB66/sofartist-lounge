#!/bin/bash
# Augmenter la limite de fichiers ouverts
ulimit -n 65536

# Lancer le serveur backend
NODE_ENV=development pnpm exec tsx server/_core/index.ts &

# Attendre que le serveur démarre
sleep 3

# Lancer Vite
pnpm exec vite --host
