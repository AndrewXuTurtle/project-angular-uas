# 🗑️ Customer Bulk Delete Feature

## ✨ Features Implemented

### **Frontend (Angular)**

#### **1. Checkbox Selection**
- ✅ Checkbox column di setiap row
- ✅ Master checkbox di header (select all / deselect all)
- ✅ Individual checkbox per customer
- ✅ Selection tracking dengan CDK SelectionModel

#### **2. Bulk Delete Button**
- ✅ Button muncul otomatis ketika ada item yang dipilih
- ✅ Menampilkan jumlah item yang dipilih: "Hapus Terpilih (3)"
- ✅ Button dengan icon `delete_sweep`
- ✅ Slide-in animation ketika muncul
- ✅ Hanya tampil untuk Admin

#### **3. User Experience**
- ✅ Confirmation dialog sebelum delete
- ✅ Custom message: 
  - Single: "Yakin ingin menghapus [nama]?"
  - Multiple: "Yakin ingin menghapus [count] customers?"
- ✅ Loading state saat proses delete
- ✅ Success notification dengan jumlah deleted
- ✅ Auto-refresh table setelah delete
- ✅ Auto-clear selection setelah reload

---

## 🎨 UI Components

### **Table dengan Checkbox:**
```
[✓] | Nama     | Email           | Telepon     | Alamat       | Lokasi      | Aksi
----+-----------+-----------------+-------------+--------------+-------------+------
[✓] | John Doe | john@email.com  | 08123456789 | Jl. Raya 123 | Jakarta HQ  | ✏️ 🗑️
[ ] | Jane Doe | jane@email.com  | 08198765432 | Jl. Maju 456 | Surabaya    | ✏️ 🗑️
[✓] | Bob Lee  | bob@email.com   | 08111222333 | Jl. Merdeka  | Bandung     | ✏️ 🗑️
```

### **Action Bar:**
```
[➕ Tambah Customer]  [🗑️ Hapus Terpilih (2)]  [🔄]
```

---

## 💻 Frontend Implementation

### **Component TypeScript:**

```typescript
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';

export class CustomersComponent {
  // Selection Model - multi-select enabled
  selection = new SelectionModel<Customer>(true, []);
  
  // Add 'select' column
  displayedColumns = ['select', 'name', 'email', 'phone', 'address', 'business_unit', 'actions'];
  
  // Check if all rows selected
  isAllSelected(): boolean {
    return this.selection.selected.length === this.customers.length;
  }
  
  // Toggle all rows
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(...this.customers);
    }
  }
  
  // Bulk delete method
  bulkDelete(): void {
    const selectedCount = this.selection.selected.length;
    if (selectedCount === 0) return;
    
    const confirmMessage = selectedCount === 1
      ? `Yakin ingin menghapus ${this.selection.selected[0].name}?`
      : `Yakin ingin menghapus ${selectedCount} customers?`;
    
    if (confirm(confirmMessage)) {
      const ids = this.selection.selected.map(c => c.id);
      this.customerService.bulkDelete(ids).subscribe({
        next: (response) => {
          this.snackBar.open(`${selectedCount} customer berhasil dihapus`, 'Tutup');
          this.loadCustomers(); // Refresh & clear selection
        },
        error: (error) => {
          this.snackBar.open('Gagal menghapus customers', 'Tutup');
        }
      });
    }
  }
}
```

### **Template HTML:**

```html
<!-- Bulk Delete Button (conditional) -->
<div class="actions-bar">
  <button mat-raised-button color="primary" (click)="openCreateDialog()">
    <mat-icon>add</mat-icon>
    Tambah Customer
  </button>
  
  @if (selection.selected.length > 0 && isAdmin) {
    <button mat-raised-button color="warn" (click)="bulkDelete()">
      <mat-icon>delete_sweep</mat-icon>
      Hapus Terpilih ({{ selection.selected.length }})
    </button>
  }
  
  <button mat-icon-button (click)="loadCustomers()">
    <mat-icon>refresh</mat-icon>
  </button>
</div>

<!-- Checkbox Column -->
<ng-container matColumnDef="select">
  <th mat-header-cell *matHeaderCellDef>
    @if (isAdmin) {
      <mat-checkbox
        (change)="$event ? toggleAllRows() : null"
        [checked]="selection.hasValue() && isAllSelected()"
        [indeterminate]="selection.hasValue() && !isAllSelected()">
      </mat-checkbox>
    }
  </th>
  <td mat-cell *matCellDef="let customer">
    @if (isAdmin) {
      <mat-checkbox
        (click)="$event.stopPropagation()"
        (change)="$event ? selection.toggle(customer) : null"
        [checked]="selection.isSelected(customer)">
      </mat-checkbox>
    }
  </td>
</ng-container>
```

