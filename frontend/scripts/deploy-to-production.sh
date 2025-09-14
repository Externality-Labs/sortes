#!/usr/bin/env bash

NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

cd "$HOME/fe-v2" || exit
git checkout production-v2
git pull
nvm use node
npm install
npm run build
