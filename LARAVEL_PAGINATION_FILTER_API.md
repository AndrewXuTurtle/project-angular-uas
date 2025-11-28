# Laravel API: Pagination & Filtering untuk Customers

## 📋 Overview

Dokumentasi lengkap implementasi **server-side pagination** dan **filtering/search** untuk Customer API.

## 🎯 API Specification

### Endpoint: `GET /api/customers`

**Base URL:** `/api/customers`

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `business_unit_id` | integer | No | - | Filter by business unit ID |
| `search` | string | No | - | Search in name, email, phone |
| `sort_by` | string | No | `created_at` | Column to sort by |
| `sort_dir` | string | No | `desc` | Sort direction (asc/desc) |
| `page` | integer | No | `1` | Page number (1-based) |
| `per_page` | integer | No | `10` | Records per page |

---

## 🔧 Laravel Implementation

### 1. Update CustomerController@index

```php
<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Http\Resources\CustomerResource;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    /**
     * Display a listing of customers with pagination, filtering, and sorting
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $token = $user->currentAccessToken();
        
        // ========================================
        // SORTING
        // ========================================
        $allowedSorts = ['name', 'email', 'phone', 'created_at', 'updated_at'];
        $sortBy = $request->query('sort_by', 'created_at');
        $sortDir = strtolower($request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }
        
        // ========================================
        // PAGINATION
        // ========================================
        $perPage = $request->query('per_page', 10);
        $perPage = min(max((int)$perPage, 1), 100); // Limit between 1-100
        
        // ========================================
        // FILTERING / SEARCH
        // ========================================
        $search = $request->query('search');

        // ========================================
        // ADMIN FLOW: dengan business_unit_id filter
        // ========================================
        if ($request->has('business_unit_id')) {
            $businessUnitId = $request->business_unit_id;

            $query = Customer::where('business_unit_id', $businessUnitId)
                ->with('businessUnit');
            
            // Apply search filter
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('phone', 'LIKE', "%{$search}%");
                });
            }
            
            // Apply sorting
            $query->orderBy($sortBy, $sortDir);
            
            // Apply pagination
            $customers = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'message' => 'Customers retrieved successfully',
                'data' => [
                    'data' => CustomerResource::collection($customers->items()),
                    'current_page' => $customers->currentPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                    'last_page' => $customers->lastPage(),
                    'from' => $customers->firstItem(),
                    'to' => $customers->lastItem()
                ]
            ]);
        }

        // ========================================
        // USER FLOW: business unit dari token
        // ========================================
        if (!$token || !$token->business_unit_id) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit tidak ditemukan. Silakan pilih business unit terlebih dahulu.'
            ], 403);
        }
        
        $selectedBU = \App\Models\BusinessUnit::find($token->business_unit_id);
        
        if (!$selectedBU) {
            return response()->json([
                'success' => false,
                'message' => 'Business unit tidak valid.'
            ], 403);
        }
        
        // Get customers by business unit name (location)
        $query = Customer::whereHas('businessUnit', function($q) use ($selectedBU) {
                $q->where('business_unit', $selectedBU->business_unit);
            })->with('businessUnit');
        
        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('phone', 'LIKE', "%{$search}%");
            });
        }
        
        // Apply sorting
        $query->orderBy($sortBy, $sortDir);
        
        // Apply pagination
        $customers = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'message' => 'Customers retrieved successfully',
            'data' => [
                'data' => CustomerResource::collection($customers->items()),
                'current_page' => $customers->currentPage(),
                'per_page' => $customers->perPage(),
                'total' => $customers->total(),
                'last_page' => $customers->lastPage(),
                'from' => $customers->firstItem(),
                'to' => $customers->lastItem()
            ]
        ]);
    }
}
```

---

## 📊 Response Format

### Success Response (Paginated)

```json
{
    "success": true,
    "message": "Customers retrieved successfully",
    "data": {
        "data": [
            {
                "id": 1,
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "081234567890",
                "address": "Jl. Example No. 123",
                "business_unit_id": 1,
                "business_unit": {
                    "id": 1,
                    "business_unit": "Batam"
                },
                "created_at": "2025-01-01T10:00:00.000000Z",
                "updated_at": "2025-01-01T10:00:00.000000Z"
            },
            // ... more customers
        ],
        "current_page": 1,
        "per_page": 10,
        "total": 50,
        "last_page": 5,
        "from": 1,
        "to": 10
    }
}
```

---

## 🧪 Testing Examples

### Example 1: Basic Pagination

```bash
# Get page 1 with 10 records
curl -X GET "http://localhost:8000/api/customers?page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 2: Pagination + Sorting

```bash
# Get page 2, 20 records per page, sorted by name ascending
curl -X GET "http://localhost:8000/api/customers?page=2&per_page=20&sort_by=name&sort_dir=asc" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 3: Search + Pagination

```bash
# Search "john" in name/email/phone, page 1, 10 records
curl -X GET "http://localhost:8000/api/customers?search=john&page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Example 4: Full Combination (Admin)

```bash
# Business Unit 1, search "gmail", sort by email desc, page 1, 20 records
curl -X GET "http://localhost:8000/api/customers?business_unit_id=1&search=gmail&sort_by=email&sort_dir=desc&page=1&per_page=20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Example 5: User with Search