### **Service Method:**

```typescript
export class CustomerService {
  /**
   * Bulk delete customers (admin only)
   */
  bulkDelete(ids: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/bulk-delete`, { ids });
  }
}
```

---

## 🔧 Backend Implementation (Laravel)

### **Route:**

```php
// routes/api.php
Route::middleware(['auth:sanctum'])->group(function () {
    // Bulk delete - admin only
    Route::post('/customers/bulk-delete', [CustomerController::class, 'bulkDelete'])
        ->middleware('admin');
});
```

### **Controller Method:**

```php
// app/Http/Controllers/CustomerController.php

/**
 * Bulk delete customers
 * 
 * @param Request $request
 * @return JsonResponse
 */
public function bulkDelete(Request $request)
{
    try {
        // Validate input
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'required|integer|exists:tbl_customers,id'
        ]);
        
        $ids = $validated['ids'];
        
        // Optional: Check if admin
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin only.'
            ], 403);
        }
        
        // Delete customers
        $deletedCount = DB::table('tbl_customers')
            ->whereIn('id', $ids)
            ->delete();
        
        // Log activity (optional)
        Log::info('Bulk delete customers', [
            'user_id' => $request->user()->id,
            'deleted_ids' => $ids,
            'deleted_count' => $deletedCount
        ]);
        
        return response()->json([
            'success' => true,
            'message' => "{$deletedCount} customers berhasil dihapus",
            'data' => [
                'deleted_count' => $deletedCount,
                'deleted_ids' => $ids
            ]
        ]);
        
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation error',
            'errors' => $e->errors()
        ], 422);
        
    } catch (\Exception $e) {
        Log::error('Bulk delete error: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus customers: ' . $e->getMessage()
        ], 500);
    }
}
```

### **Alternative: Using Eloquent Model**

```php
// app/Models/Customer.php
class Customer extends Model
{
    protected $table = 'tbl_customers';
    protected $guarded = [];
}

// Controller
public function bulkDelete(Request $request)
{
    $validated = $request->validate([
        'ids' => 'required|array|min:1',
        'ids.*' => 'required|integer'
    ]);
    
    $deletedCount = Customer::whereIn('id', $validated['ids'])->delete();
    
    return response()->json([
        'success' => true,
        'message' => "{$deletedCount} customers berhasil dihapus",
        'data' => ['deleted_count' => $deletedCount]
    ]);
}
```

---

## 🧪 Testing

### **Test API dengan cURL:**

```bash
# Login first
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123"}'

# Copy token
TOKEN="your-token-here"

# Bulk delete
curl -X POST http://localhost:8000/api/customers/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"ids": [1, 2, 3]}'
```

### **Expected Response:**

```json
{
  "success": true,
  "message": "3 customers berhasil dihapus",
  "data": {
    "deleted_count": 3,
    "deleted_ids": [1, 2, 3]
  }
}
```

### **Error Cases:**

**1. Empty IDs:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "ids": ["The ids field is required."]
  }
}
```

**2. Non-existent IDs:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "ids.0": ["The selected ids.0 is invalid."]
  }
}
```

**3. Unauthorized (non-admin):**
```json
{
  "success": false,
  "message": "Unauthorized. Admin only."
}
```

---

## 🎯 Key Features

### **1. Select All Functionality**
```typescript
// Header checkbox logic
[checked]="selection.hasValue() && isAllSelected()"
[indeterminate]="selection.hasValue() && !isAllSelected()"
```

**States:**
- ☐ Unchecked: No items selected
- ☑ Checked: All items selected
- ◘ Indeterminate: Some items selected

### **2. Smart Confirmation Messages**
```typescript
const confirmMessage = selectedCount === 1
  ? `Yakin ingin menghapus ${this.selection.selected[0].name}?`
  : `Yakin ingin menghapus ${selectedCount} customers?`;
```

### **3. Dynamic Button Display**
```html
@if (selection.selected.length > 0 && isAdmin) {
  <button>Hapus Terpilih ({{ selection.selected.length }})</button>
}
```

### **4. Auto-clear Selection**
```typescript
loadCustomers(): void {
  this.selection.clear(); // Clear after reload
  // ... fetch data
}
```

---

## 🔒 Security

### **Authorization:**
1. ✅ Only admin can see checkboxes
2. ✅ Only admin can see bulk delete button
3. ✅ Backend validates admin role
4. ✅ Backend validates IDs exist in database

### **Validation:**
```php
$validated = $request->validate([
    'ids' => 'required|array|min:1',           // Must be array with min 1 item
    'ids.*' => 'required|integer|exists:tbl_customers,id'  // Each ID must exist
]);
```

---

## 📊 Database Considerations

### **Soft Delete (Optional):**

If you want to keep deleted records:

```php
// Migration
Schema::table('tbl_customers', function (Blueprint $table) {
    $table->softDeletes(); // Adds deleted_at column
});

