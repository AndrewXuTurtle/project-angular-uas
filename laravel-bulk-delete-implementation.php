<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Customer Controller - Bulk Delete Implementation
 * 
 * Add this method to your existing CustomerController.php
 */
class CustomerController extends Controller
{
    /**
     * Bulk delete customers (admin only)
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * Expected request body:
     * {
     *   "ids": [1, 2, 3]
     * }
     */
    public function bulkDelete(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer|exists:tbl_customers,id'
            ], [
                'ids.required' => 'IDs wajib diisi',
                'ids.array' => 'IDs harus berupa array',
                'ids.min' => 'Minimal 1 customer harus dipilih',
                'ids.*.required' => 'Setiap ID wajib diisi',
                'ids.*.integer' => 'ID harus berupa angka',
                'ids.*.exists' => 'Customer dengan ID :input tidak ditemukan'
            ]);
            
            $ids = $validated['ids'];
            
            // Check if user is admin
            $user = $request->user();
            if ($user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Hanya admin yang dapat menghapus customer.'
                ], 403);
            }
            
            // Optional: Log which customers will be deleted
            $customersToDelete = DB::table('tbl_customers')
                ->whereIn('id', $ids)
                ->select('id', 'name', 'email')
                ->get();
            
            Log::info('Bulk delete customers - Start', [
                'user_id' => $user->id,
                'username' => $user->username,
                'customer_ids' => $ids,
                'customers' => $customersToDelete
            ]);
            
            // Delete customers
            $deletedCount = DB::table('tbl_customers')
                ->whereIn('id', $ids)
                ->delete();
            
            // Log success
            Log::info('Bulk delete customers - Success', [
                'user_id' => $user->id,
                'deleted_count' => $deletedCount,
                'deleted_ids' => $ids
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus",
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
            Log::error('Bulk delete customers - Error', [
                'user_id' => $request->user()->id ?? null,
                'error_message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus customers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ALTERNATIVE: Bulk delete with transaction and cascade
     * 
     * Use this if customers have related data (orders, transactions, etc.)
     */
    public function bulkDeleteWithTransaction(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer|exists:tbl_customers,id'
            ]);
            
            $ids = $validated['ids'];
            $user = $request->user();
            
            if ($user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Hanya admin yang dapat menghapus customer.'
                ], 403);
            }
            
            $deletedCount = 0;
            
            // Use transaction for data integrity
            DB::transaction(function () use ($ids, &$deletedCount) {
                // Optional: Delete related data first
                // DB::table('tbl_orders')->whereIn('customer_id', $ids)->delete();
                // DB::table('tbl_transactions')->whereIn('customer_id', $ids)->delete();
                
                // Delete customers
                $deletedCount = DB::table('tbl_customers')
                    ->whereIn('id', $ids)
                    ->delete();
            });
            
            Log::info('Bulk delete customers with transaction', [
                'user_id' => $user->id,
                'deleted_count' => $deletedCount
            ]);
            
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus",
                'data' => ['deleted_count' => $deletedCount]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Bulk delete error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus customers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ALTERNATIVE: Bulk delete with Eloquent (if using Model)
     */
    public function bulkDeleteEloquent(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer'
            ]);
            
            $user = $request->user();
            if ($user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Using Eloquent Model
            $deletedCount = \App\Models\Customer::whereIn('id', $validated['ids'])->delete();
            
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus",
                'data' => ['deleted_count' => $deletedCount]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus customers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * ALTERNATIVE: Soft delete (keeps records with deleted_at timestamp)
     * 
     * Requires:
     * 1. Migration: $table->softDeletes();
     * 2. Model: use SoftDeletes;
     */
    public function bulkSoftDelete(Request $request)
    {
        try {
            $validated = $request->validate([
                'ids' => 'required|array|min:1',
                'ids.*' => 'required|integer'
            ]);
            
            $user = $request->user();
            if ($user->level !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized'
                ], 403);
            }
            
            // Soft delete - sets deleted_at column
            $deletedCount = \App\Models\Customer::whereIn('id', $validated['ids'])->delete();
            
            // To permanently delete: ->forceDelete()
            // To restore: Customer::whereIn('id', $ids)->restore()
            
            return response()->json([
                'success' => true,
                'message' => "{$deletedCount} customer berhasil dihapus",
                'data' => ['deleted_count' => $deletedCount]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus customers: ' . $e->getMessage()
            ], 500);
        }
    }
}

