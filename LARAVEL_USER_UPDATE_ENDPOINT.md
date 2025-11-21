# Laravel User Update Endpoint - Backend Implementation

## Fitur Baru: Expandable User Cards dengan Inline Editing

Frontend sekarang menggunakan **expandable cards** untuk menampilkan dan mengedit user:
- Card collapsed: menampilkan **ID** dan **username** saja
- Card expanded: menampilkan form lengkap dengan:
  - Basic info (full_name, level, is_active)
  - Business units checkboxes
  - Menus checkboxes
  - Tombol Save dan Delete

## Data yang Dikirim Frontend

### PUT /api/users/{id}

```json
{
  "full_name": "John Doe Updated",
  "level": "admin",
  "is_active": true,
  "business_unit_ids": [1, 2, 3],
  "menu_ids": [1, 3, 5, 7, 9]
}
```

## Backend Implementation

### File: `app/Http/Controllers/Api/UserController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\BusinessUnit;
use App\Models\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    /**
     * Get all users with their business units and menus
     * GET /api/users
     */
    public function index(Request $request)
    {
        $currentUser = Auth::user();
        
        // Only admin can view all users
        if ($currentUser->role !== 'admin' && $currentUser->level !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        // Get all users with their relationships
        $users = User::with(['businessUnits', 'menus'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Transform data to include arrays
        $usersData = $users->map(function($user) {
            return [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'full_name' => $user->full_name,
                'level' => $user->level,
                'is_active' => $user->is_active,
                'business_unit_id' => $user->business_unit_id,
                'business_unit' => $user->businessUnit ? $user->businessUnit->business_unit : null,
                'business_units' => $user->businessUnits,  // Array of accessible BUs
                'menus' => $user->menus,  // Array of accessible menus
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $usersData
        ]);
    }

    /**
     * Update user with business units and menus
     * PUT /api/users/{id}
     */
    public function update(Request $request, $id)
    {
        $currentUser = Auth::user();
        
        // Only admin can update users
        if ($currentUser->role !== 'admin' && $currentUser->level !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Validasi input
        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
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
            // Update basic user info
            if ($request->has('full_name')) {
                $user->full_name = $request->input('full_name');
            }
            if ($request->has('level')) {
                $user->level = $request->input('level');
            }
            if ($request->has('is_active')) {
                $user->is_active = $request->input('is_active');
            }
            
            $user->save();

            // Update business units (many-to-many relationship)
            if ($request->has('business_unit_ids')) {
                $businessUnitIds = $request->input('business_unit_ids');
                
                // Sync business units - this will remove old and add new
                $user->businessUnits()->sync($businessUnitIds);
            }

            // Update menus (many-to-many relationship)
            if ($request->has('menu_ids')) {
                $menuIds = $request->input('menu_ids');
                
                // Sync menus
                $user->menus()->sync($menuIds);
            }

            DB::commit();

            // Reload user with relationships
            $user->load(['businessUnits', 'menus']);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $user->full_name,
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
                'message' => 'Error updating user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     * DELETE /api/users/{id}
     */
    public function destroy($id)
    {
        $currentUser = Auth::user();
        
        // Only admin can delete users
        if ($currentUser->role !== 'admin' && $currentUser->level !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access'
            ], 403);
        }

        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found'
            ], 404);
        }

        // Prevent deleting self
        if ($user->id === $currentUser->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete your own account'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
```

### File: `app/Models/User.php`

Tambahkan relationships untuk business units dan menus:

```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'username',
        'email',
        'password',
        'full_name',
        'level',
        'is_active',
        'business_unit_id'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Primary business unit (one-to-one)
     */
    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class, 'business_unit_id');
    }

    /**
     * Multiple business units user can access (many-to-many)
     */
    public function businessUnits()
    {
        return $this->belongsToMany(
            BusinessUnit::class,
            'user_business_units',  // pivot table name
            'user_id',
            'business_unit_id'
        )->withTimestamps();
    }

    /**
     * Menus user can access (many-to-many)
     */
    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'user_menus',  // pivot table name
            'user_id',
            'menu_id'
        )->withTimestamps();
    }
}
```

## Database Migrations

### 1. Create pivot table for user-business_units

```bash
php artisan make:migration create_user_business_units_table
```

File: `database/migrations/xxxx_xx_xx_create_user_business_units_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_business_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('business_unit_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Prevent duplicate entries
            $table->unique(['user_id', 'business_unit_id']);
            
            $table->index('user_id');
            $table->index('business_unit_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_business_units');
    }
};
```

### 2. Create pivot table for user-menus

```bash
php artisan make:migration create_user_menus_table
```

File: `database/migrations/xxxx_xx_xx_create_user_menus_table.php`

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('user_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Prevent duplicate entries
            $table->unique(['user_id', 'menu_id']);
            
            $table->index('user_id');
            $table->index('menu_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('user_menus');
    }
};
```

## Routes

File: `routes/api.php`

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\BusinessUnitController;
use App\Http\Controllers\Api\MenuController;

Route::middleware(['auth:sanctum'])->group(function () {
    // Admin only - User management
    Route::middleware(['admin'])->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });
    
    // Business Units (for checkboxes)
    Route::get('/business-units', [BusinessUnitController::class, 'index']);
    
    // Menus (for checkboxes)
    Route::get('/menus', [MenuController::class, 'index']);
});
```

## Setup Steps

1. **Create migrations**:
```bash
php artisan make:migration create_user_business_units_table
php artisan make:migration create_user_menus_table
```

2. **Run migrations**:
```bash
php artisan migrate
```

3. **Update User model** - add relationships

4. **Update UserController** - add update method with sync

5. **Test with Postman**:
```bash
# Update user
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "full_name": "John Updated",
    "level": "admin",
    "is_active": true,
    "business_unit_ids": [1, 2, 3],
    "menu_ids": [1, 3, 5, 7]
  }'
```

## Key Features

✅ **Expandable Cards UI** - Clean, modern design  
✅ **Inline Editing** - Edit directly in expanded card  
✅ **Checkbox Business Units** - Multi-select BU access  
✅ **Checkbox Menus** - Multi-select menu permissions  
✅ **Save & Delete** - Actions in each card  
✅ **Real-time Updates** - Instant feedback  
✅ **Search Filter** - Find users by ID, username, name  
✅ **Many-to-Many Relationships** - Proper Laravel sync()  

Setelah implement backend ini, users page akan berfungsi dengan sempurna! 🚀
