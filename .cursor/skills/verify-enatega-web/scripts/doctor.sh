#!/usr/bin/env bash
# Read-only health check for Enatega customer web verification.
set -euo pipefail

VERIFY_PORT="${VERIFY_PORT:-3002}"
BASE_URL="${BASE_URL:-http://localhost:${VERIFY_PORT}}"
API_URL="${API_URL:-https://aws-server-v2.enatega.com/graphql}"

echo "doctor: BASE_URL=$BASE_URL"
echo "doctor: API_URL=$API_URL"

code="$(curl -s -o /tmp/verify-enatega-web-home.html -w '%{http_code}' --max-time 15 "$BASE_URL/" || true)"
if [[ "$code" != "200" ]]; then
  echo "doctor: FAIL home HTTP $code (expected 200)"
  exit 1
fi

# Port 3000 is often another product in this workspace; refuse non-Enatega HTML.
if ! grep -Eq 'Login|DELIVERED|enatega|Enatega|Search for a city' /tmp/verify-enatega-web-home.html; then
  echo "doctor: FAIL home HTML does not look like Enatega customer web"
  echo "doctor: hint: another app may own this port — use VERIFY_PORT=3002"
  exit 1
fi
if grep -Eqi 'AussieEats' /tmp/verify-enatega-web-home.html; then
  echo "doctor: FAIL this port is serving AussieEats, not Enatega"
  exit 1
fi

gql_code="$(curl -s -o /tmp/verify-enatega-web-gql.json -w '%{http_code}' --max-time 20 \
  -X POST "$API_URL" \
  -H 'content-type: application/json' \
  -d '{"query":"{ __typename }"}' || true)"
if [[ "$gql_code" != "200" ]]; then
  echo "doctor: FAIL GraphQL HTTP $gql_code (need egress to aws-server-v2.enatega.com)"
  exit 1
fi

echo "doctor: PASS home=200 api=200 base=$BASE_URL"
exit 0
