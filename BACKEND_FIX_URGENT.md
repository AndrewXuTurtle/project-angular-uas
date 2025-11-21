# BACKEND FIX - URGENT

## 1. CustomerController.php - UPDATE Method

### Error: `403 - Business unit tidak ditemukan`

### ❌ MASALAH:
Backend validasi `business_unit_id` saat update customer.

### ✅ SOLUSI:

```php
public function update(Request $request, $id)
{
    $user = Auth::user();
    $customer = Customer::find($id);

    if (!$customer) {
        return response()->json([
            'success' => false,
            'message' => 'Customer tidak ditemukan'
        ], 404);
    }

    // Check access
    if ($user->level !== 'admin' && $customer->business_unit_id != $user->business_unit_id) {
        return response()->json([
            'success' => false,
            'message' => 'Anda tidak memiliki akses'
        ], 403);
    }

    // ✅ PENTING: JANGAN validasi business_unit_id!
    // ✅ Customer TIDAK BISA pindah business unit
    $validator = Validator::make($request->all(), [
        'name' => 'sometimes|required|string|max:255',
        'email' => 'sometimes|required|email|unique:customers,email,' . $id,
        'phone' => 'nullable|string|max:20',
        'address' => 'nullable|string'
        // ❌ JANGAN tambahkan: 'business_unit_id' => 'required|exists:...'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validasi gagal',
            'errors' => $validator->errors()
        ], 422);
    }

    // ✅ Update TANPA business_unit_id
    $customer->update($request->only(['name', 'email', 'phone', 'address']));

    return response()->json([
        'success' => true,
        'message' => 'Customer berhasil diupdate',
        'data' => $customer
    ]);
}
```

### 🔍 CARI DAN HAPUS:
```php
// ❌ HAPUS kode seperti ini:
if (!$request->business_unit_id) {
    return response()->json(['message' => 'Business unit tidak ditemukan...'], 403);
}

// ❌ HAPUS middleware yang cek business_unit_id
```

---

## 2. UserController.php - UPDATE Method

### Error: Response sukses tapi data tidak terupdate

### ❌ MASALAH:
Backend tidak update semua field atau tidak sync relationships.

### ✅ SOLUSI:

```php
public function update(Request $request, $id)
{
    $currentUser = Auth::user();
    
    if ($currentUser->level !== 'admin') {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized'
        ], 403);
    }

    $user = User::find($id);
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'User not found'
        ], 404);
    }

    // Validasi
    $validator = Validator::make($request->all(), [
        'level' => 'sometimes|in:admin,user',
        'is_active' => 'sometimes|boolean',
        'business_unit_ids' => 'sometimes|array',
        'business_unit_ids.*' => 'integer|exists:business_units,id',
        'menu_ids' => 'sometimes|array',
        'menu_ids.*' => 'integer|exists:menus,id'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // ✅ Update basic fields
        if ($request->has('level')) {
            $user->level = $request->level;
        }
        if ($request->has('is_active')) {
            $user->is_active = $request->is_active;  // ← JANGAN LUPA!
        }
        
        $user->save();  // ← WAJIB SAVE!

        // ✅ Sync business units
        if ($request->has('business_unit_ids')) {
            $user->businessUnits()->sync($request->business_unit_ids);
        }

        // ✅ Sync menus
        if ($request->has('menu_ids')) {
            $user->menus()->sync($request->menu_ids);
        }

        DB::commit();

        // ✅ Reload dengan relationships
        $user->load(['businessUnits', 'menus']);

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'level' => $user->level,
                'is_active' => $user->is_active,
                'business_units' => $user->businessUnits,
                'menus' => $user->menus
            ]
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ], 500);
    }
}
```

---

## 3. User Model - Relationships

```php
class User extends Authenticatable
{
    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'level',
        'is_active',
        'business_unit_id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ✅ Many-to-many relationships
    public function businessUnits()
    {
        return $this->belongsToMany(
            BusinessUnit::class,
            'user_business_units',
            'user_id',
            'business_unit_id'
        )->withTimestamps();
    }

    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'user_menus',
            'user_id',
            'menu_id'
        )->withTimestamps();
    }
}
```

---

## 4. Pivot Tables (Jika belum ada)

```bash
php artisan make:migration create_user_business_units_table
php artisan make:migration create_user_menus_table
```

### user_business_units:
```php
Schema::create('user_business_units', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('business_unit_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'business_unit_id']);
});
```

### user_menus:
```php
Schema::create('user_menus', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('menu_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'menu_id']);
});
```

---

## 5. Testing

```bash
# Test customer update
curl -X PUT http://localhost:8000/api/customers/9 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"name":"Updated Name","email":"test@test.com"}'

# Test user update  
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "level":"admin",
    "is_active":true,
    "business_unit_ids":[1,2],
    "menu_ids":[1,3,5]
  }'
```

---

## ⚠️ CHECKLIST BACKEND:

### CustomerController:
- [ ] Hapus validasi `business_unit_id` di method `update()`
- [ ] Hapus middleware/kondisi yang cek `business_unit_id` di update
- [ ] Pastikan `$customer->update($request->only(['name', 'email', 'phone', 'address']))`

### UserController:
- [ ] Update `level`, `is_active` dengan `$user->save()`
- [ ] Sync `businessUnits()` dengan `sync($request->business_unit_ids)`
- [ ] Sync `menus()` dengan `sync($request->menu_ids)`
- [ ] Return data dengan relationships: `$user->load(['businessUnits', 'menus'])`

### User Model:
- [ ] Ada method `businessUnits()` dengan `belongsToMany()`
- [ ] Ada method `menus()` dengan `belongsToMany()`

### Database:
- [ ] Table `user_business_units` exists
- [ ] Table `user_menus` exists

Copy kode di atas ke Laravel dan masalah selesai! 🚀
