# Laravel API untuk Customer Delete (Admin vs User)

## ⚠️ PENTING: Sorting Support

API Laravel sudah support **server-side sorting** dengan query parameters:

```bash
# Sort by name ascending
GET /api/customers?sort_by=name&sort_dir=asc

# Sort by email descending  
GET /api/customers?sort_by=email&sort_dir=desc

# Sort by phone dengan business unit filter
GET /api/customers?business_unit_id=1&sort_by=phone&sort_dir=asc
```

**Allowed `sort_by` values:**
- `name` - Sort by customer name
- `email` - Sort by customer email
- `phone` - Sort by phone number
- `created_at` - Sort by creation date (default)
- `updated_at` - Sort by last update date

**Allowed `sort_dir` values:**
- `asc` - Ascending (A→Z, 0→9, oldest→newest)
- `desc` - Descending (Z→A, 9→0, newest→oldest) **[default]**

---

## Masalah Yang Harus Diperbaiki

Saat ini, **admin juga harus select business unit** sebelum bisa delete customer. Padahal:
- **Admin**: Harus bisa delete customer TANPA validasi business unit
- **User biasa**: Harus divalidasi bahwa customer berada dalam business unit mereka

## API Endpoints yang Harus Diupdate

### 1. DELETE /api/customers/:id

**Controller: `CustomerController@destroy`**

```php
public function destroy(Request $request, $id)
{
    try {
        $user = $request->user();
        $customer = Customer::findOrFail($id);
        
        // ADMIN: Bisa delete customer dari business unit manapun
        if ($user->level === 'admin') {
            $customer->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Customer berhasil dihapus'
            ]);
        }
        
        // USER: Hanya bisa delete customer dari business unit mereka
        // Ambil business unit IDs yang user punya akses
        $userBusinessUnitIds = $user->businessUnits->pluck('id')->toArray();
        
        // Cek apakah customer ada di business unit user
        if (!in_array($customer->business_unit_id, $userBusinessUnitIds)) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus customer ini'
            ], 403);
        }
        
        $customer->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil dihapus'
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus customer: ' . $e->getMessage()
        ], 500);
    }
}
```

### 2. POST /api/customers/bulk-delete

**Controller: `CustomerController@bulkDelete`**

```php
public function bulkDelete(Request $request)
{
    try {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:customers,id'
        ]);
        
        $user = $request->user();
        $ids = $validated['ids'];
        
        // ADMIN: Bisa delete customer dari business unit manapun
        if ($user->level === 'admin') {
            $deletedCount = Customer::whereIn('id', $ids)->delete();
            
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus",
                'deleted_count' => $deletedCount
            ]);
        }
        
        // USER: Hanya bisa delete customer dari business unit mereka
        // Ambil business unit IDs yang user punya akses
        $userBusinessUnitIds = $user->businessUnits->pluck('id')->toArray();
        
        // Filter hanya customer yang ada di business unit user
        $customers = Customer::whereIn('id', $ids)
            ->whereIn('business_unit_id', $userBusinessUnitIds)
            ->get();
        
        $deletedCount = $customers->count();
        $requestedCount = count($ids);
        
        // Hapus customer yang valid
        Customer::whereIn('id', $customers->pluck('id'))->delete();
        
        // Jika ada customer yang tidak bisa dihapus
        if ($deletedCount < $requestedCount) {
            $deniedCount = $requestedCount - $deletedCount;
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus, {$deniedCount} customer tidak memiliki akses",
                'deleted_count' => $deletedCount,
                'denied_count' => $deniedCount
            ]);
        }
        
        return response()->json([
            'success' => true,
            'message' => "{$deletedCount} customer berhasil dihapus",
            'deleted_count' => $deletedCount
        ]);
        
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Gagal menghapus customers: ' . $e->getMessage()
        ], 500);
    }
}
```

## Struktur Routes

Pastikan routes ini ada di `routes/api.php`:

