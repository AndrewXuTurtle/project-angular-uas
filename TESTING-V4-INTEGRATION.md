# Testing V4 API Integration Guide

## 📋 Prerequisites

✅ Laravel API sudah running di `http://localhost:8000`  
✅ Endpoints berikut sudah tersedia:
- `GET /api/users/{id}/access`
- `PUT /api/users/{id}/access`
- `GET /api/business-units`
- `GET /api/menus`

✅ Angular app running di `http://localhost:4200`

---

## 🧪 Test Flow - End to End

### 1️⃣ Test Login & Navigate to Users

```bash
# Open browser
open http://localhost:4200

# Login as admin
Username: admin
Password: Admin123

# Navigate to sidebar -> Master Data -> Users
```

---

### 2️⃣ Test Edit User with Access Management

**Steps:**
1. Di halaman Users, klik tombol **Edit** (icon pensil) pada salah satu user
2. Dialog akan terbuka dengan 2 section:
   - **Basic Information** (username, full name, email, level, active status)
   - **Access Management** (business units & menus multi-select)

**Expected Behavior:**
- Dialog width: 700px
- Loading spinner muncul sebentar saat load access data
- Business Units dropdown terisi dengan semua BU dari master
- Menus dropdown terisi dengan semua menu dari master
- BU & Menu yang sudah assigned ke user akan ter-select (highlighted)
- Bisa select/deselect multiple items
- Setiap selection menampilkan chip count di hint text

---

### 3️⃣ Test Multi-Select Dropdown

**Business Units Dropdown:**
```
Label: Business Units
Icon: business_center
Hint: "Select business units this user can access (X selected)"

Options tampil dengan icon "business" dan nama BU
Example:
  🏢 Batam
  🏢 Jakarta
  🏢 Surabaya
```

**Menus Dropdown:**
```
Label: Menus
Icon: menu_open
Hint: "Select menus this user can access (X selected)"

Options tampil dengan icon masing-masing menu
Example:
  📊 Dashboard
  👥 Users
  🏢 Business Units
  📋 Reports
```

---

### 4️⃣ Test Save Access

**Steps:**
1. Ubah selection di Business Units (tambah/kurangi)
2. Ubah selection di Menus (tambah/kurangi)
3. Klik tombol **Update** (icon save)

**Expected API Calls:**
```
1. PUT /api/users/{id} (update basic info)
   Body: { username, full_name, email, level, is_active }

2. PUT /api/users/{id}/access (update access)
   Body: {
     user_id: 2,
     business_unit_ids: [1, 2, 3],
     menu_ids: [1, 2, 5, 6]
   }
```

**Success Response:**
- Snackbar: "User and access updated successfully"
- Dialog closes
- User list refreshes

---

### 5️⃣ Test Create New User

**Steps:**
1. Klik button **Add User** di kanan atas
2. Dialog terbuka hanya dengan **Basic Information** section
3. Isi form:
   - Username: `testuser`
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Level: `user`
   - Active: ON
4. Klik **Create**

**Expected Behavior:**
- Tidak ada section Access Management (karena user belum punya ID)
- After create success, bisa edit user untuk set access
- Snackbar: "User created successfully"

---

## 🔍 Browser Console Debugging

### Check API Calls
```javascript
// Open DevTools -> Network tab
// Filter: XHR

// You should see:
GET /api/users                    // Load users table
GET /api/business-units           // Load BU master data
GET /api/menus                    // Load menu master data
GET /api/users/2/access           // Load user access (edit mode)
PUT /api/users/2                  // Update user basic info
PUT /api/users/2/access           // Update user access
```

