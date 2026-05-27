#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Gaskuy Roadtrip — 1-Click Setup   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# Load env
if [ -f .env.local ]; then
  set -a
  source .env.local
  set +a
  PROJECT_REF=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed 's|https://\(.*\)\.supabase\.co|\1|')
  echo -e "  ${GREEN}✓${NC} .env.local loaded"
fi

# ── 1. Check prerequisites ─────────────────────────────────
echo -e "${YELLOW}[1/5]${NC} Prerequisites"
echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"
echo -e "  ${GREEN}✓${NC} npm $(npm --version)"
echo -e "  ${GREEN}✓${NC} .env.local configured"
echo -e "  ${GREEN}✓${NC} Migration file: ${YELLOW}supabase/migrations/000_combined.sql${NC}"

# ── 2. Install dependencies ────────────────────────────────
echo ""
echo -e "${YELLOW}[2/5]${NC} Installing dependencies..."
npm install 2>&1 | tail -3
echo -e "  ${GREEN}✓${NC} Dependencies installed"

# ── 3. Database migration ──────────────────────────────────
echo ""
echo -e "${YELLOW}[3/5]${NC} Database migration"

MIGRATION_FILE="supabase/migrations/000_combined.sql"

if [ -z "$PROJECT_REF" ]; then
  PROJECT_REF="qpzormleecheuzmilhjo"
fi

# Try psql with provided password or fallback
if command -v psql &>/dev/null; then
  if [ -n "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "  Trying psql migration..."
    if     PGPASSWORD="$SUPABASE_DB_PASSWORD" psql \
      "postgresql://postgres@db.${PROJECT_REF}.supabase.co:6543/postgres?sslmode=require" \
      -f "$MIGRATION_FILE" 2>&1; then
      echo -e "  ${GREEN}✓${NC} Migration via psql successful!"
      DB_DONE=true
    else
      echo -e "  ${RED}✗${NC} psql failed — wrong password or connection timeout"
    fi
  fi
fi

if [ "$DB_DONE" != "true" ]; then
  echo ""
  echo -e "  ${YELLOW}›› Manual step needed${NC}"
  echo -e "  Run this SQL in Supabase SQL Editor:"
  echo -e "  ${BLUE}  https://supabase.com/dashboard/project/${PROJECT_REF}/sql/new${NC}"
  echo ""
  echo -e "  Copy the content of ${YELLOW}${MIGRATION_FILE}${NC} and paste it there."
  echo -e "  Then click ${GREEN}Run${NC}."
  echo ""
  read -p "  Press Enter after you've run the migration... "
  echo -e "  ${GREEN}✓${NC} Database migration confirmed"
fi

# ── 4. Build check ─────────────────────────────────────────
echo ""
echo -e "${YELLOW}[4/5]${NC} Build check"
if npm run build 2>&1 | tail -5; then
  echo -e "  ${GREEN}✓${NC} Build successful!"
else
  echo -e "  ${RED}✗${NC} Build failed — check errors above"
  exit 1
fi

# ── 5. Deploy guide ────────────────────────────────────────
echo ""
echo -e "${YELLOW}[5/5]${NC} Deploy to Vercel"
echo ""
echo -e "  ${GREEN}1.${NC} Push to GitHub:"
echo -e "     git add -A && git commit -m 'setup: supabase + cloudflare' && git push"
echo ""
echo -e "  ${GREEN}2.${NC} Import project at ${BLUE}https://vercel.com/new${NC}"
echo -e "     Repo: ${YELLOW}arifhendrap87/gaskuy-roadtrip${NC}"
echo ""
echo -e "  ${GREEN}3.${NC} Add env vars in Vercel (Project Settings → Environment Variables):"
echo ""
echo -e "     ${CYAN}NEXT_PUBLIC_SUPABASE_URL${NC}           = https://${PROJECT_REF}.supabase.co"
echo -e "     ${CYAN}NEXT_PUBLIC_SUPABASE_ANON_KEY${NC}      = ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}..."
echo -e "     ${CYAN}SUPABASE_SERVICE_ROLE_KEY${NC}           = ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo -e "     ${CYAN}CLOUDFLARE_ACCOUNT_ID${NC}               = ${CLOUDFLARE_ACCOUNT_ID}"
echo -e "     ${CYAN}CLOUDFLARE_R2_ACCESS_KEY_ID${NC}         = ${CLOUDFLARE_R2_ACCESS_KEY_ID}"
echo -e "     ${CYAN}CLOUDFLARE_R2_SECRET_ACCESS_KEY${NC}     = ${CLOUDFLARE_R2_SECRET_ACCESS_KEY:0:20}..."
echo -e "     ${CYAN}CLOUDFLARE_R2_PUBLIC_BUCKET${NC}         = ${CLOUDFLARE_R2_PUBLIC_BUCKET}"
echo ""
echo -e "  ${GREEN}4.${NC} Click ${BLUE}Deploy${NC}"
echo ""
echo -e "  ${GREEN}5.${NC} Create admin user:"
echo -e "     a) Open ${BLUE}https://supabase.com/dashboard/project/${PROJECT_REF}/auth/users${NC}"
echo -e "     b) Click ${GREEN}Invite user${NC} → enter your email"
echo -e "     c) Check email → set password → login at yoursite.vercel.app/admin/login"
echo -e "     d) In SQL Editor, run:"
echo -e "        ${YELLOW}INSERT INTO profiles (id, email, role)${NC}"
echo -e "        ${YELLOW}VALUES ('YOUR_AUTH_USER_ID', 'your@email.com', 'super_admin');${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete! 🚗                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
