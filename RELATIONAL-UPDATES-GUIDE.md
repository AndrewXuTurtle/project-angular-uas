# 🔗 Relational Updates - Menu & Business Unit Namen

## 📋 Problem Statement

Ketika nama Menu atau Business Unit diubah di master table, perubahan harus otomatis ter-reflect di:
- User access management (multi-select dropdown)
- Sidebar navigation
- Semua tempat yang menampilkan nama tersebut

**Solusi:** Gunakan ID reference, bukan hardcoded names.

---

## ✅ Current Implementation (Already Correct!)

### 1️⃣ **Database Structure** (Master-Detail)

```
tbl_business_units (Master)
├── id (PK)
├── business_unit ← Name here
└── active

tbl_user_business_units (Junction)
├── id
├── user_id (FK)
├── business_unit_id (FK) ← Stores ID, not name!
└── active

tbl_menu (Master)
├── id (PK)
├── nama_menu ← Name here
├── url_link
├── icon
└── active

tbl_user_menus (Junction)
├── id
├── user_id (FK)
├── menu_id (FK) ← Stores ID, not name!
└── active
```

### 2️⃣ **Angular Implementation** (Already Using IDs!)

#### User Access Update (user-form-dialog.component.ts)
```typescript
// ✅ CORRECT: Storing IDs, not names
updateUserAccess(userId, {
  business_unit_ids: [1, 2, 3],  // IDs only!
  menu_ids: [1, 2, 5, 6]         // IDs only!
})
```

#### Business Units Dropdown
```typescript
// ✅ CORRECT: Load fresh data from API every time
this.businessUnitService.getBusinessUnits().subscribe(units => {
  this.allBusinessUnits = units;  // Always latest data
});

// Display name from master data
getBusinessUnitName(id: number): string {
  const bu = this.allBusinessUnits.find(b => b.id === id);
  return bu?.business_unit || `BU #${id}`;  // Always shows current name
}
```

#### Menus Dropdown
```typescript
// ✅ CORRECT: Load fresh data from API every time
this.menuService.getMenus().subscribe(menus => {
  this.allMenus = menus;  // Always latest data
});

// Display name from master data
getMenuName(id: number): string {
  const menu = this.allMenus.find(m => m.id === id);
  return menu?.nama_menu || `Menu #${id}`;  // Always shows current name
}
```

---

## 🎯 How It Works

### Scenario 1: Update Business Unit Name

**Step 1: Admin updates BU name**
```
User edits: "Batam" → "Batam Office"
API Call: PUT /api/business-units/1
Body: { business_unit: "Batam Office" }
```

**Step 2: Name updated in database**
```sql
UPDATE tbl_business_units 
SET business_unit = 'Batam Office' 
WHERE id = 1;
```

**Step 3: Next time user edit dialog opens**
```typescript
// Load fresh data from API
GET /api/business-units  // Returns updated name!

// Response:
[
  { id: 1, business_unit: "Batam Office", active: "y" },  // ← Updated!
  { id: 2, business_unit: "Jakarta", active: "y" }
]

// Dropdown shows: "Batam Office" ✅
```

**Step 4: Junction table unchanged (still stores ID)**
```sql
-- tbl_user_business_units table:
| id | user_id | business_unit_id | active |
|----|---------|------------------|--------|
| 1  | 2       | 1                | y      |  ← Still ID=1, no change needed!

-- When displayed, fetch name from master:
SELECT bu.business_unit 
FROM tbl_user_business_units ubu
JOIN tbl_business_units bu ON ubu.business_unit_id = bu.id
WHERE ubu.user_id = 2;

-- Result: "Batam Office" ✅ (always latest name)
```

### Scenario 2: Update Menu Name

**Step 1: Admin updates menu name**
```
User edits: "Dashboard" → "Dashboard Overview"
API Call: PUT /api/menus/1
Body: { nama_menu: "Dashboard Overview" }
```

**Step 2: Name updated in database**
```sql
UPDATE tbl_menu 
SET nama_menu = 'Dashboard Overview' 
WHERE id = 1;
```

**Step 3: Sidebar automatically shows new name**
```typescript
// Sidebar loads menus on every page load
ngOnInit() {
  this.menuService.getUserMenus().subscribe(menus => {
    this.menus = menus;  // Fresh data with updated names!
  });
}

// Template displays:
{{ menu.nama_menu }}  // "Dashboard Overview" ✅
```

**Step 4: User access dropdown shows new name**
```typescript
// When opening edit user dialog:
GET /api/menus  // Returns updated name!

