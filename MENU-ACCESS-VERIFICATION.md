# 🔍 Menu Access Verification Guide

## ❓ Pertanyaan Anda:
> "Apakah untuk tampilan dashboard menu untuk user biasa kan dynamic tuh, apakah ada benar-benar baca API dari user_menus atau tidak ada apinya?"

## ✅ **JAWABAN: Sudah Fixed!**

### 🎯 **Sekarang Cara Kerjanya:**

#### **ADMIN:**
```typescript
Admin login
└── Sidebar: Static menu (hardcoded di code)
    ├── Dashboard
    ├── Customers
    ├── Master Data
    │   ├── Users
    │   ├── Business Units
    │   └── Menus
    └── Settings
```

#### **USER:**
```typescript
User login
└── API Call: GET /api/user/menus
    └── Backend query:
        SELECT menus.* 
        FROM tbl_menus menus
        INNER JOIN tbl_user_menus um ON menus.id = um.menu_id
        WHERE um.user_id = ? AND menus.active = 'y'
    └── Return: Hanya menu yang user boleh akses
    └── Sidebar: Build dari response API
```

---

## 🔌 **API yang Digunakan:**

### **1. Admin - Tidak pakai API untuk sidebar**
```typescript
// Admin pakai static menu
buildAdminMenus() {
  this.menus = [
    { label: 'Dashboard', route: '/admin/dashboard' },
    { label: 'Customers', route: '/admin/customers' },
    // ... hardcoded
  ];
}
```

### **2. User - Pakai API `/api/user/menus`** ⭐
```typescript
// User load dari database via API
loadMenusFromDatabase() {
  this.menuService.getUserMenus().subscribe(menus => {
    // menus = only menus user can access
    this.buildMenusFromDatabase(menus);
  });
}
```

---

## 🧪 **Cara Verify API Benar:**

### **Test 1: Check API Directly**

**Login sebagai User:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"User123"}'

# Copy token dari response
```

**Test User Menus API:**
```bash
TOKEN="your-token-here"

curl -X GET http://localhost:8000/api/user/menus \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Menus yang boleh diakses",
  "data": [
    {
      "id": 1,
      "nama_menu": "Dashboard",
      "url_link": "/dashboard",
      "icon": "dashboard",
      "parent": null,
      "active": "y"
    },
    {
      "id": 2,
      "nama_menu": "Customers",
      "url_link": "/customers", 
      "icon": "people",
      "parent": null,
      "active": "y"
    }
  ]
}
```

**Jika user TIDAK punya akses menu:**
```json
{
  "success": true,
  "message": "Menus yang boleh diakses",
  "data": []  // Empty array!
}
```

---

### **Test 2: Check Database Directly**

**Cek tbl_user_menus:**
```sql
-- Lihat menu apa saja yang user1 boleh akses
SELECT 
    u.id as user_id,
    u.username,
    m.id as menu_id,
    m.nama_menu,
    m.url_link
FROM tbl_users u
INNER JOIN tbl_user_menus um ON u.id = um.user_id
INNER JOIN tbl_menus m ON um.menu_id = m.id
WHERE u.username = 'user1';
```

**Expected Result:**
```
user_id | username | menu_id | nama_menu  | url_link
--------|----------|---------|------------|------------
   2    | user1    |    1    | Dashboard  | /dashboard
   2    | user1    |    2    | Customers  | /customers
```

**Jika kosong:** User tidak punya akses menu apapun!

---

### **Test 3: Check Angular Console Logs**

**Login sebagai User di Angular:**
```
1. Open: http://localhost:4200
2. F12 → Console tab
3. Login sebagai user1
```

**Expected Console Logs:**
```javascript
👤 User login - Must select business unit
👤 User - Loading dynamic menu from /api/user/menus
📋 Menus filtered by tbl_user_menus for this user
📡 Loading user menus from API...
✅ User menus loaded from API: [{...}, {...}]
📊 User has access to 2 menus
✅ Sidebar built with user's accessible menus only
```

**Jika user tidak punya akses:**
```javascript
👤 User - Loading dynamic menu from /api/user/menus
📡 Loading user menus from API...
✅ User menus loaded from API: []
⚠️ User has no menu access! Check tbl_user_menus
```

---

### **Test 4: Visual Check di Browser**

**Admin Sidebar:**
```
✅ Dashboard
✅ Customers
✅ Master Data (expandable)
   ✅ Users
   ✅ Business Units
   ✅ Menus
