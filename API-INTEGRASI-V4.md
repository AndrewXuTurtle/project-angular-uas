# API Integration V4 - Master-Detail Architecture

> ✅ **LATEST VERSION**: Struktur Master-Detail dengan Business Units & Menus sebagai junction tables.

## 📋 Database Structure (Master-Detail)

### Master Tables
```
tbl_business_units (Master)
├── id
├── business_unit
└── active

tbl_user (Master)
├── id
├── username
├── password
└── level

tbl_menu (Master)
├── id
├── nama_menu
├── url_link
├── icon
└── parent
```

### Junction/Detail Tables
```
tbl_user_business_units (Detail)
├── id
├── user_id (FK → tbl_user.id)
├── business_unit_id (FK → tbl_business_units.id)
└── active

tbl_user_menus (Detail)
├── id
├── user_id (FK → tbl_user.id)
├── menu_id (FK → tbl_menu.id)
└── active
```

---

## 🎯 NEW API Endpoint: Get User Access

### GET `/api/users/{id}/access`
Mendapatkan **semua** business units dan menus yang bisa diakses user dalam **1 API call**.

**Use Case**: 
- Populate dropdown "Business Units" saat edit user
- Populate dropdown "Menus" saat edit user
- Show user permissions di profile page

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "User access retrieved successfully",
  "data": {
    "user": {
      "id": 2,
      "username": "user1",
      "level": "user",
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
      },
      {
        "id": 5,
        "nama_menu": "Customers",
        "url_link": "/admin/customers",
        "icon": "people",
        "parent": null,
        "active": "y"
      }
    ]
  }
}
```

**cURL Test:**
```bash
TOKEN="your-token-here"

curl -X GET http://localhost:8000/api/users/2/access \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔄 NEW API Endpoint: Update User Access

### PUT `/api/users/{id}/access`
Update business units dan menus yang bisa diakses user.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "business_unit_ids": [1, 2, 3],
  "menu_ids": [1, 2, 5, 6, 7]
}
```

**Response:**
```json
{
  "success": true,
  "message": "User access updated successfully",
  "data": {
    "user": {
      "id": 2,
      "username": "user1"
    },
    "business_units": [
      {"id": 1, "business_unit": "Batam"},
      {"id": 2, "business_unit": "Jakarta"},
      {"id": 3, "business_unit": "Surabaya"}
    ],
    "menus": [
      {"id": 1, "nama_menu": "Dashboard"},
      {"id": 2, "nama_menu": "Users"},
      {"id": 5, "nama_menu": "Customers"},
      {"id": 6, "nama_menu": "Reports"},
      {"id": 7, "nama_menu": "Settings"}
    ]
  }
}
```

**cURL Test:**
```bash
curl -X PUT http://localhost:8000/api/users/2/access \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_unit_ids": [1, 2, 3],
    "menu_ids": [1, 2, 5, 6, 7]
  }'
```

---

## 📦 Master Data Endpoints

### Business Units (Master)

```bash
# Get all BUs
GET /api/business-units

# Response
{
  "success": true,
  "data": [
    {"id": 1, "business_unit": "Batam", "active": "y"},
    {"id": 2, "business_unit": "Jakarta", "active": "y"},
    {"id": 3, "business_unit": "Surabaya", "active": "y"}
  ]
}
```

### Menus (Master)

```bash
# Get all menus
GET /api/menus

# Response
{
  "success": true,
  "data": [
    {"id": 1, "nama_menu": "Dashboard", "url_link": "/admin/dashboard", "icon": "dashboard"},
    {"id": 2, "nama_menu": "Users", "url_link": "/admin/users", "icon": "people"},
    {"id": 5, "nama_menu": "Customers", "url_link": "/admin/customers", "icon": "business"}
  ]
}
```

---

## 🎨 Angular Implementation

### 1. TypeScript Interfaces

```typescript
// user.model.ts
export interface UserAccess {
  user: User;
  business_units: BusinessUnit[];
  menus: Menu[];
}

export interface UserAccessForm {
  business_unit_ids: number[];
  menu_ids: number[];
}

export interface BusinessUnit {
  id: number;
  business_unit: string;
  active: string;
}

export interface Menu {
  id: number;
  nama_menu: string;
  url_link: string;
  icon?: string;
  parent: number | null;
  active: string;
}
```

### 2. User Service

```typescript
// user.service.ts
getUserAccess(userId: number): Observable<UserAccess> {
  return this.http.get<ApiResponse<UserAccess>>(
    `${this.apiUrl}/${userId}/access`
  ).pipe(
    map(response => response.data)
  );
}

updateUserAccess(userId: number, access: UserAccessForm): Observable<UserAccess> {
  return this.http.put<ApiResponse<UserAccess>>(
    `${this.apiUrl}/${userId}/access`, 
    access
  ).pipe(
    map(response => response.data)
  );
}
```

### 3. Component Example

```typescript
// user-edit.component.ts
export class UserEditComponent implements OnInit {
  userId = 2;
  userAccess: UserAccess;
  
