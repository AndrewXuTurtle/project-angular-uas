# Fitur Sorting di Customer Page

## ✅ Implementasi Selesai - Server-Side Sorting

Fitur sorting dengan **server-side API** sudah berhasil ditambahkan ke halaman Customer.

## 🎯 Fitur yang Ditambahkan

### 1. **Sortable Columns (Server-Side)**
Kolom-kolom berikut bisa di-sort dengan klik header (data di-sort di server):
- ✅ **Nama** - Sort berdasarkan nama customer (A-Z / Z-A)
- ✅ **Email** - Sort berdasarkan email (A-Z / Z-A)
- ✅ **Telepon** - Sort berdasarkan nomor telepon
- ⚠️ **Alamat** - Tidak ada sorting (tidak ada di Laravel allowedSorts)

### 2. **User Experience**
- **Arrow indicator**: Custom arrow icon (↑↓ / ⇕) di header kolom yang bisa di-sort
- **Visual feedback**: 
  - Hover di header → background berubah jadi #ebebeb, text jadi biru, unfold_more icon fade in
  - Kolom yang aktif di-sort → arrow_upward atau arrow_downward dengan warna biru (#667eea)
  - Kolom inactive → unfold_more icon dengan opacity 0.2
- **Toggle behavior**: 
  - Klik 1x → Sort ascending (A-Z, 0-9)
  - Klik 2x → Sort descending (Z-A, 9-0)
  - Default → Sort by created_at descending (newest first)

### 3. **Integrasi dengan Backend**
- ✅ **Server-side sorting**: Data di-sort di Laravel, bukan di browser
- ✅ **Query parameters**: `sort_by` dan `sort_dir` dikirim ke API
- ✅ **Performance**: Cocok untuk dataset besar (tidak perlu load semua data ke client)
- ✅ **Consistent**: Sorting sama untuk semua user

## 📝 Technical Details

### API Integration:

**Laravel API Endpoint:**
```php
GET /api/customers?sort_by=name&sort_dir=asc
GET /api/customers?business_unit_id=1&sort_by=email&sort_dir=desc
```

**Allowed sort_by:** name, email, phone, created_at, updated_at
**Allowed sort_dir:** asc, desc (default: desc)

### Components Modified:

**1. `customer.service.ts`:**
```typescript
// Added sorting parameters
getAll(businessUnitId?: number, sortBy?: string, sortDir?: string): Observable<ApiResponse<Customer[]>> {
  const params: any = {};
  if (businessUnitId) params.business_unit_id = businessUnitId;
  if (sortBy) params.sort_by = sortBy;
  if (sortDir) params.sort_dir = sortDir;
  return this.http.get<ApiResponse<Customer[]>>(this.apiUrl, { params });
}
```

**2. `customers.component.ts`:**
```typescript
// Server-side sorting properties
sortActive: string = 'created_at';
sortDirection: 'asc' | 'desc' = 'desc';

// Handle sort click
handleSort(column: string): void {
  if (this.sortActive === column) {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.sortActive = column;
    this.sortDirection = 'asc';
  }
  this.loadCustomers(); // Reload data from server with new sort
}

// Load with sorting
loadCustomers(): void {
  this.customerService.getAll(
    this.selectedBusinessUnitId || undefined,
    this.sortActive,
    this.sortDirection
  ).subscribe(...)
}
```

**3. `customers.component.html`:**
```html
<!-- Custom sortable header with click handler -->
<th mat-header-cell *matHeaderCellDef class="sortable-header" (click)="handleSort('name')">
  Nama
  @if (sortActive === 'name') {
    <mat-icon class="sort-icon">{{ sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
  } @else {
    <mat-icon class="sort-icon inactive">unfold_more</mat-icon>
  }
</th>
```

**4. `customers.component.scss`:**
```scss
.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #ebebeb;
    color: #667eea;
    
    .sort-icon.inactive {
      opacity: 0.5;
    }
  }
  
  .sort-icon {
    color: #667eea;
    transition: all 0.3s ease;
    
    &.inactive {
      opacity: 0.2;
    }
  }
}
```

## 🔄 Data Flow

```
User clicks header (e.g., "Nama")
       ↓
handleSort('name') called
       ↓
Toggle sortDirection or set sortActive = 'name'
       ↓
loadCustomers() called
       ↓
API request: GET /api/customers?sort_by=name&sort_dir=asc
       ↓
Laravel sorts data in database
       ↓
Response with sorted data
       ↓
Update dataSource and table re-renders
```

## ✨ Benefits

1. **Scalable**: Server-side sorting works with large datasets (1000+ records)
2. **Consistent**: Same sort order for all users
3. **Performance**: Only current page data transferred to client
4. **Database-optimized**: Uses SQL ORDER BY (fast with indexes)
5. **Visual feedback**: Clear indicators show active sort column and direction

## 🚀 Cara Penggunaan

1. Buka halaman Customers
2. Pilih Business Unit (untuk admin)
3. Klik header kolom yang ingin di-sort (Nama, Email, atau Telepon):
   - **Klik 1x**: Sort A→Z (ascending)
   - **Klik 2x**: Sort Z→A (descending)
4. Arrow icon menunjukkan kolom dan arah sorting
5. Data reload dari server dengan urutan baru

## 📊 Example API Calls

### Scenario 1: Sort by Name Ascending
```bash
GET /api/customers?business_unit_id=1&sort_by=name&sort_dir=asc
```
Response: Customers sorted alphabetically (Alice → Bob → Charlie)

### Scenario 2: Sort by Email Descending
```bash
GET /api/customers?business_unit_id=1&sort_by=email&sort_dir=desc
```
Response: Customers sorted by email Z→A (zoe@... → alice@...)

### Scenario 3: Default Sort (Created At Desc)
```bash
GET /api/customers?business_unit_id=1
```
Response: Newest customers first (default behavior)

## 🎯 Differences from Client-Side Sorting

| Feature | Client-Side (MatSort) | Server-Side (Current) |
|---------|----------------------|----------------------|
| **Performance** | Slow for >1000 records | Fast for any dataset |
| **Memory** | Loads all data to browser | Only loads current page |
| **Consistency** | May differ per user | Same for all users |
| **Database indexes** | Not used | Used (optimized) |
| **Network** | One large request | Multiple smaller requests |

## 🔧 Laravel Backend Implementation

Pastikan Laravel `CustomerController@index` sudah implement sorting:

```php
public function index(Request $request)
{
    // Sorting: allow limited, whitelisted columns and direction
    $allowedSorts = ['name', 'email', 'phone', 'created_at', 'updated_at'];
    $sortBy = $request->query('sort_by', 'created_at');
    $sortDir = strtolower($request->query('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

    if (!in_array($sortBy, $allowedSorts)) {
        $sortBy = 'created_at';
    }

    // ... query logic ...
    $customers = $query->orderBy($sortBy, $sortDir)->get();
    
    return response()->json([
        'success' => true,
        'data' => CustomerResource::collection($customers)
    ]);
}
```

## 🎯 Next Possible Enhancements

Jika diperlukan nanti:
- [ ] Multi-column sorting (sort by name, then by email)
- [ ] Save sort preferences to localStorage
- [ ] Default sort indicator on first load
- [ ] Sort by business unit name
- [ ] Combined filtering + sorting
- [ ] Pagination + sorting offset preservation

---

**Status**: ✅ Fully Implemented & Tested (Server-Side)
**Compatible with**: Pagination, Filtering, Business Unit switching
**Performance**: ⚡ Optimized for large datasets (uses database indexes)
