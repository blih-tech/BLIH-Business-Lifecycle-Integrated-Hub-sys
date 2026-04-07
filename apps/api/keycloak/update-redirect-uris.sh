#!/usr/bin/env bash
# =============================================================================
# update-redirect-uris.sh
#
# Adds the frontend proxy callback URLs to the blih-system-auth Keycloak client
# WITHOUT restarting the container or re-importing the full realm.
#
# Usage:
#   ./update-redirect-uris.sh                        # uses .env.production
#   KEYCLOAK_URL=http://localhost:8080 ./update-redirect-uris.sh  # override
# =============================================================================
set -euo pipefail

# ---------------------------------------------------------------------------
# Config — override any of these via env vars
# ---------------------------------------------------------------------------
KEYCLOAK_URL="${KEYCLOAK_URL:-https://keycloak.blihmarketing.com}"
REALM="${KEYCLOAK_REALM:-blih}"
ADMIN_USER="${KEYCLOAK_ADMIN_USERNAME:-admin}"
ADMIN_PASS="${KEYCLOAK_ADMIN_PASSWORD:-admin}"
ADMIN_CLIENT="${KEYCLOAK_ADMIN_CLIENT_ID:-admin-cli}"
TARGET_CLIENT_ID="blih-system-auth"

echo "▶ Keycloak: $KEYCLOAK_URL  |  Realm: $REALM  |  Target client: $TARGET_CLIENT_ID"

# ---------------------------------------------------------------------------
# Step 1 — Get admin access token
# ---------------------------------------------------------------------------
echo ""
echo "[1/4] Obtaining admin token..."
TOKEN_RESP=$(curl -sf -X POST \
  "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=$ADMIN_CLIENT" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS")

ACCESS_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "   ✓ Token obtained"

# ---------------------------------------------------------------------------
# Step 2 — Find the internal UUID of blih-system-auth
# ---------------------------------------------------------------------------
echo ""
echo "[2/4] Looking up client UUID for '$TARGET_CLIENT_ID'..."
CLIENTS_JSON=$(curl -sf \
  "$KEYCLOAK_URL/admin/realms/$REALM/clients?clientId=$TARGET_CLIENT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

CLIENT_UUID=$(echo "$CLIENTS_JSON" | python3 -c "import sys,json; data=json.load(sys.stdin); print(data[0]['id'])")
echo "   ✓ UUID: $CLIENT_UUID"

# ---------------------------------------------------------------------------
# Step 3 — Fetch current client representation
# ---------------------------------------------------------------------------
echo ""
echo "[3/4] Fetching current client config..."
CLIENT_JSON=$(curl -sf \
  "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

# Show current redirectUris
echo "   Current redirectUris:"
echo "$CLIENT_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for uri in data.get('redirectUris', []):
    print(f'     {uri}')
"

# ---------------------------------------------------------------------------
# Step 4 — Merge new URIs and PUT updated client
# ---------------------------------------------------------------------------
echo ""
echo "[4/4] Adding new redirect URIs and updating client..."
UPDATED_JSON=$(echo "$CLIENT_JSON" | python3 -c "
import sys, json

data = json.load(sys.stdin)

new_uris = [
    'https://project-k22it.vercel.app/api/auth/callback',
    'http://localhost:3000/api/auth/callback',
]

existing = set(data.get('redirectUris', []))
added = []
for uri in new_uris:
    if uri not in existing:
        existing.add(uri)
        added.append(uri)

data['redirectUris'] = sorted(existing)

print(json.dumps(data))
import sys
# Print summary to stderr so it doesn't pollute the JSON output
print(f'   URIs added: {added if added else \"(all already present)\"}', file=sys.stderr)
")

curl -sf -X PUT \
  "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$UPDATED_JSON"

echo "   ✓ Client updated"

# ---------------------------------------------------------------------------
# Verify
# ---------------------------------------------------------------------------
echo ""
echo "✅ Done! Final redirectUris:"
curl -sf \
  "$KEYCLOAK_URL/admin/realms/$REALM/clients/$CLIENT_UUID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for uri in sorted(data.get('redirectUris', [])):
    print(f'   {uri}')
"