  // Dropdown data
  allBusinessUnits: BusinessUnit[] = [];
  allMenus: Menu[] = [];
  
  // Selected IDs
  selectedBUIds: number[] = [];
  selectedMenuIds: number[] = [];

  ngOnInit() {
    // Load all master data
    this.loadAllBusinessUnits();
    this.loadAllMenus();
    
    // Load user current access
    this.loadUserAccess();
  }

  loadUserAccess() {
    this.userService.getUserAccess(this.userId).subscribe({
      next: (access) => {
        this.userAccess = access;
        
        // Pre-select current access
        this.selectedBUIds = access.business_units.map(bu => bu.id);
        this.selectedMenuIds = access.menus.map(menu => menu.id);
      }
    });
  }

  loadAllBusinessUnits() {
    this.businessUnitService.getBusinessUnits().subscribe({
      next: (bus) => {
        this.allBusinessUnits = bus;
      }
    });
  }

  loadAllMenus() {
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        this.allMenus = menus;
      }
    });
  }

  saveAccess() {
    const accessForm: UserAccessForm = {
      business_unit_ids: this.selectedBUIds,
      menu_ids: this.selectedMenuIds
    };

    this.userService.updateUserAccess(this.userId, accessForm).subscribe({
      next: (updated) => {
        console.log('Access updated:', updated);
        this.snackBar.open('User access updated', 'OK');
      }
    });
  }
}
```

### 4. Template Example

```html
<!-- user-edit.component.html -->
<mat-card>
  <mat-card-header>
    <mat-card-title>Edit User Access: {{ userAccess?.user.username }}</mat-card-title>
  </mat-card-header>

  <mat-card-content>
    <!-- Business Units Dropdown -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Business Units</mat-label>
      <mat-select [(ngModel)]="selectedBUIds" multiple>
        @for (bu of allBusinessUnits; track bu.id) {
          <mat-option [value]="bu.id">
            {{ bu.business_unit }}
          </mat-option>
        }
      </mat-select>
      <mat-hint>Select business units this user can access</mat-hint>
    </mat-form-field>

    <!-- Menus Dropdown -->
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Menus</mat-label>
      <mat-select [(ngModel)]="selectedMenuIds" multiple>
        @for (menu of allMenus; track menu.id) {
          <mat-option [value]="menu.id">
            <mat-icon>{{ menu.icon }}</mat-icon>
            {{ menu.nama_menu }}
          </mat-option>
        }
      </mat-select>
      <mat-hint>Select menus this user can access</mat-hint>
    </mat-form-field>
  </mat-card-content>

  <mat-card-actions>
    <button mat-raised-button color="primary" (click)="saveAccess()">
      Save Access
    </button>
  </mat-card-actions>
</mat-card>
```

---

## 🧪 Complete Test Flow

```bash
#!/bin/bash

BASE_URL="http://localhost:8000/api"

# Login as admin
echo "1. Login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"
echo ""

# Get all business units (master)
echo "2. Get all Business Units (Master Data)..."
curl -s -X GET $BASE_URL/business-units \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Get all menus (master)
echo "3. Get all Menus (Master Data)..."
curl -s -X GET $BASE_URL/menus \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Get user access
echo "4. Get User Access (user_id=2)..."
curl -s -X GET $BASE_URL/users/2/access \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Update user access
echo "5. Update User Access..."
curl -s -X PUT $BASE_URL/users/2/access \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "business_unit_ids": [1, 2, 3],
    "menu_ids": [1, 2, 5, 6]
  }' | jq .
echo ""

# Verify update
echo "6. Verify User Access (after update)..."
curl -s -X GET $BASE_URL/users/2/access \
  -H "Authorization: Bearer $TOKEN" | jq '.data | {user: .user.username, business_units: .business_units, menus: .menus}'
echo ""

echo "✅ All tests completed!"
```

---

## 📊 Benefits of Master-Detail Architecture

### ✅ Scalability
- Easy to add new business units
- Easy to add new menus
- No need to modify existing code

### ✅ Flexibility
- User can have multiple BUs
- User can have multiple menus
- Easy to grant/revoke access

### ✅ Performance
- One API call to get all access
- Frontend can cache master data
- Dropdown population is instant

### ✅ Maintainability
- Clear separation of concerns
- Master data managed separately
- Junction tables handle relationships

---

## 🔄 Migration from V3 to V4

### What Changed:
- ❌ V3: Business Unit tied to user (1-to-1)
- ✅ V4: Business Units via junction table (many-to-many)

- ❌ V3: Menus with permission matrix
- ✅ V4: Menus via junction table (simplified)

### Migration Steps:
1. Create new junction tables
2. Migrate existing data to junction tables
3. Update API endpoints
4. Update Angular services
5. Update Angular components

---

## 📚 Swagger Documentation

Access interactive API documentation:
```
http://localhost:8000/api/documentation
```

Search for:
- `GET /api/users/{id}/access` - Get user access
- `PUT /api/users/{id}/access` - Update user access

---

**Happy Coding! 🚀**
