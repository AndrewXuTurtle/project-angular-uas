#!/bin/bash

# Complete API Diagnostic Tool
echo "========================================"
echo "🔍 Laravel API Complete Diagnostic"
echo "========================================"
echo ""

API_URL="http://localhost:8000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Server Health
echo -e "${YELLOW}1. Testing Server Health...${NC}"
SERVER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 2>&1)
if [ "$SERVER_RESPONSE" = "200" ] || [ "$SERVER_RESPONSE" = "404" ]; then
  echo -e "${GREEN}✅ Laravel server is running${NC}"
else
  echo -e "${RED}❌ Laravel server not responding (HTTP $SERVER_RESPONSE)${NC}"
  echo "Please start Laravel server: php artisan serve"
  exit 1
fi
echo ""

# Test 2: Database Connection (via any API endpoint)
echo -e "${YELLOW}2. Testing API Endpoint...${NC}"
API_TEST=$(curl -s "$API_URL/business-units" 2>&1)
if echo "$API_TEST" | grep -q "Unauthenticated"; then
  echo -e "${GREEN}✅ API endpoints accessible (requires auth)${NC}"
elif echo "$API_TEST" | grep -q "error"; then
  echo -e "${RED}❌ API error: $API_TEST${NC}"
else
  echo -e "${YELLOW}⚠️  API response: ${API_TEST:0:100}...${NC}"
fi
echo ""

# Test 3: Login with different credentials
echo -e "${YELLOW}3. Testing Login Endpoints...${NC}"
echo "Trying admin/admin123..."
LOGIN1=$(curl -s -X POST "$API_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
echo "$LOGIN1"

if echo "$LOGIN1" | grep -q '"success":true'; then
  TOKEN=$(echo "$LOGIN1" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Login successful with admin/admin123${NC}"
  echo "Token: ${TOKEN:0:30}..."
else
  echo -e "${RED}❌ Login failed with admin/admin123${NC}"
  
  # Try alternative credentials
  echo ""
  echo "Trying admin/password..."
  LOGIN2=$(curl -s -X POST "$API_URL/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"password"}')
  
  if echo "$LOGIN2" | grep -q '"success":true'; then
    TOKEN=$(echo "$LOGIN2" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login successful with admin/password${NC}"
    echo "Token: ${TOKEN:0:30}..."
  else
    echo -e "${RED}❌ Login failed with admin/password${NC}"
    echo ""
    echo "Please check your database for correct admin credentials:"
    echo "SELECT username, password FROM tbl_users WHERE level = 'admin';"
    TOKEN=""
  fi
fi
echo ""

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Cannot continue without valid token${NC}"
  echo ""
  echo "Please:"
  echo "1. Check Laravel .env file (DB_DATABASE, DB_USERNAME, DB_PASSWORD)"
  echo "2. Run: php artisan migrate"
  echo "3. Create admin user in database"
  exit 1
fi

# Test 4: Business Units API
echo -e "${YELLOW}4. Testing Business Units API...${NC}"
BU_RESPONSE=$(curl -s "$API_URL/business-units" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

echo "$BU_RESPONSE" | head -20
if echo "$BU_RESPONSE" | grep -q "business_unit"; then
  BU_COUNT=$(echo "$BU_RESPONSE" | grep -o "\"id\":" | wc -l)
  echo -e "${GREEN}✅ Business Units API working - $BU_COUNT business units found${NC}"
else
  echo -e "${RED}❌ Business Units API failed${NC}"
fi
echo ""

# Test 5: Menus API
echo -e "${YELLOW}5. Testing Menus API...${NC}"
MENU_RESPONSE=$(curl -s "$API_URL/menus" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

echo "$MENU_RESPONSE" | head -20
if echo "$MENU_RESPONSE" | grep -q "nama_menu"; then
  MENU_COUNT=$(echo "$MENU_RESPONSE" | grep -o "\"id\":" | wc -l)
  echo -e "${GREEN}✅ Menus API working - $MENU_COUNT menus found${NC}"
else
  echo -e "${RED}❌ Menus API failed${NC}"
fi
echo ""

# Test 6: Users API
echo -e "${YELLOW}6. Testing Users API...${NC}"
USER_RESPONSE=$(curl -s "$API_URL/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/json")

echo "$USER_RESPONSE" | head -20
if echo "$USER_RESPONSE" | grep -q "username"; then
  USER_COUNT=$(echo "$USER_RESPONSE" | grep -o "\"id\":" | wc -l)
  echo -e "${GREEN}✅ Users API working - $USER_COUNT users found${NC}"
else
  echo -e "${RED}❌ Users API failed${NC}"
fi
echo ""

# Summary
echo "========================================"
echo -e "${GREEN}🎉 API Diagnostic Complete${NC}"
echo "========================================"
echo ""
echo "If all tests passed:"
echo "1. Open http://localhost:4200"
echo "2. Login with the working credentials"
echo "3. Check browser console (F12) for errors"
echo ""
echo "If tests failed:"
echo "1. Check Laravel logs: tail -f storage/logs/laravel.log"
echo "2. Check database connection"
echo "3. Verify user credentials in database"
echo ""
echo "Working credentials to use in Angular: admin / [working_password]"
