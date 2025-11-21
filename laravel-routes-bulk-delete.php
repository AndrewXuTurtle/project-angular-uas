<?php

/**
 * Laravel Routes - Bulk Delete
 * 
 * Add this to: routes/api.php
 */

use App\Http\Controllers\CustomerController;

// Group routes that require authentication
Route::middleware(['auth:sanctum'])->group(function () {
    
    // Customer routes
    Route::prefix('customers')->group(function () {
        // Get all customers (filtered by business unit)
        Route::get('/', [CustomerController::class, 'index']);
        
        // Get single customer
        Route::get('/{id}', [CustomerController::class, 'show']);
        
        // Create customer
        Route::post('/', [CustomerController::class, 'store']);
        
        // Update customer (admin only)
        Route::put('/{id}', [CustomerController::class, 'update'])
            ->middleware('admin');
        
        // Delete single customer (admin only)
        Route::delete('/{id}', [CustomerController::class, 'destroy'])
            ->middleware('admin');
        
        // 🆕 Bulk delete (admin only) ⭐
        Route::post('/bulk-delete', [CustomerController::class, 'bulkDelete'])
            ->middleware('admin');
    });
});

/**
 * Alternative: If you don't have admin middleware
 * 
 * Create middleware: php artisan make:middleware AdminMiddleware
 */

// app/Http/Middleware/AdminMiddleware.php
/*
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        if (!$request->user() || $request->user()->level !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Admin only.'
            ], 403);
        }

        return $next($request);
    }
}
*/

// Register in app/Http/Kernel.php
/*
protected $routeMiddleware = [
    // ...
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
];
*/

/**
 * Test Bulk Delete API
 * 
 * 1. Login to get token:
 *    POST /api/login
 *    Body: {"username": "admin", "password": "Admin123"}
 * 
 * 2. Test bulk delete:
 *    POST /api/customers/bulk-delete
 *    Headers: Authorization: Bearer {token}
 *    Body: {"ids": [1, 2, 3]}
 * 
 * 3. Expected Response:
 *    {
 *      "success": true,
 *      "message": "3 customer berhasil dihapus",
 *      "data": {
 *        "deleted_count": 3,
 *        "deleted_ids": [1, 2, 3]
 *      }
 *    }
 */

