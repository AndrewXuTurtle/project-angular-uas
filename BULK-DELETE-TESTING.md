# 🧪 Bulk Delete Testing Guide

## 📋 Prerequisites

- ✅ Angular dev server running: `npm start`
- ✅ Laravel API running: `php artisan serve`
- ✅ Database seeded with test customers
- ✅ Admin user exists (username: admin, password: Admin123)

---

## 🎯 Test Scenarios

### **Scenario 1: Select All and Delete**

**Steps:**
1. Login sebagai admin
2. Navigate ke `/customers`
3. Klik checkbox di header (select all)
4. Verify: Semua rows tercentang
5. Verify: Button "Hapus Terpilih (X)" muncul dengan jumlah benar
6. Klik button "Hapus Terpilih"
7. Confirm dialog muncul: "Yakin ingin menghapus X customers?"
8. Klik OK
9. Verify: Loading state muncul
10. Verify: Success snackbar: "X customer berhasil dihapus"
11. Verify: Table refresh otomatis
12. Verify: Checkboxes cleared

**Expected:**
✅ Semua customers terhapus dari database
✅ Table kosong atau tersisa customers lain
✅ No errors in console

---

### **Scenario 2: Select Individual Items**

**Steps:**
1. Login sebagai admin
2. Navigate ke `/customers`
3. Pilih 2-3 customers dengan klik checkbox individual
4. Verify: Master checkbox jadi indeterminate (◘)
5. Verify: Button muncul dengan count benar
6. Klik "Hapus Terpilih"
7. Confirm delete
8. Verify: Hanya selected customers yang terhapus

**Expected:**
✅ Hanya customers terpilih yang terhapus
✅ Customers lain tetap ada
✅ Selection cleared setelah refresh

---

### **Scenario 3: Select One Item**

**Steps:**
1. Select hanya 1 customer
2. Button shows: "Hapus Terpilih (1)"
3. Klik button
4. Confirmation shows: "Yakin ingin menghapus [nama customer]?"
5. Confirm

**Expected:**
✅ Message shows customer name (bukan "1 customers")
✅ 1 customer deleted successfully

---

### **Scenario 4: Deselect All**

**Steps:**
1. Select all customers
2. Klik master checkbox lagi (deselect all)
3. Verify: Semua checkbox clear
4. Verify: Button "Hapus Terpilih" hilang

**Expected:**
✅ All selections cleared
✅ Bulk delete button disappears smoothly

---

### **Scenario 5: User Role (Non-Admin)**

**Steps:**
1. Login sebagai user (non-admin)
2. Navigate ke `/customers`
3. Verify: Checkbox column tidak ada
4. Verify: Tidak ada master checkbox
5. Verify: Tidak bisa bulk delete

**Expected:**
✅ Checkboxes hidden for users
✅ No bulk delete functionality
✅ displayedColumns tidak include 'select' untuk user

---

### **Scenario 6: Delete with Refresh**

**Steps:**
1. Select beberapa customers
2. Klik bulk delete
3. Confirm
4. Wait for success message
5. Klik refresh button
6. Verify: Deleted customers tidak muncul lagi

**Expected:**
✅ Data consistent setelah refresh
✅ No phantom rows
✅ Selection cleared

---

### **Scenario 7: Cancel Confirmation**

**Steps:**
1. Select customers
2. Klik "Hapus Terpilih"
3. Dialog muncul
4. Klik Cancel / Batal

**Expected:**
✅ No deletion happens
✅ Customers still exist
✅ Selection tetap aktif
✅ Button masih visible

---

## 🔌 API Testing

### **Test 1: Valid Request**

```bash
# Login first
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123"
  }'

# Copy token from response
TOKEN="paste-token-here"

# Test bulk delete
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ids": [1, 2, 3]
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "3 customer berhasil dihapus",
  "data": {
    "deleted_count": 3,
    "deleted_ids": [1, 2, 3]
  }
}
```

---

### **Test 2: Empty IDs Array**

```bash
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ids": []
  }'
```

**Expected Response: 422 Validation Error**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "ids": ["The ids field must have at least 1 items."]
  }
}
```

---

### **Test 3: Invalid ID (Not Exist)**

```bash
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ids": [99999, 88888]
  }'
```

**Expected Response: 422 Validation Error**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "ids.0": ["The selected ids.0 is invalid."],
    "ids.1": ["The selected ids.1 is invalid."]
  }
}
```

---

### **Test 4: Unauthorized (No Token)**

```bash
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [1, 2]
  }'
```

**Expected Response: 401 Unauthorized**
```json
{
  "message": "Unauthenticated."
}
```

---

### **Test 5: Forbidden (User, not Admin)**

```bash
# Login as user
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "User123"
  }'

# Use user token
USER_TOKEN="user-token-here"

curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -d '{
    "ids": [1, 2]
  }'
```

**Expected Response: 403 Forbidden**
```json
{
  "success": false,
  "message": "Unauthorized. Hanya admin yang dapat menghapus customer."
}
```

---

### **Test 6: Invalid JSON**

```bash
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "ids": "not-an-array"
  }'
```

