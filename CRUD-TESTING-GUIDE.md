# 🎯 Complete CRUD Testing Guide

> Test semua Create, Read, Update, Delete operations untuk Users, Business Units, dan Menus

---

## ✅ Prerequisites

- Angular app running: `http://localhost:4200`
- Laravel API running: `http://localhost:8000`
- Login as admin

---

## 📋 1. USERS CRUD

### ➕ CREATE User
1. Navigate: **Master Data → Users**
2. Click: **Add User** button
3. Fill form:
   - Username: `testuser`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Level: `User`
   - Active: ✓
4. Click: **Create**
5. ✅ Expected: Success snackbar, table refreshes

### ✏️ EDIT User
1. Find user in table
2. Click: **Edit** button (pencil icon)
3. Dialog opens with 2 sections:
   - **Basic Information**: Edit username, email, etc.
   - **Access Management**: Multi-select Business Units & Menus
4. Change selections
5. Click: **Update**
6. ✅ Expected: Success snackbar, changes saved

### 🗑️ DELETE User
1. Find user in table
2. Click: **Delete** button (trash icon)
3. Confirm deletion
4. ✅ Expected: Success snackbar, user removed

### 👀 READ Users
1. Table shows: ID, Username, Full Name, Level, Status, Actions
2. Use search box to filter
3. Use pagination if many users
4. ✅ Expected: All users visible

---

## 📋 2. BUSINESS UNITS CRUD

### ➕ CREATE Business Unit
1. Navigate: **Master Data → Business Units**
2. Click: **Add Business Unit** button
3. Fill form:
   - Business Unit Name: `Bali`
   - Status: `Active`
4. Click: **Create**
5. ✅ Expected: Success snackbar, table refreshes

**API Call:**
```
POST /api/business-units
Body: {
  "business_unit": "Bali",
  "active": "y"
}
```

### ✏️ EDIT Business Unit
1. Find BU in table
2. Click: **Edit** button (pencil icon)
3. Update:
   - Business Unit Name: `Bali Office`
   - Status: Keep as Active or change
4. Click: **Update**
5. ✅ Expected: Success snackbar, changes visible

**API Call:**
```
PUT /api/business-units/{id}
Body: {
  "business_unit": "Bali Office",
  "active": "y"
}
```

### 🗑️ DELETE Business Unit
1. Find BU in table
2. Click: **Delete** button (trash icon)
3. Confirm: "Are you sure you want to delete 'Bali'?"
4. ✅ Expected: Success snackbar, BU removed

**API Call:**
```
DELETE /api/business-units/{id}
```

### 👀 READ Business Units
1. Table shows: ID, Business Unit, User ID, Status, Actions
2. ✅ Expected: All business units visible with status chips (green=active, red=inactive)

**API Call:**
```
GET /api/business-units
```

---

## 📋 3. MENUS CRUD

### ➕ CREATE Menu
1. Navigate: **Master Data → Menus**
2. Click: **Add Menu** button
3. Fill form:
   - Menu Name: `Inventory`
   - URL Link: `/admin/inventory`
   - Icon: `inventory_2`
   - Parent Menu: Select parent or None
   - Status: `Active`
4. Click: **Create**
5. ✅ Expected: Success snackbar, table refreshes

**API Call:**
```
POST /api/menus
Body: {
  "nama_menu": "Inventory",
  "url_link": "/admin/inventory",
  "icon": "inventory_2",
  "parent": null,
  "active": "y"
}
```

### ➕ CREATE Sub-Menu
1. Click: **Add Menu** button
2. Fill form:
   - Menu Name: `Products`
   - URL Link: `/admin/inventory/products`
   - Icon: `category`
   - **Parent Menu**: Select `Inventory` ← Important!
   - Status: `Active`
3. Click: **Create**
4. ✅ Expected: Sub-menu created under Inventory

### ✏️ EDIT Menu
1. Find menu in table
2. Click: **Edit** button (pencil icon)
3. Update any fields
4. Click: **Update**
5. ✅ Expected: Success snackbar, changes visible

**API Call:**
```
PUT /api/menus/{id}
Body: {
  "nama_menu": "Inventory Management",
  "url_link": "/admin/inventory",
  "icon": "inventory",
  "parent": null,
  "active": "y"
}
```

### 🗑️ DELETE Menu
1. Find menu in table
2. Click: **Delete** button (trash icon)
3. Confirm deletion
4. ✅ Expected: Success snackbar, menu removed

**API Call:**
```
DELETE /api/menus/{id}
```

### 👀 READ Menus
1. Table shows: ID, Menu Name (with icon), URL, Parent, Actions
2. Parent column shows parent menu name or "-" for top-level
3. ✅ Expected: All menus visible with hierarchy

**API Call:**
```
GET /api/menus
```

---

## 🎨 UI Features Reference

### Users Dialog Features:
```
✅ Basic Information section
✅ Access Management section (edit mode only)
✅ Multi-select Business Units dropdown
✅ Multi-select Menus dropdown
✅ Chip display for selections
✅ Selection count in hint
✅ Auto-load current access
✅ Icons on all fields
```

