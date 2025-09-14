#!/usr/bin/env bash

# format the message as a code block
TEXT="\`\`\`$*\`\`\`"

# SLACK_WEBHOOK_URL is a secret environment variable
wget -O- \
  --post-data="{\"text\":\"$TEXT\"}" \
  --header="Content-Type:application/json" \
  "$SLACK_WEBHOOK_URL"