### Check Console Logs
```javascript
// Open DevTools -> Console tab

// You should see:
"Loading users..."
"Users loaded: [...]"
"User access loaded: {user: {...}, business_units: [...], menus: [...]}"
"User and access updated successfully"
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "404 Not Found" on `/api/users/{id}/access`
**Solution:** API endpoint belum dibuat di Laravel. Pastikan route dan controller sudah sesuai guide.

### Issue 2: Loading spinner tidak hilang
**Solution:** Check network tab, mungkin API error. Pastikan response format sesuai:
```json
{
  "success": true,
  "message": "...",
  "data": {...}
}
```

### Issue 3: Dropdown kosong (no options)
**Solution:** 
- Check GET `/api/business-units` returns array
- Check GET `/api/menus` returns array
- Check response.data structure

### Issue 4: Selected items tidak muncul di dropdown
**Solution:**
- Check `getUserAccess()` returns correct IDs
- Check `business_unit_ids` dan `menu_ids` form controls
- Verify ID types match (number vs string)

### Issue 5: CORS error
**Solution:** Update Laravel CORS config:
```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
```

---

## ✅ Testing Checklist

### Basic Features
- [ ] Can login as admin
- [ ] Can navigate to Users page
- [ ] Table shows: ID, Username, Full Name, Level, Status, Actions
- [ ] Can search/filter users
- [ ] Can paginate users

### Create User
- [ ] Can open create dialog
- [ ] Can fill basic info
- [ ] Can create user successfully
- [ ] Success snackbar appears
- [ ] Table refreshes with new user

### Edit User - Basic Info
- [ ] Can open edit dialog
- [ ] Form pre-filled with user data
- [ ] Can update username, full name, email, level, status
- [ ] Can save changes
- [ ] Success snackbar appears

### Edit User - Access Management
- [ ] Access section visible in edit mode
- [ ] Business Units dropdown loads
- [ ] Menus dropdown loads
- [ ] Current access pre-selected
- [ ] Can select multiple BUs
- [ ] Can select multiple menus
- [ ] Chip count shows in hint
- [ ] Can deselect items
- [ ] Can save access changes
- [ ] API call to `/access` endpoint successful

### Delete User
- [ ] Can delete user
- [ ] Confirmation dialog appears
- [ ] User removed from table
- [ ] Success snackbar appears

---

## 📊 Test Data Examples

### Sample Request: Update User Access
```bash
curl -X PUT http://localhost:8000/api/users/2/access \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_unit_ids": [1, 2],
    "menu_ids": [1, 2, 5, 6, 7]
  }'
```

### Sample Response: Get User Access
```json
{
  "success": true,
  "message": "User access retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "username": "user1",
      "full_name": "User One",
      "email": "user1@example.com",
      "level": "user",
      "is_active": true
    },
    "business_units": [
      {
        "id": 1,
        "business_unit": "Batam",
        "active": "y"
      },
      {
        "id": 2,
        "business_unit": "Jakarta",
        "active": "y"
      }
    ],
    "menus": [
      {
        "id": 1,
        "nama_menu": "Dashboard",
        "url_link": "/admin/dashboard",
        "icon": "dashboard",
        "parent": null,
        "active": "y"
      },
      {
        "id": 2,
        "nama_menu": "Users",
        "url_link": "/admin/users",
        "icon": "people",
        "parent": null,
        "active": "y"
      }
    ]
  }
}
```

---

## 🎯 Success Criteria

✅ **Integration successful if:**
1. Edit dialog menampilkan multi-select dropdowns
2. Dropdowns terisi dengan master data (BU & Menus)
3. User's current access ter-highlight di dropdown
4. Bisa select/deselect multiple items
5. Save berhasil call 2 API endpoints (user update + access update)
6. Snackbar success message muncul
7. No console errors
8. No network errors (check DevTools)

---

## 🔧 Quick Debug Commands

```bash
# Check if Angular app running
curl -s http://localhost:4200 | head -20

# Check Laravel API health
curl http://localhost:8000/api/health

# Check if token valid
TOKEN="your-token"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/user

# Test user access endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/users/2/access

# Check business units
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/business-units

# Check menus
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/menus
```

---

**Happy Testing! 🚀**

Need help? Check:
- `API-INTEGRASI-V4.md` - Full API documentation
- Browser Console - Check for errors
- Network Tab - Check API responses
- Laravel logs - Check for backend errors