// Dropdown shows: "Dashboard Overview" ✅
```

---

## 🔍 Verification Checklist

### ✅ Already Correct in Your Code:

1. **Database Foreign Keys Use IDs**
   - [x] `tbl_user_business_units.business_unit_id` stores ID, not name
   - [x] `tbl_user_menus.menu_id` stores ID, not name

2. **API Stores IDs**
   - [x] `PUT /api/users/{id}/access` receives `business_unit_ids` (array of IDs)
   - [x] `PUT /api/users/{id}/access` receives `menu_ids` (array of IDs)

3. **Angular Stores IDs**
   - [x] Form controls: `business_unit_ids`, `menu_ids` (arrays of numbers)
   - [x] No hardcoded names in components

4. **Data Loaded Fresh from API**
   - [x] Every dialog open → fresh API call
   - [x] Every sidebar load → fresh API call
   - [x] Names always from master tables

5. **Display Logic Uses Lookup**
   - [x] `getBusinessUnitName(id)` looks up from master data
   - [x] `getMenuName(id)` looks up from master data
   - [x] Template displays via helper functions

---

## 🧪 Test the Relational Updates

### Test 1: Business Unit Name Change

1. **Navigate to Business Units**
2. **Edit "Batam"** → Change to "Batam Office"
3. **Save** → Success snackbar
4. **Navigate to Users**
5. **Edit any user** who has access to Batam
6. **Check dropdown** → Should show "Batam Office" ✅

### Test 2: Menu Name Change

1. **Navigate to Menus**
2. **Edit "Dashboard"** → Change to "Dashboard Overview"
3. **Save** → Success snackbar
4. **Refresh page** → Sidebar should show "Dashboard Overview" ✅
5. **Navigate to Users**
6. **Edit any user** who has access to Dashboard
7. **Check dropdown** → Should show "Dashboard Overview" ✅

### Test 3: Verify Junction Tables Unchanged

```sql
-- Before name change:
SELECT * FROM tbl_user_business_units;
-- Result: business_unit_id = 1

-- After changing "Batam" to "Batam Office":
SELECT * FROM tbl_user_business_units;
-- Result: business_unit_id = 1 (UNCHANGED!) ✅

-- Name is fetched via JOIN:
SELECT bu.business_unit 
FROM tbl_user_business_units ubu
JOIN tbl_business_units bu ON ubu.business_unit_id = bu.id
WHERE ubu.user_id = 2;
-- Result: "Batam Office" ✅
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────┐
│  Admin Updates BU   │
│  "Batam" → "Batam   │
│  Office"            │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  PUT /api/business-units/1  │
│  { business_unit: "Batam    │
│  Office" }                  │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  UPDATE tbl_business_units  │
│  SET business_unit =        │
│  'Batam Office'             │
│  WHERE id = 1               │
└──────────┬──────────────────┘
           │
           │ (Junction table unchanged!)
           │
           ▼
┌─────────────────────────────┐
│  Next API Call:             │
│  GET /api/business-units    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Response:                  │
│  [{ id: 1, business_unit:   │
│  "Batam Office" }]          │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  Angular displays updated   │
│  name in:                   │
│  • Dropdowns                │
│  • Sidebar                  │
│  • Tables                   │
│  • Everywhere!              │
└─────────────────────────────┘
```

---

## 🚀 Benefits of ID-Based References

### 1. **Automatic Name Updates**
- Change name once in master table
- All references automatically show new name
- No need to update junction tables

### 2. **Data Integrity**
- Foreign key constraints prevent orphaned records
- IDs are immutable, names can change freely
- No data inconsistency

### 3. **Performance**
- JOIN queries are efficient (indexed on ID)
- No need to update multiple tables
- Caching possible (IDs don't change)

### 4. **Scalability**
- Easy to add new BUs/Menus
- Easy to rename BUs/Menus
- No cascade updates needed

### 5. **Maintainability**
- Clear data model
- Standard relational database pattern
- Easy to understand and debug

---

## ⚠️ What NOT to Do

### ❌ BAD: Storing Names in Junction Tables
```sql
-- DON'T DO THIS!
CREATE TABLE tbl_user_business_units (
    id INT,
    user_id INT,
    business_unit_name VARCHAR(255)  -- ❌ BAD! Stores name, not ID
);

-- Problem: If you update master table name, junction table is stale!
UPDATE tbl_business_units SET business_unit = 'New Name' WHERE id = 1;
-- But tbl_user_business_units still has old name! ❌
```

### ❌ BAD: Hardcoding Names in Angular
```typescript
// DON'T DO THIS!
const businessUnits = [
  { id: 1, name: 'Batam' },      // ❌ Hardcoded!
  { id: 2, name: 'Jakarta' }     // ❌ Hardcoded!
];

// Problem: If database name changes, Angular code is stale!
```

### ✅ GOOD: Always Use API + IDs
```typescript
// DO THIS! ✅
this.businessUnitService.getBusinessUnits().subscribe(units => {
  this.businessUnits = units;  // Always fresh from database
});
```

---

## 🎉 Conclusion

**Your implementation is ALREADY CORRECT!** 

✅ All foreign keys use IDs  
✅ Angular stores IDs, not names  
✅ Fresh data loaded from API every time  
✅ Display logic uses lookup functions  
✅ Names automatically update everywhere  

**No changes needed!** The relational updates will work automatically. 🚀

---

## 📝 Quick Reference

| Action | Result | Automatic? |
|--------|--------|-----------|
| Update BU name in master | All dropdowns show new name | ✅ Yes |
| Update menu name in master | Sidebar shows new name | ✅ Yes |
| Update BU name in master | User access unchanged (still valid) | ✅ Yes |
| Delete BU from master | User access auto-deleted (cascade) | ✅ Yes |
| Create new BU | Immediately available in dropdowns | ✅ Yes |
| Create new menu | Immediately available in dropdowns | ✅ Yes |

**Everything is automatic! No manual updates needed!** 🎉