// Model
class Customer extends Model
{
    use SoftDeletes;
}

// Controller - automatically uses soft delete
$deletedCount = Customer::whereIn('id', $ids)->delete(); // Sets deleted_at

// Restore
Customer::whereIn('id', $ids)->restore();

// Permanent delete
Customer::whereIn('id', $ids)->forceDelete();
```

### **Cascade Delete (Optional):**

If customers have related data:

```php
// Before deleting customers, delete related data
DB::transaction(function () use ($ids) {
    // Delete related orders
    DB::table('tbl_orders')->whereIn('customer_id', $ids)->delete();
    
    // Delete related transactions
    DB::table('tbl_transactions')->whereIn('customer_id', $ids)->delete();
    
    // Finally delete customers
    DB::table('tbl_customers')->whereIn('id', $ids)->delete();
});
```

---

## 🚀 Performance

### **For Large Datasets:**

```php
// Use chunks to avoid memory issues
public function bulkDelete(Request $request)
{
    $ids = $request->ids;
    
    // Process in chunks of 100
    $chunks = array_chunk($ids, 100);
    $totalDeleted = 0;
    
    foreach ($chunks as $chunk) {
        $deleted = Customer::whereIn('id', $chunk)->delete();
        $totalDeleted += $deleted;
    }
    
    return response()->json([
        'success' => true,
        'message' => "{$totalDeleted} customers berhasil dihapus"
    ]);
}
```

---

## 🎨 Styling

### **Slide-in Animation:**

```scss
.actions-bar {
  button[color="warn"] {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
}
```

### **Row Hover Effect:**

```scss
tr.mat-row:hover {
  background-color: #f5f5f5;
  cursor: pointer;
}
```

---

## ✅ Checklist

### **Frontend:**
- [x] Add SelectionModel
- [x] Add checkbox column
- [x] Add master checkbox (select all)
- [x] Add bulk delete button (conditional)
- [x] Implement bulkDelete() method
- [x] Add confirmation dialog
- [x] Add loading state
- [x] Add success/error notifications
- [x] Clear selection after reload
- [x] Add animations
- [x] Admin-only visibility

### **Backend:**
- [ ] Create `/api/customers/bulk-delete` endpoint
- [ ] Add validation for IDs
- [ ] Add admin authorization
- [ ] Implement delete logic
- [ ] Add error handling
- [ ] Add logging (optional)
- [ ] Test with Postman/cURL
- [ ] Handle edge cases

---

## 🐛 Troubleshooting

### **Issue 1: Checkbox tidak muncul**

**Check:**
1. Import `MatCheckboxModule` di component imports
2. `isAdmin` property bernilai `true`
3. Column `'select'` ada di `displayedColumns`

### **Issue 2: Button tidak muncul saat ada selection**

**Check:**
```typescript
// Pastikan condition benar
@if (selection.selected.length > 0 && isAdmin) { ... }
```

### **Issue 3: API 405 Method Not Allowed**

**Fix:**
```php
// Pastikan route POST bukan GET
Route::post('/customers/bulk-delete', [CustomerController::class, 'bulkDelete']);
```

### **Issue 4: API 403 Forbidden**

**Fix:**
```php
// Check admin middleware atau role check
if (!$request->user()->level === 'admin') {
    return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
}
```

---

## 🎯 Summary

✅ **What we added:**
1. Checkbox selection per row
2. Select all / deselect all functionality
3. Dynamic bulk delete button
4. Confirmation dialog with smart messages
5. API call to `/api/customers/bulk-delete`
6. Loading states and notifications
7. Auto-refresh after delete
8. Admin-only features
9. Smooth animations

✅ **User Flow:**
1. Admin login → See checkboxes
2. Select customers (individual or all)
3. "Hapus Terpilih (X)" button appears
4. Click button → Confirmation dialog
5. Confirm → Loading → Success message
6. Table refreshes, selection cleared

✅ **Next Steps:**
1. Implement Laravel backend endpoint
2. Test API dengan Postman
3. Test end-to-end flow di browser
4. Consider adding soft delete
5. Add activity logging (optional)

---

**Created:** November 21, 2025  
**Feature:** Customer Bulk Delete with Checkbox Selection  
**Status:** ✅ Frontend Complete | ⏳ Backend Pending
