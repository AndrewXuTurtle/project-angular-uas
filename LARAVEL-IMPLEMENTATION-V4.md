# Laravel API V4 - Implementation Examples

> 🎯 Reference code untuk Laravel backend developer

---

## 📂 File Structure

```
app/
├── Models/
│   ├── User.php
│   ├── BusinessUnit.php
│   ├── Menu.php
│   ├── UserBusinessUnit.php (NEW)
│   └── UserMenu.php (NEW)
├── Http/
│   └── Controllers/
│       └── UserController.php (UPDATE)
└── ...
routes/
└── api.php (UPDATE)
```

---

## 🔨 Models

### UserBusinessUnit.php (NEW)
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserBusinessUnit extends Model
{
    protected $table = 'tbl_user_business_units';
    
    protected $fillable = [
        'user_id',
        'business_unit_id',
        'active'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'business_unit_id' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function businessUnit()
    {
        return $this->belongsTo(BusinessUnit::class, 'business_unit_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', 'y');
    }
}
```

### UserMenu.php (NEW)
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserMenu extends Model
{
    protected $table = 'tbl_user_menus';
    
    protected $fillable = [
        'user_id',
        'menu_id',
        'active'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'menu_id' => 'integer',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function menu()
    {
        return $this->belongsTo(Menu::class, 'menu_id');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', 'y');
    }
}
```

### Update User.php
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $table = 'tbl_user';
    
    protected $fillable = [
        'username',
        'password',
        'full_name',
        'email',
        'level',
        'is_active'
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // NEW: Relationships for V4
    public function businessUnits()
    {
        return $this->belongsToMany(
            BusinessUnit::class,
            'tbl_user_business_units',
            'user_id',
            'business_unit_id'
        )->wherePivot('active', 'y');
    }

    public function menus()
    {
        return $this->belongsToMany(
            Menu::class,
            'tbl_user_menus',
            'user_id',
            'menu_id'
        )->wherePivot('active', 'y');
    }

    // Helper: Get all accessible BU IDs
    public function getAccessibleBusinessUnitIds()
    {
        return $this->businessUnits()->pluck('id')->toArray();
    }

    // Helper: Get all accessible menu IDs
    public function getAccessibleMenuIds()
    {
        return $this->menus()->pluck('id')->toArray();
    }
}
```

---

## 🎛️ Controller

### UserController.php (Add these methods)

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BusinessUnit;
use App\Models\Menu;
use App\Models\UserBusinessUnit;
use App\Models\UserMenu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * GET /api/users/{id}/access
     * Get user's accessible business units and menus
     * 
     * @OA\Get(
     *     path="/api/users/{id}/access",
     *     summary="Get user access",
     *     tags={"Users"},
     *     @OA\Parameter(name="id", in="path", required=true),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function getUserAccess($id)
    {
        $user = User::findOrFail($id);

        // Get accessible business units (active only)
        $businessUnits = $user->businessUnits()
            ->where('tbl_business_units.active', 'y')
            ->get();

        // Get accessible menus (active only)
        $menus = $user->menus()
            ->where('tbl_menu.active', 'y')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'User access retrieved successfully',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'full_name' => $user->full_name,
                    'email' => $user->email,
                    'level' => $user->level,
                    'is_active' => $user->is_active
                ],
                'business_units' => $businessUnits->map(function($bu) {
                    return [
                        'id' => $bu->id,
                        'business_unit' => $bu->business_unit,
                        'active' => $bu->active
                    ];
                }),
                'menus' => $menus->map(function($menu) {
                    return [
                        'id' => $menu->id,
                        'nama_menu' => $menu->nama_menu,
                        'url_link' => $menu->url_link,
                        'icon' => $menu->icon,
                        'parent' => $menu->parent,
                        'active' => $menu->active
                    ];
                })
            ]
        ]);
    }

    /**
     * PUT /api/users/{id}/access
     * Update user's accessible business units and menus
     * 
     * @OA\Put(
     *     path="/api/users/{id}/access",
     *     summary="Update user access",
     *     tags={"Users"},
     *     @OA\Parameter(name="id", in="path", required=true),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="business_unit_ids", type="array", @OA\Items(type="integer")),
     *             @OA\Property(property="menu_ids", type="array", @OA\Items(type="integer"))
     *         )
     *     ),
     *     @OA\Response(response=200, description="Success")
     * )
     */
    public function updateUserAccess(Request $request, $id)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'business_unit_ids' => 'required|array',
            'business_unit_ids.*' => 'integer|exists:tbl_business_units,id',
            'menu_ids' => 'required|array',
            'menu_ids.*' => 'integer|exists:tbl_menu,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($id);

        DB::beginTransaction();
        try {
            // Update Business Units access
            $this->syncUserBusinessUnits($user->id, $request->business_unit_ids);

            // Update Menus access
            $this->syncUserMenus($user->id, $request->menu_ids);

            DB::commit();

            // Return updated access
            return $this->getUserAccess($id);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user access',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync user business units
     * Remove old assignments, add new ones
     */
    private function syncUserBusinessUnits($userId, $businessUnitIds)
    {
        // Mark all existing as inactive
        UserBusinessUnit::where('user_id', $userId)
            ->update(['active' => 'n']);

        // Add/activate selected BUs
        foreach ($businessUnitIds as $buId) {
            UserBusinessUnit::updateOrCreate(
                [
                    'user_id' => $userId,
                    'business_unit_id' => $buId
                ],
                ['active' => 'y']
            );
        }

        // Optional: Delete inactive records (hard delete)
        // UserBusinessUnit::where('user_id', $userId)
        //     ->where('active', 'n')
        //     ->delete();
    }

    /**
     * Sync user menus
     * Remove old assignments, add new ones
     */
    private function syncUserMenus($userId, $menuIds)
    {
        // Mark all existing as inactive
        UserMenu::where('user_id', $userId)
            ->update(['active' => 'n']);

        // Add/activate selected menus
        foreach ($menuIds as $menuId) {
            UserMenu::updateOrCreate(
                [
                    'user_id' => $userId,
                    'menu_id' => $menuId
                ],
                ['active' => 'y']
            );
        }

        // Optional: Delete inactive records (hard delete)
        // UserMenu::where('user_id', $userId)
        //     ->where('active', 'n')
        //     ->delete();
    }
}
```

---

## 🛣️ Routes

### api.php

```php
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::middleware('auth:sanctum')->group(function () {
    
    // Existing user routes
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // NEW: V4 User Access routes
    Route::get('/users/{id}/access', [UserController::class, 'getUserAccess']);
    Route::put('/users/{id}/access', [UserController::class, 'updateUserAccess']);
});
```

---

## 🗄️ Migrations

### Create Junction Tables Migration

```bash
php artisan make:migration create_user_access_junction_tables
```

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Junction table: User <-> Business Units
        Schema::create('tbl_user_business_units', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('business_unit_id');
            $table->enum('active', ['y', 'n'])->default('y');
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')
                ->references('id')
                ->on('tbl_user')
                ->onDelete('cascade');
            
            $table->foreign('business_unit_id')
                ->references('id')
                ->on('tbl_business_units')
                ->onDelete('cascade');

            // Prevent duplicates
            $table->unique(['user_id', 'business_unit_id']);

            // Indexes
            $table->index('user_id');
            $table->index('business_unit_id');
            $table->index(['user_id', 'business_unit_id', 'active']);
        });

        // Junction table: User <-> Menus
        Schema::create('tbl_user_menus', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('menu_id');
            $table->enum('active', ['y', 'n'])->default('y');
            $table->timestamps();

            // Foreign keys
            $table->foreign('user_id')
                ->references('id')
                ->on('tbl_user')
                ->onDelete('cascade');
            
            $table->foreign('menu_id')
                ->references('id')
                ->on('tbl_menu')
                ->onDelete('cascade');

            // Prevent duplicates
            $table->unique(['user_id', 'menu_id']);

            // Indexes
            $table->index('user_id');
            $table->index('menu_id');
            $table->index(['user_id', 'menu_id', 'active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('tbl_user_menus');
        Schema::dropIfExists('tbl_user_business_units');
    }
};
```

### Run Migration
```bash
php artisan migrate
```

---

## 🌱 Seeders (Optional)

### UserAccessSeeder.php

```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\BusinessUnit;
use App\Models\Menu;
use App\Models\UserBusinessUnit;
use App\Models\UserMenu;

class UserAccessSeeder extends Seeder
{
    public function run()
    {
        // Admin gets all access
        $admin = User::where('username', 'admin')->first();
        if ($admin) {
            // All Business Units
            $allBUs = BusinessUnit::where('active', 'y')->pluck('id');
            foreach ($allBUs as $buId) {
                UserBusinessUnit::create([
                    'user_id' => $admin->id,
                    'business_unit_id' => $buId,
                    'active' => 'y'
                ]);
            }

            // All Menus
            $allMenus = Menu::where('active', 'y')->pluck('id');
            foreach ($allMenus as $menuId) {
                UserMenu::create([
                    'user_id' => $admin->id,
                    'menu_id' => $menuId,
                    'active' => 'y'
                ]);
            }
        }

        // Regular users get limited access
        $user1 = User::where('username', 'user1')->first();
        if ($user1) {
            // Batam & Jakarta
            UserBusinessUnit::create([
                'user_id' => $user1->id,
                'business_unit_id' => 1,
                'active' => 'y'
            ]);
            UserBusinessUnit::create([
                'user_id' => $user1->id,
                'business_unit_id' => 2,
                'active' => 'y'
            ]);

            // Dashboard & Reports only
            UserMenu::create([
                'user_id' => $user1->id,
                'menu_id' => 1, // Dashboard
                'active' => 'y'
            ]);
            UserMenu::create([
                'user_id' => $user1->id,
                'menu_id' => 3, // Reports
                'active' => 'y'
            ]);
        }
    }
}
```

```bash
php artisan db:seed --class=UserAccessSeeder
```

---

## 🧪 Testing

### Test with Artisan Tinker

```bash
php artisan tinker
```

```php
// Get user with access
$user = App\Models\User::find(1);
$user->businessUnits; // Collection of BUs
$user->menus;         // Collection of menus

// Get accessible IDs
$user->getAccessibleBusinessUnitIds(); // [1, 2, 3]
$user->getAccessibleMenuIds();         // [1, 2, 5, 6]

// Update access
$user->businessUnits()->sync([1, 2, 3]); // Laravel built-in sync
$user->menus()->sync([1, 2, 5]);
```

### Test with cURL

```bash
# Get user access
curl -X GET http://localhost:8000/api/users/1/access \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update user access
curl -X PUT http://localhost:8000/api/users/1/access \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_unit_ids": [1, 2, 3],
    "menu_ids": [1, 2, 5, 6]
  }'