```bash
# Regular user (BU from token), search "081", page 1, 10 records
curl -X GET "http://localhost:8000/api/customers?search=081&page=1&per_page=10" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

---

## 🔍 Search Implementation Details

### Search Columns:
- `name` - Customer name
- `email` - Customer email
- `phone` - Customer phone number

### Search Logic:
```php
$query->where(function($q) use ($search) {
    $q->where('name', 'LIKE', "%{$search}%")
      ->orWhere('email', 'LIKE', "%{$search}%")
      ->orWhere('phone', 'LIKE', "%{$search}%");
});
```

### Search Behavior:
- **Case-insensitive** (MySQL default LIKE behavior)
- **Partial match** - Searches anywhere in the text
- **OR condition** - Matches any of the three fields

---

## 📄 Pagination Details

### Default Values:
- **Default page:** 1
- **Default per_page:** 10
- **Max per_page:** 100 (to prevent abuse)
- **Min per_page:** 1

### Pagination Metadata:
```json
{
    "current_page": 1,    // Current page number
    "per_page": 10,       // Records per page
    "total": 50,          // Total records in database
    "last_page": 5,       // Total number of pages
    "from": 1,            // First record number on current page
    "to": 10              // Last record number on current page
}
```

### Calculate Total Pages:
```
last_page = ceil(total / per_page)
Example: ceil(50 / 10) = 5 pages
```

---

## 🎯 Angular Integration

### CustomerService Already Updated:
```typescript
getAll(
  businessUnitId?: number, 
  sortBy?: string, 
  sortDir?: string,
  search?: string,      // NEW
  page?: number,        // NEW
  perPage?: number      // NEW
): Observable<ApiResponse<Customer[]>>
```

### Component Call Example:
```typescript
this.customerService.getAll(
  this.selectedBusinessUnitId || undefined,
  this.sortActive,           // 'name', 'email', 'phone', 'created_at'
  this.sortDirection,        // 'asc' or 'desc'
  this.searchText || undefined,  // Search query
  this.pageIndex + 1,        // Page number (1-based)
  this.pageSize              // Records per page
).subscribe(...)
```

---

## 🚀 Performance Considerations

### Database Indexes (Recommended):

```sql
-- Add indexes for better search performance
ALTER TABLE customers ADD INDEX idx_name (name);
ALTER TABLE customers ADD INDEX idx_email (email);
ALTER TABLE customers ADD INDEX idx_phone (phone);
ALTER TABLE customers ADD INDEX idx_business_unit_id (business_unit_id);
ALTER TABLE customers ADD INDEX idx_created_at (created_at);

-- Composite index for common queries
ALTER TABLE customers ADD INDEX idx_bu_name (business_unit_id, name);
```

### Query Optimization:
1. **Limit per_page** to max 100 to prevent slow queries
2. **Use indexes** on searchable and sortable columns
3. **Eager load** relationships with `with('businessUnit')`
4. **Consider caching** for frequently accessed data

---

## 🎨 Frontend Features

### Search UI:
- ✅ Search input dengan icon
- ✅ Clear button (X) saat ada text
- ✅ Enter key untuk trigger search
- ✅ Search button

### Pagination UI:
- ✅ MatPaginator dengan server-side binding
- ✅ Show total records: "Showing 1-10 of 50"
- ✅ First/Last page buttons
- ✅ Page size options: 10, 20, 30, 50

### Sorting UI:
- ✅ Clickable headers dengan arrow indicators
- ✅ Visual feedback (hover, active)
- ✅ Toggle asc/desc

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  User Actions: Search "john" + Sort "name asc" + Page 2     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Angular sends GET request:                                 │
│  /api/customers?search=john&sort_by=name&sort_dir=asc       │
│  &page=2&per_page=10&business_unit_id=1                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Laravel Controller:                                        │
│  1. Validate & sanitize parameters                          │
│  2. Build query: where + search + orderBy                   │
│  3. Apply pagination: paginate(10)                          │
│  4. Execute query with indexes                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Database:                                                  │
│  SELECT * FROM customers                                    │
│  WHERE business_unit_id = 1                                 │
│    AND (name LIKE '%john%' OR email LIKE '%john%')          │
│  ORDER BY name ASC                                          │
│  LIMIT 10 OFFSET 10  -- Page 2                              │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  JSON Response:                                             │
│  {                                                          │
│    "data": [10 customers],                                  │
│    "current_page": 2,                                       │
│    "total": 25,                                             │
│    "last_page": 3                                           │
│  }                                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Angular Component:                                         │
│  1. Update dataSource.data = response.data.data             │
│  2. Update totalRecords = response.data.total               │
│  3. MatPaginator updates UI: "11-20 of 25"                  │
│  4. Table re-renders with 10 customers                      │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Implementasi

### Laravel Backend:
- [ ] Update `CustomerController@index` dengan code di atas
- [ ] Test endpoint dengan Postman/cURL
- [ ] Add database indexes untuk performance
- [ ] Verify pagination metadata correct
- [ ] Test search functionality
- [ ] Test sort + search + pagination combination

### Angular Frontend:
- [x] Update `CustomerService.getAll()` dengan parameters baru
- [x] Update `CustomersComponent` properties (searchText, totalRecords)
- [x] Add `applyFilter()` method
- [x] Add `onPageChange()` method
- [x] Update `loadCustomers()` untuk pass all parameters
- [x] Update HTML dengan search input
- [x] Update mat-paginator binding
- [x] Add CSS untuk search container

### Testing:
- [ ] Test search dengan berbagai keyword
- [ ] Test pagination (first, last, next, previous)
- [ ] Test sort + pagination
- [ ] Test search + sort + pagination
- [ ] Test dengan 0 results
- [ ] Test dengan 1000+ records (performance)

---

## 🎯 Benefits

1. **Scalability**: Can handle millions of records
2. **Performance**: Only loads current page data
3. **User Experience**: Fast search and navigation
4. **Network Efficiency**: Small payload per request
5. **Database Optimized**: Uses indexes and efficient queries

---

**Status**: ✅ Angular Frontend Ready, Laravel Backend Implementation Needed
**Next Step**: Implement Laravel code di `CustomerController@index`
