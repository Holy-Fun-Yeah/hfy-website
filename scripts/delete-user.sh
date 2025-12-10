#!/bin/bash
# Delete a user from auth.users (profile cascades automatically via FK)
# Usage: ./scripts/delete-user.sh <user-id>

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <user-id>"
  echo "Example: $0 ebdc404a-1cb0-4074-aba6-79b14b405229"
  exit 1
fi

USER_ID="$1"

# Load env vars from .env file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE"
  exit 1
fi

# Extract DATABASE_URL from .env
DATABASE_URL=$(grep -E "^DATABASE_URL=" "$ENV_FILE" | cut -d'"' -f2)

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL not found in .env"
  exit 1
fi

echo "Deleting user: $USER_ID"

# Delete from auth.users - profile cascades via FK constraint
psql "$DATABASE_URL" <<EOF
DELETE FROM auth.users WHERE id = '$USER_ID';
SELECT 'User deleted (profile cascaded)' AS status;
EOF

echo "Done!"