**Expected Response: 422 Validation Error**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "ids": ["The ids must be an array."]
  }
}
```

---

## 🔍 Browser Console Checks

### **What to Look For:**

1. **Network Tab:**
   - Request: `POST /api/customers/bulk-delete`
   - Request Body: `{"ids": [1, 2, 3]}`
   - Response Status: `200 OK`
   - Response Body: `{"success": true, ...}`

2. **Console Tab:**
   - No errors
   - No warnings
   - Successful API calls logged

3. **Application Tab:**
   - Token stored correctly
   - Business unit selected (if user)

---

## 🗄️ Database Verification

### **Before Delete:**

```sql
SELECT * FROM tbl_customers WHERE id IN (1, 2, 3);
-- Should return 3 rows
```

### **After Delete:**

```sql
SELECT * FROM tbl_customers WHERE id IN (1, 2, 3);
-- Should return 0 rows (or empty)

-- Check total count
SELECT COUNT(*) FROM tbl_customers;
-- Should be decreased by deleted count
```

---

## ✅ Checklist

### **Frontend:**
- [ ] Checkbox column appears for admin
- [ ] Checkbox column hidden for user
- [ ] Master checkbox works (select all)
- [ ] Individual checkboxes work
- [ ] Indeterminate state works (some selected)
- [ ] Bulk delete button appears when items selected
- [ ] Button shows correct count
- [ ] Button disappears when no selection
- [ ] Confirmation dialog shows correct message
- [ ] Loading state during delete
- [ ] Success message after delete
- [ ] Table refreshes after delete
- [ ] Selection cleared after refresh
- [ ] No console errors

### **Backend:**
- [ ] Route `/api/customers/bulk-delete` exists
- [ ] Route requires authentication
- [ ] Route requires admin role
- [ ] Validates IDs array
- [ ] Validates IDs exist in database
- [ ] Deletes correct customers
- [ ] Returns success response
- [ ] Returns validation errors (empty IDs)
- [ ] Returns 403 for non-admin
- [ ] Returns 401 for unauthenticated
- [ ] Logs activity (optional)
- [ ] No SQL errors

### **Integration:**
- [ ] End-to-end flow works
- [ ] Admin can bulk delete
- [ ] User cannot bulk delete
- [ ] Database updated correctly
- [ ] UI updates after delete
- [ ] No phantom data
- [ ] Performance acceptable (< 2s)

---

## 🐛 Common Issues

### **Issue 1: Button tidak muncul**

**Symptoms:** Checkbox selected tapi button tidak muncul

**Debug:**
```typescript
// Check in component
console.log('Selection count:', this.selection.selected.length);
console.log('Is admin:', this.isAdmin);
console.log('Should show button:', this.selection.selected.length > 0 && this.isAdmin);
```

**Fix:**
- Pastikan `isAdmin = true` untuk admin
- Check condition di template: `@if (selection.selected.length > 0 && isAdmin)`

---

### **Issue 2: API 405 Method Not Allowed**

**Symptoms:** POST request return 405

**Debug:**
```bash
# Check route
php artisan route:list | grep bulk-delete
```

**Fix:**
```php
// Pastikan route POST, bukan GET
Route::post('/customers/bulk-delete', [CustomerController::class, 'bulkDelete']);
```

---

### **Issue 3: Validation Error "IDs invalid"**

**Symptoms:** API return "selected ids.0 is invalid"

**Debug:**
```sql
-- Check if IDs exist
SELECT id FROM tbl_customers WHERE id IN (1, 2, 3);
```

**Fix:**
- Use existing customer IDs
- Check database has data
- Seed customers: `php artisan db:seed`

---

### **Issue 4: Selection tidak clear setelah delete**

**Symptoms:** Checkboxes masih tercentang setelah delete

**Debug:**
```typescript
loadCustomers(): void {
  this.selection.clear(); // Add this!
  // ... rest of code
}
```

---

### **Issue 5: "Cannot read property 'name' of undefined"**

**Symptoms:** Error saat menampilkan nama di confirmation

**Debug:**
```typescript
// Check if customer exists before accessing name
const confirmMessage = selectedCount === 1 && this.selection.selected[0]
  ? `Yakin ingin menghapus ${this.selection.selected[0].name}?`
  : `Yakin ingin menghapus ${selectedCount} customers?`;
```

---

## 📊 Performance Testing

### **Test Large Datasets:**

```typescript
// Generate 1000 test customers
for (let i = 0; i < 1000; i++) {
  customers.push({
    id: i,
    name: `Customer ${i}`,
    email: `customer${i}@test.com`,
    // ...
  });
}

// Test select all (should < 1s)
// Test delete 100 items (should < 3s)
```

### **Backend Performance:**

```php
// If deleting many items, use chunks
$chunks = array_chunk($ids, 100);
foreach ($chunks as $chunk) {
    Customer::whereIn('id', $chunk)->delete();
}
```

---

## 🎯 Final Verification

### **End-to-End Test:**

1. ✅ Login as admin
2. ✅ Navigate to customers page
3. ✅ See checkboxes in table
4. ✅ Select all customers
5. ✅ Click "Hapus Terpilih (X)"
6. ✅ Confirm deletion
7. ✅ See success message
8. ✅ Customers deleted from database
9. ✅ Table refreshed
10. ✅ No errors in console

**If all checks pass: ✅ Feature working correctly!**

---

## 📸 Screenshot Checklist

Take screenshots of:
- [ ] Table with checkboxes visible
- [ ] Master checkbox checked (all selected)
- [ ] Master checkbox indeterminate (some selected)
- [ ] Bulk delete button visible with count
- [ ] Confirmation dialog
- [ ] Success snackbar message
- [ ] Empty table after delete
- [ ] Network tab showing API call
- [ ] Postman successful response

---

**Created:** November 21, 2025  
**Status:** Ready for Testing  
**Next:** Implement Laravel backend → Test API → Test end-to-end