```

---

## 📊 Response Examples

### Success: Get User Access
```json
{
  "success": true,
  "message": "User access retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "full_name": "Administrator",
      "email": "admin@example.com",
      "level": "admin",
      "is_active": true
    },
    "business_units": [
      {
        "id": 1,
        "business_unit": "Batam",
        "active": "y"
      },
      {
        "id": 2,
        "business_unit": "Jakarta",
        "active": "y"
      }
    ],
    "menus": [
      {
        "id": 1,
        "nama_menu": "Dashboard",
        "url_link": "/admin/dashboard",
        "icon": "dashboard",
        "parent": null,
        "active": "y"
      }
    ]
  }
}
```

### Success: Update User Access
```json
{
  "success": true,
  "message": "User access retrieved successfully",
  "data": {
    "user": {...},
    "business_units": [...],
    "menus": [...]
  }
}
```

### Error: Validation Failed
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "business_unit_ids": [
      "The business unit ids field is required."
    ],
    "menu_ids.0": [
      "The selected menu_ids.0 is invalid."
    ]
  }
}
```

---

## 🔐 Authorization (Optional)

### Add Policy for Access Management

```php
// app/Policies/UserPolicy.php

public function manageAccess(User $authUser, User $targetUser)
{
    // Only admin can manage access
    if ($authUser->level === 'admin') {
        return true;
    }

    // Users can manage their own access (if allowed)
    return $authUser->id === $targetUser->id;
}
```

### Use in Controller

```php
public function updateUserAccess(Request $request, $id)
{
    $user = User::findOrFail($id);
    
    // Check authorization
    $this->authorize('manageAccess', $user);
    
    // ... rest of code
}
```

---

## 📝 Notes

### Alternative: Use Laravel's sync()
Instead of custom `syncUserBusinessUnits()`, you can use Laravel's built-in:

```php
// Simpler approach using Laravel's sync
public function updateUserAccess(Request $request, $id)
{
    $user = User::findOrFail($id);
    
    DB::beginTransaction();
    try {
        // Sync will automatically add/remove relations
        $user->businessUnits()->sync($request->business_unit_ids);
        $user->menus()->sync($request->menu_ids);
        
        DB::commit();
        return $this->getUserAccess($id);
    } catch (\Exception $e) {
        DB::rollBack();
        throw $e;
    }
}
```

**Note:** This uses hard delete. If you need soft delete (active='y'/'n'), use the custom sync methods.

---

**Laravel Implementation Complete! 🎉**

Use this code as reference untuk implement V4 API endpoints di Laravel backend.