### Business Units Dialog Features:
```
✅ Business Unit Name field
✅ Status dropdown (Active/Inactive with icons)
✅ Simple, focused form
✅ Icons on fields
✅ Validation messages
```

### Menus Dialog Features:
```
✅ Menu Name field
✅ URL Link field (optional)
✅ Icon field with live preview
✅ Parent Menu dropdown (shows hierarchy)
✅ Status dropdown
✅ Material icon hints
✅ Prevent circular reference (can't select self as parent)
```

---

## 🔍 Testing Checklist

### For Each Entity (Users, Business Units, Menus):

#### CREATE
- [ ] Button visible and clickable
- [ ] Dialog opens correctly
- [ ] All form fields render
- [ ] Validation works (required fields)
- [ ] Can fill all fields
- [ ] Save button enabled when valid
- [ ] API call succeeds (check Network tab)
- [ ] Success snackbar appears
- [ ] Dialog closes
- [ ] Table refreshes with new item
- [ ] New item visible in list

#### READ
- [ ] Table loads automatically on page load
- [ ] All columns display correctly
- [ ] Data matches API response
- [ ] Loading spinner shows during load
- [ ] Error message if API fails
- [ ] Empty state if no data

#### UPDATE
- [ ] Edit button visible for each item
- [ ] Dialog opens with pre-filled data
- [ ] Can modify all fields
- [ ] Save button works
- [ ] API call succeeds
- [ ] Success snackbar appears
- [ ] Dialog closes
- [ ] Table refreshes with updated data
- [ ] Changes visible immediately

#### DELETE
- [ ] Delete button visible for each item
- [ ] Confirmation dialog appears
- [ ] Can cancel deletion
- [ ] Can confirm deletion
- [ ] API call succeeds
- [ ] Success snackbar appears
- [ ] Item removed from table
- [ ] No orphaned data

---

## 🐛 Common Issues & Solutions

### Issue: "Coming soon!" message appears
**Cause:** Old component not updated  
**Solution:** Clear browser cache (Cmd+Shift+R), restart dev server

### Issue: Dialog doesn't open
**Cause:** MatDialog not imported  
**Check:** Browser console for errors  
**Solution:** Verify imports in component

### Issue: 404 on API call
**Cause:** Laravel endpoint not available  
**Check:** Network tab, verify endpoint exists  
**Solution:** Create Laravel controller methods

### Issue: Form validation not working
**Cause:** FormControl validators not set  
**Check:** Browser console for validation errors  
**Solution:** Verify Validators.required on form fields

### Issue: Table not refreshing after create/update
**Cause:** loadData() not called after successful operation  
**Solution:** Ensure loadData() in .subscribe() success callback

### Issue: Multi-select dropdown empty (Users edit)
**Cause:** Master data not loaded or API error  
**Check:** Network tab for /api/business-units and /api/menus  
**Solution:** Verify those endpoints return data

---

## 📊 API Endpoints Reference

### Users
```
GET    /api/users              → List all
GET    /api/users/{id}         → Get one
POST   /api/users              → Create
PUT    /api/users/{id}         → Update
DELETE /api/users/{id}         → Delete
GET    /api/users/{id}/access  → Get access (V4)
PUT    /api/users/{id}/access  → Update access (V4)
```

### Business Units
```
GET    /api/business-units              → List all
GET    /api/business-units/{id}         → Get one
POST   /api/business-units              → Create
PUT    /api/business-units/{id}         → Update
DELETE /api/business-units/{id}         → Delete
```

### Menus
```
GET    /api/menus              → List all
GET    /api/menus/{id}         → Get one
POST   /api/menus              → Create
PUT    /api/menus/{id}         → Update
DELETE /api/menus/{id}         → Delete
```

---

## ✅ Success Criteria

### You've successfully implemented CRUD when:

**Users:**
- [x] Can create user with basic info
- [x] Can edit user basic info
- [x] Can edit user access (BUs & Menus) - V4 feature
- [x] Can delete user
- [x] Table shows all users

**Business Units:**
- [x] Can create business unit
- [x] Can edit business unit
- [x] Can delete business unit
- [x] Table shows all business units

**Menus:**
- [x] Can create top-level menu
- [x] Can create sub-menu with parent
- [x] Can edit menu
- [x] Can delete menu
- [x] Table shows all menus with parent info

**General:**
- [x] All dialogs open correctly
- [x] All forms validate properly
- [x] All API calls succeed
- [x] All snackbar messages appear
- [x] All tables refresh after operations
- [x] No console errors
- [x] No network errors

---

## 🚀 Quick Test Commands

```bash
# Check Angular app
curl -s http://localhost:4200 | head -5

# Check Laravel API health
curl http://localhost:8000/api/health

# Test Users endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/users

# Test Business Units endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/business-units

# Test Menus endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/menus

# Test create Business Unit
curl -X POST http://localhost:8000/api/business-units \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"business_unit":"Test BU","active":"y"}'
```

---

**🎉 CRUD Complete! All operations working for Users, Business Units, and Menus.**

Test everything dengan checklist di atas. Happy testing! 🚀