```php
Route::middleware('auth:sanctum')->group(function () {
    // Customer routes
    Route::prefix('customers')->group(function () {
        Route::get('/', [CustomerController::class, 'index']);
        Route::post('/', [CustomerController::class, 'store']);
        Route::get('/{id}', [CustomerController::class, 'show']);
        Route::put('/{id}', [CustomerController::class, 'update']);
        Route::delete('/{id}', [CustomerController::class, 'destroy']);  // DELETE single
        Route::post('/bulk-delete', [CustomerController::class, 'bulkDelete']);  // DELETE multiple
    });
});
```

## Model Relationships

Pastikan model `User` punya relationship ke `BusinessUnit`:

```php
// app/Models/User.php
class User extends Authenticatable
{
    // ... existing code ...
    
    public function businessUnits()
    {
        return $this->belongsToMany(BusinessUnit::class, 'user_business_units');
    }
}
```

Dan model `Customer` punya relationship ke `BusinessUnit`:

```php
// app/Models/Customer.php
class Customer extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'business_unit_id'
    ];
    
    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class);
    }
}
```

## Testing dengan Postman/cURL

### Test DELETE single customer (Admin)

```bash
curl -X DELETE http://your-api.test/api/customers/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
    "success": true,
    "message": "Customer berhasil dihapus"
}
```

### Test DELETE single customer (User - dengan akses)

```bash
curl -X DELETE http://your-api.test/api/customers/1 \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (success):**
```json
{
    "success": true,
    "message": "Customer berhasil dihapus"
}
```

**Expected Response (no access):**
```json
{
    "success": false,
    "message": "Anda tidak memiliki akses untuk menghapus customer ini"
}
```

### Test BULK DELETE (Admin)

```bash
curl -X POST http://your-api.test/api/customers/bulk-delete \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3, 4, 5]}'
```

**Expected Response:**
```json
{
    "success": true,
    "message": "5 customer berhasil dihapus",
    "deleted_count": 5
}
```

### Test BULK DELETE (User - partial access)

```bash
curl -X POST http://your-api.test/api/customers/bulk-delete \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids": [1, 2, 3, 4, 5]}'
```

**Expected Response (jika user hanya punya akses ke 3 dari 5 customer):**
```json
{
    "success": true,
    "message": "3 customer berhasil dihapus, 2 customer tidak memiliki akses",
    "deleted_count": 3,
    "denied_count": 2
}
```

## Summary Perubahan

### Yang TIDAK PERLU diubah di Angular:
- ✅ Service sudah benar (`customer.service.ts`)
- ✅ HTTP calls sudah benar (DELETE dan POST bulk-delete)
- ✅ Component logic sudah OK

### Yang HARUS diubah di Laravel:
1. ✅ `CustomerController@destroy` - Tambahkan logic admin vs user
2. ✅ `CustomerController@bulkDelete` - Tambahkan logic admin vs user
3. ✅ Pastikan model relationships sudah ada
4. ✅ Test dengan berbagai skenario (admin, user dengan akses, user tanpa akses)

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    DELETE REQUEST                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  Check User   │
              │     Level     │
              └───────┬───────┘
                      │
         ┌────────────┴────────────┐
         │                         │
         ▼                         ▼
    ┌─────────┐              ┌──────────┐
    │  ADMIN  │              │   USER   │
    └────┬────┘              └─────┬────┘
         │                         │
         │                         ▼
         │                  ┌──────────────────┐
         │                  │ Check BU Access  │
         │                  └─────┬────────────┘
         │                        │
         │                  ┌─────┴─────┐
         │                  │           │
         │                  ▼           ▼
         │            ┌─────────┐ ┌─────────┐
         │            │   YES   │ │   NO    │
         │            └────┬────┘ └────┬────┘
         │                 │           │
         └─────────┬───────┘           │
                   │                   │
                   ▼                   ▼
            ┌────────────┐      ┌───────────┐
            │   DELETE   │      │  ERROR    │
            │  CUSTOMER  │      │  403      │
            └────────────┘      └───────────┘
```

## Catatan Penting

1. **Admin tidak perlu validasi business unit** - Bisa delete customer dari business unit manapun
2. **User biasa harus divalidasi** - Hanya bisa delete customer dari business unit mereka
3. **Bulk delete harus tetap berjalan partial** - Jika user tidak punya akses ke beberapa customer, yang lain tetap dihapus
4. **Error handling harus jelas** - Berikan message yang informatif untuk setiap skenario
