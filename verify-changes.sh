#!/bin/bash

# Quick Verification Script
echo "🔍 Verifying Angular Code Changes..."
echo "====================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check login component
echo -e "${YELLOW}1. Checking Login Component...${NC}"
if grep -q "router.navigate(\['/admin/dashboard'\])" src/app/auth/login/login.component.ts; then
  echo -e "${GREEN}✅ Login redirects to dashboard (correct)${NC}"
else
  echo -e "${RED}❌ Login still redirects to business-unit selection${NC}"
fi
echo ""

# Check sidebar component
echo -e "${YELLOW}2. Checking Sidebar Component...${NC}"
if grep -q "loadMenusFromDatabase" src/app/layout/sidebar/sidebar.component.ts; then
  echo -e "${GREEN}✅ Sidebar loads menus from database (correct)${NC}"
else
  echo -e "${RED}❌ Sidebar still using static menus${NC}"
fi

if grep -q "menuService.getMenus()" src/app/layout/sidebar/sidebar.component.ts; then
  echo -e "${GREEN}✅ Sidebar calls MenuService.getMenus() (correct)${NC}"
else
  echo -e "${RED}❌ Sidebar not calling API${NC}"
fi
echo ""

# Check user form dialog
echo -e "${YELLOW}3. Checking User Form Dialog...${NC}"
if grep -q "loadMasterDataOnly()" src/app/users/user-form-dialog.component.ts; then
  echo -e "${GREEN}✅ User form loads master data (correct)${NC}"
else
  echo -e "${RED}❌ User form not loading master data${NC}"
fi
echo ""

# Check select BU component
echo -e "${YELLOW}4. Checking Business Unit Selection...${NC}"
if grep -q "skipSelection()" src/app/select-business-unit/select-business-unit.component.ts; then
  echo -e "${GREEN}✅ Business unit selection has skip option (correct)${NC}"
else
  echo -e "${RED}❌ No skip option for admin${NC}"
fi

if grep -q "canSkipSelection()" src/app/select-business-unit/select-business-unit.component.html; then
  echo -e "${GREEN}✅ Skip button in HTML template (correct)${NC}"
else
  echo -e "${RED}❌ Skip button not in template${NC}"
fi
echo ""

# Check for old references
echo -e "${YELLOW}5. Checking for old redirect references...${NC}"
OLD_REFS=$(grep -r "navigate.*select-business-unit" src/app/ 2>/dev/null | grep -v "component.ts:\s*//\|component.html\|test-api\|CLEAR-CACHE" | wc -l)
if [ "$OLD_REFS" -eq 0 ]; then
  echo -e "${GREEN}✅ No old redirect references found (correct)${NC}"
else
  echo -e "${RED}⚠️  Found $OLD_REFS references to select-business-unit redirect${NC}"
  grep -r "navigate.*select-business-unit" src/app/ 2>/dev/null | grep -v "component.ts:\s*//\|component.html"
fi
echo ""

# Check Angular server
echo -e "${YELLOW}6. Checking Angular Dev Server...${NC}"
if ps aux | grep -q "[n]g serve"; then
  echo -e "${GREEN}✅ Angular dev server is running${NC}"
  PORT=$(ps aux | grep "[n]g serve" | head -1)
  echo "   Server: http://localhost:4200"
else
  echo -e "${RED}❌ Angular dev server is NOT running${NC}"
  echo "   Run: npm run start"
fi
echo ""

echo "====================================="
echo -e "${GREEN}🎉 Code Verification Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Open http://localhost:4200"
echo "2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"
echo "3. Test login → Should go to dashboard"
echo "4. Test sidebar clicks → Should navigate"
echo "5. Check browser console for errors"
echo ""
echo "If issues persist:"
echo "- Check CLEAR-CACHE-GUIDE.md"
echo "- Open browser DevTools (F12) → Console tab"
echo "- Share console errors/logs"
