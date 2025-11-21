# Laravel Customer Controller - Backend Implementation

## Error yang terjadi
```
POST http://localhost:8000/api/customers 403 (Forbidden)
Message: "Business unit tidak ditemukan. Silakan pilih business unit terlebih dahulu."
```

## Data yang dikirim dari Frontend
```json
{
  "name": "Nama Customer",
  "email": "email@example.com",
  "phone": "08123456789",
  "address": "Alamat customer",
  "business_unit_id": 1
}
```

## File: `app/Http/Controllers/Api/CustomerController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\BusinessUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers
     * GET /api/customers
     * Query params: ?business_unit_id=1 (optional untuk admin)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // Jika admin, bisa filter by business_unit_id dari query param
        if ($user->role === 'admin') {
            $businessUnitId = $request->query('business_unit_id');
            
            if ($businessUnitId) {
                $customers = Customer::where('business_unit_id', $businessUnitId)
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                // Jika tidak ada filter, tampilkan semua
                $customers = Customer::orderBy('created_at', 'desc')->get();
            }
        } else {
            // User biasa hanya lihat customer dari business unit mereka
            $customers = Customer::where('business_unit_id', $user->business_unit_id)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        
        return response()->json([
            'success' => true,
            'data' => $customers
        ]);
    }

    /**
     * Store a newly created customer
     * POST /api/customers
     * Body: { name, email, phone, address, business_unit_id }
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Validasi input
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'business_unit_id' => 'required|exists:business_units,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Validasi business unit
        $businessUnitId = $request->input('business_unit_id');
        $businessUnit = BusinessUnit::find($businessUnitId);
        
        if (!$businessUnit) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit tidak ditemukan. Silakan pilih business unit terlebih dahulu.'
            ], 403);
        }

        // Jika user bukan admin, hanya bisa create untuk business unit sendiri
        if ($user->role !== 'admin' && $businessUnitId != $user->business_unit_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke business unit ini'
            ], 403);
        }

        // Create customer
        $customer = Customer::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
            'address' => $request->input('address'),
            'business_unit_id' => $businessUnitId,
            'created_by' => $user->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil dibuat',
            'data' => $customer
        ], 201);
    }

    /**
     * Display the specified customer
     * GET /api/customers/{id}
     */
    public function show($id)
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
        if ($user->role !== 'admin' && $customer->business_unit_id != $user->business_unit_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke customer ini'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $customer
        ]);
    }

    /**
     * Update the specified customer
     * PUT /api/customers/{id}
     * Body: { name, email, phone, address }
     * 
     * NOTE: business_unit_id SHOULD NOT be changed after creation
     * Customer stays in their original business unit
     */
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
        if ($user->role !== 'admin' && $customer->business_unit_id != $user->business_unit_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke customer ini'
            ], 403);
        }

        // Validasi input - business_unit_id NOT ALLOWED in update
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255|unique:customers,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update customer - DO NOT update business_unit_id
        $customer->update($request->only(['name', 'email', 'phone', 'address']));

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil diupdate',
            'data' => $customer
        ]);
    }

    /**
     * Remove the specified customer
     * DELETE /api/customers/{id}
     */
    public function destroy($id)
    {
        $user = Auth::user();

        // Only admin can delete
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang bisa menghapus customer'
            ], 403);
        }

        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan'
            ], 404);
        }

        $customer->delete();

        return response()->json([
            'success' => true,
            'message' => 'Customer berhasil dihapus'
        ]);
    }

    /**
     * Bulk delete customers
     * POST /api/customers/bulk-delete
     * Body: { ids: [1, 2, 3] }
     */
    public function bulkDelete(Request $request)
    {
        $user = Auth::user();

        // Only admin can bulk delete
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya admin yang bisa menghapus customer'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:customers,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $ids = $request->input('ids');
        $deleted = Customer::whereIn('id', $ids)->delete();

        return response()->json([
            'success' => true,
            'message' => "Berhasil menghapus {$deleted} customer"
        ]);
    }
}
```

## File: `routes/api.php`

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BusinessUnitController;
use App\Http\Controllers\Api\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Business Units (admin only)
    Route::get('/business-units', [BusinessUnitController::class, 'index']);
    
    // Customers
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers/{id}', [CustomerController::class, 'show']);
    Route::put('/customers/{id}', [CustomerController::class, 'update']);
    Route::delete('/customers/{id}', [CustomerController::class, 'destroy']);
    Route::post('/customers/bulk-delete', [CustomerController::class, 'bulkDelete']);
    
    // Users (admin only)
    Route::middleware(['admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
});
```

## File: `app/Models/Customer.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'business_unit_id',
        'created_by'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the business unit that owns the customer
     */
    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class);
    }

    /**
     * Get the user who created the customer
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
```

## Database Migration

Jika belum ada, buat migration untuk tabel customers:

```bash
php artisan make:migration create_customers_table
```

File: `database/migrations/xxxx_xx_xx_create_customers_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Support;

return new class extends Migration
{
    public function up()
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->foreignId('business_unit_id')->constrained()->onDelete('cascade');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('business_unit_id');
            $table->index('created_by');
        });
    }

    public function down()
    {
        Schema::dropIfExists('customers');
    }
};
```

## Langkah-langkah Setup Backend:

1. **Buat Controller** (jika belum ada):
```bash
php artisan make:controller Api/CustomerController
```

2. **Buat Model** (jika belum ada):
```bash
php artisan make:model Customer
```

3. **Buat Migration** (jika belum ada):
```bash
php artisan make:migration create_customers_table
```

4. **Copy kode di atas** ke file masing-masing

5. **Run migration**:
```bash
php artisan migrate
```

6. **Clear cache** (optional):
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

7. **Test endpoint** dengan Postman atau curl:
```bash
# Create customer
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Customer",
    "email": "test@example.com",
    "phone": "08123456789",
    "address": "Test Address",
    "business_unit_id": 1
  }'
```

## Poin Penting:

1. ✅ **Validasi business_unit_id** - memastikan business unit exists
2. ✅ **Admin bisa create untuk semua BU** - user biasa hanya untuk BU sendiri
3. ✅ **Response format konsisten** - { success, message, data }
4. ✅ **Error handling lengkap** - 403, 404, 422
5. ✅ **Bulk delete support** - untuk fitur checkbox multiple delete
6. ✅ **Query parameter filtering** - ?business_unit_id=1 untuk admin

Setelah implement backend ini, frontend akan bisa create customer dengan sukses! 🚀
