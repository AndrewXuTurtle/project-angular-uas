#!/bin/bash

# Quick API Test Script
# Usage: ./quick-api-test.sh

echo "🧪 Quick API Test for Laravel Backend"
echo "======================================"
echo ""

API_URL="http://localhost:8000/api"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Login${NC}"
echo "Attempting login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/login" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Login failed - no token received${NC}"
  echo "Please check:"
  echo "  1. Laravel server is running on port 8000"
  echo "  2. Username/password is correct"
  echo "  3. Database is connected"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test Business Units
echo -e "${YELLOW}Step 2: Test Business Units API${NC}"
BU_RESPONSE=$(curl -s -X GET "$API_URL/business-units" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "$BU_RESPONSE" | jq '.' 2>/dev/null || echo "$BU_RESPONSE"

if echo "$BU_RESPONSE" | grep -q "error\|message.*Unauthenticated"; then
  echo -e "${RED}❌ Business Units API failed${NC}"
else
  BU_COUNT=$(echo "$BU_RESPONSE" | jq 'length' 2>/dev/null)
  echo -e "${GREEN}✅ Business Units API working - Found $BU_COUNT business units${NC}"
fi
echo ""

# Test Menus
echo -e "${YELLOW}Step 3: Test Menus API${NC}"
MENU_RESPONSE=$(curl -s -X GET "$API_URL/menus" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "$MENU_RESPONSE" | jq '.' 2>/dev/null || echo "$MENU_RESPONSE"

if echo "$MENU_RESPONSE" | grep -q "error\|message.*Unauthenticated"; then
  echo -e "${RED}❌ Menus API failed${NC}"
else
  MENU_COUNT=$(echo "$MENU_RESPONSE" | jq 'length' 2>/dev/null)
  echo -e "${GREEN}✅ Menus API working - Found $MENU_COUNT menus${NC}"
fi
echo ""

# Test Users
echo -e "${YELLOW}Step 4: Test Users API${NC}"
USER_RESPONSE=$(curl -s -X GET "$API_URL/users" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "$USER_RESPONSE" | jq '.' 2>/dev/null || echo "$USER_RESPONSE"

if echo "$USER_RESPONSE" | grep -q "error\|message.*Unauthenticated"; then
  echo -e "${RED}❌ Users API failed${NC}"
else
  USER_COUNT=$(echo "$USER_RESPONSE" | jq 'length' 2>/dev/null)
  echo -e "${GREEN}✅ Users API working - Found $USER_COUNT users${NC}"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}🎉 API Test Complete${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:4200"
echo "2. Login with admin credentials"
echo "3. You should go directly to dashboard"
echo "4. Try accessing Users, Business Units, Menus"
echo "5. No redirect to business unit selection should occur"
echo ""
echo "If you see 'Call to undefined relationship [user]' error:"
echo "  → Check Laravel app/Models/BusinessUnit.php"
echo "  → Remove user() relationship method"
