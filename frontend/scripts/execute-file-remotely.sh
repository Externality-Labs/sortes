#!/usr/bin/env bash

# DEPLOY_PEM_PATH is the path to ssh pem file
chmod 600 "$DEPLOY_PEM_PATH"

SCRIPT="$1"
echo "Executing script remotely: $SCRIPT"
ssh -o StrictHostKeyChecking=no -i "$DEPLOY_PEM_PATH" -p 29 prod@sortes.fun 'bash -s' < "$SCRIPT"
