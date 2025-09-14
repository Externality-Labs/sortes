#!/usr/bin/env bash

# DEPLOY_PEM_PATH is the path to ssh pem file
chmod 600 "$DEPLOY_PEM_PATH"

CMD="$*"
echo "Executing command remotely: $CMD"
ssh -o StrictHostKeyChecking=no -i "$DEPLOY_PEM_PATH" -p 29 prod@sortes.fun -tt "$CMD"
