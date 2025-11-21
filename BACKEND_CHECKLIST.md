# Backend Checklist - Yang Perlu Diimplementasi

## ✅ Status: Frontend Sudah Siap
Frontend Angular sudah 100% siap dan menunggu backend Laravel untuk:
1. Customer CRUD dengan business_unit_id
2. User access management (business units + menus)

---

## 🔴 URGENT: Customer Controller

### File: `app/Http/Controllers/Api/CustomerController.php`

### Endpoints yang Harus Ada:

#### 1. GET /api/customers?business_unit_id=1
- Filter customers by business unit
- Admin bisa filter by BU, user biasa hanya lihat BU sendiri

#### 2. POST /api/customers
```json
{
  "name": "Customer Name",
  "email": "email@example.com",
  "phone": "08123456789",
  "address": "Address",
  "business_unit_id": 1  // ← WAJIB ADA
}
```
**Error saat ini**: `403 Forbidden - Business unit tidak ditemukan`

**Fix yang diperlukan**:
- Validasi `business_unit_id` harus `exists:business_units,id`
- Cek apakah business unit ada di database
- Save customer dengan `business_unit_id`

#### 3. PUT /api/customers/{id}
```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "phone": "08123456789",
  "address": "Updated Address"
}
```

**PENTING**: 
- ❌ **JANGAN** terima `business_unit_id` di update
- ❌ **JANGAN** validasi `business_unit_id` di update  
- ✅ Customer **TIDAK BISA pindah business unit** setelah dibuat
- ✅ Hanya update: name, email, phone, address

**Kenapa error?** Backend mungkin validasi `business_unit_id` di update → hapus validasi ini!

```php
// BENAR ✅
$customer->update($request->only(['name', 'email', 'phone', 'address']));

// SALAH ❌
if (!$request->business_unit_id) {
    return response()->json(['message' => 'Business unit tidak ditemukan'], 403);
}
```

#### 4. POST /api/customers/bulk-delete
```json
{
  "ids": [1, 2, 3, 4]
}
```

**Lihat detail lengkap di**: `LARAVEL_CUSTOMER_CONTROLLER.md`

---

## 🟡 PENTING: User Access Management

### File: `app/Http/Controllers/Api/UserController.php`

### Endpoints yang Harus Ada:

#### 1. GET /api/users
**Response harus include business_units dan menus**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "full_name": "John Doe",
      "level": "admin",
      "is_active": true,
      "business_units": [
        {"id": 1, "business_unit": "Batam"},
        {"id": 3, "business_unit": "Jakarta"}
      ],
      "menus": [
        {"id": 1, "nama_menu": "Dashboard"},
        {"id": 3, "nama_menu": "Users"}
      ]
    }
  ]
}
```

**Atau gunakan endpoint terpisah**:

#### 2. GET /api/users/{id}/access
Dipanggil saat user card di-expand untuk load existing access.

```json
{
  "success": true,
  "data": {
    "user": {...},
    "business_units": [{...}],
    "menus": [{...}]
  }
}
```

#### 3. PUT /api/users/{id}
```json
{
  "full_name": "John Updated",
  "level": "admin",
  "is_active": true,
  "business_unit_ids": [1, 2, 3],
  "menu_ids": [1, 3, 5, 7]
}
```

**Yang harus dilakukan**:
- Update basic fields: `full_name`, `level`, `is_active`
- Sync business units: `$user->businessUnits()->sync($businessUnitIds)`
- Sync menus: `$user->menus()->sync($menuIds)`

**PENTING - Masalah yang sering terjadi**:
- ❌ Hanya update `level` saja
- ✅ Harus update SEMUA field yang dikirim
- ✅ `is_active` harus di-update (boolean)
- ✅ `business_unit_ids` dan `menu_ids` harus di-sync
- ✅ Username **TIDAK BISA** diubah (security)

**Contoh kode yang BENAR**:
```php
// Update basic info
if ($request->has('full_name')) {
    $user->full_name = $request->full_name;
}
if ($request->has('level')) {
    $user->level = $request->level;
}
if ($request->has('is_active')) {
    $user->is_active = $request->is_active;  // ← JANGAN LUPA!
}
$user->save();

// Sync relationships
if ($request->has('business_unit_ids')) {
    $user->businessUnits()->sync($request->business_unit_ids);
}
if ($request->has('menu_ids')) {
    $user->menus()->sync($request->menu_ids);
}
```

**Lihat detail lengkap di**: `LARAVEL_USER_UPDATE_ENDPOINT.md`

---

## 📋 Database Migrations Diperlukan

### 1. Pivot Table: user_business_units
```php
Schema::create('user_business_units', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('business_unit_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'business_unit_id']);
});
```

### 2. Pivot Table: user_menus
```php
Schema::create('user_menus', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');
    $table->foreignId('menu_id')->constrained()->onDelete('cascade');
    $table->timestamps();
    $table->unique(['user_id', 'menu_id']);
});
```

### 3. Customers Table (jika belum ada)
```php
Schema::create('customers', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('phone')->nullable();
    $table->text('address')->nullable();
    $table->foreignId('business_unit_id')->constrained()->onDelete('cascade');
    $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
    $table->timestamps();
});
```

---

## 🔧 Model Relationships

### User Model
```php
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
```

### Customer Model
```php
public function businessUnit()
{
    return $this->belongsTo(BusinessUnit::class);
}
```

---

## 🎯 Testing Steps

### Test Customer Create:
```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "business_unit_id": 1
  }'
```

### Test User Access:
```bash
# Get user with access
curl http://localhost:8000/api/users/1/access \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update user access
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "business_unit_ids": [1, 2],
    "menu_ids": [1, 3, 5]
  }'
```

---

## 📝 Priority Order

1. **URGENT** - Fix Customer Create (business_unit_id validation)
2. **HIGH** - Implement Customer bulk delete
3. **MEDIUM** - Add business_units & menus to User GET response
4. **MEDIUM** - Implement User access sync (PUT /api/users/{id})

---

## 📚 Full Documentation

- **Customer Controller**: `LARAVEL_CUSTOMER_CONTROLLER.md`
- **User Access Management**: `LARAVEL_USER_UPDATE_ENDPOINT.md`

Semua kode lengkap sudah ada di file-file dokumentasi tersebut, tinggal copy-paste ke Laravel! 🚀