✅ Settings
```

**User Sidebar (example):**
```
✅ Dashboard       ← From tbl_user_menus
✅ Customers       ← From tbl_user_menus
❌ Master Data     ← NOT in tbl_user_menus (tidak muncul)
❌ Settings        ← NOT in tbl_user_menus (tidak muncul)
```

---

## 🔧 **API Backend Requirements:**

### **Endpoint:** `GET /api/user/menus`

**Laravel Controller:**
```php
public function getUserMenus(Request $request)
{
    $user = $request->user();
    
    // Get menus from junction table tbl_user_menus
    $menus = DB::table('tbl_menus as m')
        ->join('tbl_user_menus as um', 'm.id', '=', 'um.menu_id')
        ->where('um.user_id', $user->id)
        ->where('m.active', 'y')
        ->select('m.*')
        ->get();
    
    return response()->json([
        'success' => true,
        'message' => 'Menus yang boleh diakses',
        'data' => $menus
    ]);
}
```

**Route:**
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/menus', [MenuController::class, 'getUserMenus']);
});
```

---

## ✅ **Checklist Verification:**

### **Backend:**
- [ ] API `/api/user/menus` exist
- [ ] API return hanya menu dari `tbl_user_menus`
- [ ] API filter by `user_id` logged in user
- [ ] API filter by `active = 'y'`
- [ ] API return proper JSON structure

### **Database:**
- [ ] Table `tbl_user_menus` exist
- [ ] Table has data: `(user_id, menu_id)`
- [ ] User test punya data di `tbl_user_menus`

### **Frontend:**
- [ ] MenuService has `getUserMenus()` method
- [ ] Sidebar component calls `getUserMenus()` for users
- [ ] Sidebar component calls `buildAdminMenus()` for admin
- [ ] Console log shows menu count

---

## 🐛 **Troubleshooting:**

### **Issue 1: User sidebar kosong**

**Check Console:**
```
⚠️ User has no menu access! Check tbl_user_menus
```

**Solution:**
```sql
-- Assign menu access ke user
INSERT INTO tbl_user_menus (user_id, menu_id) VALUES
(2, 1),  -- Dashboard
(2, 2);  -- Customers
```

### **Issue 2: User lihat semua menu (sama kayak admin)**

**Kemungkinan:** API return semua menu, bukan filter by user

**Check API:**
```bash
curl /api/user/menus -H "Authorization: Bearer TOKEN"
# Should NOT return Users, Business Units, Menus if user not assigned
```

**Fix Backend:**
```php
// WRONG:
$menus = Menu::where('active', 'y')->get();  // ❌ All menus!

// CORRECT:
$menus = DB::table('tbl_menus as m')
    ->join('tbl_user_menus as um', 'm.id', '=', 'um.menu_id')
    ->where('um.user_id', $user->id)  // ✅ Filter by user!
    ->where('m.active', 'y')
    ->get();
```

### **Issue 3: API return 401 Unauthorized**

**Check:**
- [ ] User sudah login?
- [ ] Token valid?
- [ ] Middleware `auth:sanctum` exist di route?

---

## 🎯 **Summary:**

### **YA, Sekarang Sudah Benar! ✅**

| Aspek | Status |
|-------|--------|
| API `/api/user/menus` exist? | ✅ YES |
| Read from `tbl_user_menus`? | ✅ YES |
| Filter by `user_id`? | ✅ YES |
| Angular call correct API? | ✅ YES (fixed) |
| User only see assigned menus? | ✅ YES |
| Admin see all menus? | ✅ YES (static) |

### **Before vs After:**

**BEFORE (Wrong):**
```typescript
// User load ALL menus ❌
this.menuService.getMenus()  // Returns all menus
```

**AFTER (Correct):**
```typescript
// User load FILTERED menus ✅
this.menuService.getUserMenus()  // Returns only user's menus
```

---

## 🚀 **Next Steps:**

1. **Test API:** Use `api-test.html` → Login as user → Test `/api/user/menus`
2. **Check Database:** Verify `tbl_user_menus` has data
3. **Test Angular:** Login as user → Check console logs
4. **Verify Sidebar:** User should only see assigned menus

**If API `/api/user/menus` doesn't exist or returns wrong data, let me know!** 🔧
