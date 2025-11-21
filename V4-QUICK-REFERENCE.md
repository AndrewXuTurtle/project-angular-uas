# 🚀 V4 API Integration - Quick Reference

## ✨ What Changed?

### Before (V3)
- User → 1 Business Unit
- Menus dengan permission matrix (c,r,u,d)

### After (V4)  
- User → **Many** Business Units ✅
- User → **Many** Menus ✅
- Master-Detail architecture dengan junction tables

---

## 📂 Files Modified

```
src/app/
├── models/
│   └── user.model.ts ✅ (Already had UserAccess interfaces)
├── services/
│   └── user.service.ts ✅ (Already had getUserAccess & updateUserAccess)
└── users/
    ├── user-form-dialog.component.ts ✅ NEW - Multi-select UI
    ├── users.component.ts ✅ NEW - Updated dialog width & save logic
    └── users.component.html ✅ NEW - Added Full Name column
```

---

## 🎯 New Features in Edit User Dialog

### 1️⃣ Basic Information (Unchanged)
- Username
- Full Name
- Email
- Level (Admin/User)
- Active Status

### 2️⃣ Access Management (NEW!)
**Business Units Multi-Select:**
- Select multiple BUs user can access
- Shows selected count: "2 selected"
- Displays chips for selected items
- Auto-loads current user access

**Menus Multi-Select:**
- Select multiple menus user can access
- Shows selected count: "5 selected"
- Displays chips for selected items
- Auto-loads current user access

---

## 🔌 API Endpoints Used

### Load Access Data (Edit Mode)
```
GET /api/business-units        → Populate dropdown
GET /api/menus                 → Populate dropdown
GET /api/users/{id}/access     → Pre-select current access
```

### Save Changes
```
PUT /api/users/{id}            → Update basic info
PUT /api/users/{id}/access     → Update access (BUs & Menus)
```

---

## 💾 Request Format

### Update User Access
```json
PUT /api/users/2/access

{
  "business_unit_ids": [1, 2, 3],
  "menu_ids": [1, 2, 5, 6, 7]
}
```

### Response Format
```json
{
  "success": true,
  "message": "User access updated successfully",
  "data": {
    "user": {...},
    "business_units": [...],
    "menus": [...]
  }
}
```

---

## ✅ Quick Test

1. **Start Apps:**
   ```bash
   # Terminal 1: Laravel
   cd path/to/laravel
   php artisan serve
   
   # Terminal 2: Angular
   cd path/to/angular
   npm start
   ```

2. **Login:**
   - URL: `http://localhost:4200`
   - Username: `admin`
   - Password: `Admin123`

3. **Test Edit:**
   - Navigate: Sidebar → Master Data → Users
   - Click: Edit button (pencil icon) on any user
   - Check: Multi-select dropdowns appear
   - Try: Select/deselect Business Units
   - Try: Select/deselect Menus
   - Click: Update button
   - Verify: Success snackbar appears

4. **Verify API Calls:**
   - Open DevTools → Network tab
   - Filter: XHR
   - Look for: `/api/users/2/access` (GET & PUT)

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on `/access` endpoint | Laravel API endpoint belum dibuat |
| Dropdown kosong | Check GET `/api/business-units` & `/api/menus` |
| Loading tidak hilang | Check API response format: `{success, message, data}` |
| Selected items tidak muncul | Verify `getUserAccess()` returns correct IDs |
| CORS error | Update Laravel CORS config untuk `http://localhost:4200` |

---

## 📚 Documentation

- **Full API Docs:** `API-INTEGRASI-V4.md`
- **Testing Guide:** `TESTING-V4-INTEGRATION.md`
- **Change Summary:** `V4-INTEGRATION-SUMMARY.md`
- **This File:** `V4-QUICK-REFERENCE.md`

---

## 🎨 UI Preview

```
┌─────────────────────────────────────────┐
│  Edit User: john.doe                    │
├─────────────────────────────────────────┤
│                                         │
│  👤 Basic Information                   │
│  ├─ Username: john.doe                  │
│  ├─ Full Name: John Doe                 │
│  ├─ Email: john@example.com             │
│  ├─ Level: User ▼                       │
│  └─ ✓ Active User                       │
│                                         │
│  🔑 Access Management                   │
│                                         │
│  🏢 Business Units                      │
│  ┌───────────────────────────────────┐  │
│  │ [Batam] [Jakarta]              ▼ │  │
│  └───────────────────────────────────┘  │
│  2 business units selected              │
│                                         │
│  📋 Menus                               │
│  ┌───────────────────────────────────┐  │
│  │ [Dashboard] [Users] [Reports]  ▼ │  │
│  └───────────────────────────────────┘  │
│  3 menus selected                       │
│                                         │
├─────────────────────────────────────────┤
│                  [Cancel]  [Update ✓]  │
└─────────────────────────────────────────┘
```

---

## 🔥 Key Benefits

✅ **Flexible Access Control**
- User dapat akses multiple Business Units
- User dapat akses multiple Menus
- Easy grant/revoke access

✅ **Better UX**
- One dialog untuk semua settings
- Visual chips untuk selected items
- Auto-load current access
- Selection count indicator

✅ **Efficient API**
- One call untuk get all access
- One call untuk update all access
- Parallel loading dengan forkJoin

✅ **Scalable Architecture**
- Master-Detail pattern
- Junction tables for flexibility
- Easy to extend

---

**🎉 Integration Complete!**

Angular frontend siap digunakan dengan Laravel API V4.
Test semua fitur sesuai checklist di `TESTING-V4-INTEGRATION.md`.
