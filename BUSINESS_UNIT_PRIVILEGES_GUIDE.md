# 🔐 Business Unit & Privileges Integration Guide - Angular

## 📋 Overview

Dokumen ini menjelaskan implementasi **Business Unit Isolation** dan **Granular Privilege Management** di Angular frontend yang terintegrasi dengan Laravel API.

---

## 🎯 Key Features

### ✅ Business Unit Isolation
- Setiap user terikat ke 1 business unit
- Admin hanya bisa lihat data dalam business unit yang sama
- User hanya bisa lihat data yang dia buat sendiri
- Cross-business unit access = **Forbidden (403)**

### ✅ Menu Visibility Control
- `allowed=true` → Menu muncul di sidebar
- `allowed=false` → Menu tidak muncul (hidden)
- Backend auto-filter menu berdasarkan privilege user

### ✅ Granular Permissions (CRUD)
- **C** (Create) - Bisa create data
- **R** (Read) - Bisa read/view data
- **U** (Update) - Bisa update data
- **D** (Delete) - Bisa delete data

### ✅ Role-Based Access
- **Admin** - Full access dalam business unit yang sama
- **User** - Limited access (sesuai privilege)

---

## 🔌 API Integration

### **1. Login & Get Token**
```typescript
// POST /api/login
{
  "username": "admin_batam",
  "password": "Admin123"
}

// Response
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "username": "admin_batam",
      "level": "admin",
      "is_active": true
    },
    "token": "11|xxxxx..."
  }
}
```

### **2. Get User Privileges**
```typescript
// GET /api/user/privileges
// Headers: Authorization: Bearer {TOKEN}

// Response
{
  "success": true,
  "data": {
    "user": {...},
    "business_unit": {
      "id": 1,
      "business_unit": "Batam",
      "active": "y"
    },
    "menus": [
      {
        "id": 1,
        "nama_menu": "Dashboard",
        "url_link": "/dashboard",
        "parent": null,
        "allowed": true,
        "permissions": {
          "c": true,
          "r": true,
          "u": true,
          "d": true
        }
      },
      // ... other menus with allowed=true only
    ]
  }
}
```

---

## 📁 Files Modified/Created

### **1. Models** (`src/app/models/user.model.ts`)

```typescript
export interface BusinessUnit {
  id: number;
  business_unit: string;
  user_id?: number;
  active: string;
}

export interface MenuPermission {
  c: boolean; // Create
  r: boolean; // Read
  u: boolean; // Update
  d: boolean; // Delete
}

export interface UserPrivileges {
  user: User;
  business_unit: BusinessUnit;
  menus: Array<{
    id: number;
    nama_menu: string;
    url_link: string;
    parent: number | null;
    allowed: boolean;
    permissions: MenuPermission;
  }>;
}
```

### **2. Auth Service** (`src/app/auth/auth.service.ts`)

#### **New Properties**
```typescript
private userPrivilegesSubject: BehaviorSubject<UserPrivileges | null>;
public userPrivileges: Observable<UserPrivileges | null>;
private permissionsMap: Map<number, MenuPermission> = new Map();
```

#### **New Methods**
```typescript
// Get privileges from API
getUserPrivileges(): Observable<ApiResponse<UserPrivileges>>

// Permission checking methods
hasPermission(menuId: number, permission: 'c'|'r'|'u'|'d'): boolean
canCreate(menuId: number): boolean
canRead(menuId: number): boolean
canUpdate(menuId: number): boolean
canDelete(menuId: number): boolean

// Get current business unit
getCurrentBusinessUnit(): BusinessUnit | null
```

### **3. Menu Service** (`src/app/services/menu.service.ts`)

#### **New Method**
```typescript
getUserMenus(): Observable<Menu[]> {
  return this.http.get<UserApiResponse<any>>(
    `${environment.apiUrl}/user/privileges`
  ).pipe(
    map(response => response.data.menus)
  );
}
```

### **4. Sidebar Component** (`src/app/layout/sidebar/sidebar.component.ts`)

#### **Updated loadMenus()**
```typescript
loadMenus(): void {
  // Gunakan endpoint baru untuk mendapatkan menu dengan privilege filtering
  this.menuService.getUserMenus().subscribe({
    next: (menus: any[]) => {
      const menuTree = this.buildMenuTree(menus);
      const convertedMenus = this.convertMenuUrls(menuTree);
      this.menus = convertedMenus;
    }
  });
}
```

### **5. Login Component** (`src/app/auth/login/login.component.ts`)

#### **Updated onSubmit()**
```typescript
onSubmit(): void {
  this.authService.login(credentials).subscribe({
    next: (response) => {
      if (response.success) {
        // Load user privileges after successful login
        this.authService.getUserPrivileges().subscribe({
          next: (privilegesResponse) => {
            // Redirect to dashboard
            this.router.navigate(['/admin/dashboard']);
          }
        });
      }
    }
  });
}
```

### **6. Users Component** (`src/app/users/users.component.ts`)

#### **Added Permission Checking**
```typescript
// Menu ID untuk Users (sesuai database)
private readonly USERS_MENU_ID = 5;

// Permission check methods
canCreate(): boolean {
  return this.authService.canCreate(this.USERS_MENU_ID);
}

canUpdate(): boolean {
  return this.authService.canUpdate(this.USERS_MENU_ID);
}

canDelete(): boolean {
  return this.authService.canDelete(this.USERS_MENU_ID);
}
```

#### **Updated Template** (`users.component.html`)
```html
<!-- Add User button - only if has create permission -->
<button *ngIf="canCreate()" mat-raised-button color="primary">
  Add User
</button>

<!-- Edit button - only if has update permission -->
<button *ngIf="canUpdate()" mat-icon-button (click)="edit()">
  <mat-icon>edit</mat-icon>
</button>

<!-- Delete button - only if has delete permission -->
<button *ngIf="canDelete()" mat-icon-button (click)="delete()">
  <mat-icon>delete</mat-icon>
</button>
```

---

## 🔄 Data Flow

```
┌─────────────────┐
│  User Login     │
│  (credentials)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  POST /login    │ ← Laravel API
└────────┬────────┘
         │ (token)
         ▼
┌─────────────────────┐
│ GET /user/privileges│ ← Laravel API
└────────┬────────────┘
         │ (user, business_unit, menus)
         ▼
┌──────────────────────┐
│   AuthService        │
│  - Save privileges   │
│  - Build permissions │
│    map               │
└────────┬─────────────┘
         │
         ├──────────────┐
         ▼              ▼
┌──────────────┐ ┌─────────────┐
│   Sidebar    │ │  Components │
│  Show menus  │ │  Check perms│
│  (allowed=T) │ │  Show/Hide  │
└──────────────┘ └─────────────┘
```

---

## 🎨 UI Implementation Examples

### **1. Sidebar - Dynamic Menu**

Hanya menu dengan `allowed=true` yang ditampilkan.

**Admin Batam melihat:**
- ✅ Dashboard
- ✅ Transaksi
- ✅ Master Data
  - ✅ Users
  - ✅ Menus
- ✅ Reports

**User Batam melihat:**
- ✅ Dashboard
- ✅ Transaksi
- ❌ Master Data (hidden)
- ❌ Reports (hidden)

### **2. Users Page - Permission-based Buttons**

**Admin with full permissions:**
```
[+ Add User]  [Edit] [Delete]
```

**User with read-only:**
```
(no Add button)  (no Edit) (no Delete)
```

**User with create+read:**
```
[+ Add User]  (no Edit) (no Delete)
```

---

## 🧪 Testing

### **Test Admin Batam**

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin_batam","password":"Admin123"}'

# 2. Get Privileges
curl -X GET http://localhost:8000/api/user/privileges \
  -H "Authorization: Bearer {TOKEN}" | jq
```

**Expected Result:**
- ✅ All menus dengan `allowed=true`
- ✅ All permissions (c, r, u, d) = `true`
- ✅ Business unit = "Batam"

### **Test User Batam**

```bash
# 1. Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user_batam","password":"User123"}'

# 2. Get Privileges
curl -X GET http://localhost:8000/api/user/privileges \
  -H "Authorization: Bearer {TOKEN}" | jq
```

**Expected Result:**
- ✅ Limited menus (hanya Dashboard dan Transaksi)
- ✅ Limited permissions (c=true, r=true, u=false, d=false)
- ✅ Business unit = "Batam"

---

## 📊 Menu ID Reference

| Menu Name | Menu ID | Parent |
|-----------|---------|--------|
| Dashboard | 1 | null |
| Transaksi | 2 | null |
| Master Data | 3 | null |
| Reports | 4 | null |
| Users | 5 | 3 |
| Menus | 6 | 3 |

**Catatan:** Gunakan Menu ID ini saat melakukan permission checking di component.

---

## 🎯 Best Practices

### **1. Permission Checking di Component**

```typescript
export class UsersComponent {
  private readonly USERS_MENU_ID = 5;
  
  constructor(private authService: AuthService) {}
  
  canCreate(): boolean {
    return this.authService.canCreate(this.USERS_MENU_ID);
  }
  
  canUpdate(): boolean {
    return this.authService.canUpdate(this.USERS_MENU_ID);
  }
  
  canDelete(): boolean {
    return this.authService.canDelete(this.USERS_MENU_ID);
  }
}
```

### **2. Show/Hide UI Elements**

```html
<!-- Button hanya muncul jika punya permission -->
<button *ngIf="canCreate()" (click)="create()">Add</button>
<button *ngIf="canUpdate()" (click)="edit()">Edit</button>
<button *ngIf="canDelete()" (click)="delete()">Delete</button>

<!-- Alternative: Disable instead of hide -->
<button [disabled]="!canUpdate()" (click)="edit()">Edit</button>
```

### **3. Load Privileges on App Init**

```typescript
// app.component.ts
ngOnInit(): void {
  if (this.authService.isLoggedIn()) {
    this.authService.getUserPrivileges().subscribe({
      next: (response) => {
        console.log('Privileges loaded');
      }
    });
  }
}
```

### **4. Refresh Privileges on Login**

Sudah diimplementasikan di `login.component.ts` - setiap login sukses akan auto-load privileges.

---

## 🔧 Configuration

### **Menu ID Mapping**

Untuk setiap halaman, definisikan Menu ID constant:

```typescript
// users.component.ts
private readonly USERS_MENU_ID = 5;

// menus.component.ts
private readonly MENUS_MENU_ID = 6;

// transaksis.component.ts
private readonly TRANSAKSI_MENU_ID = 2;

// business-units.component.ts
private readonly BU_MENU_ID = 7; // sesuaikan dengan DB
```

---

## 🐛 Troubleshooting

### **Menu tidak muncul di sidebar**

**Penyebab:** `allowed=false` di database  
**Solusi:** 
```sql
UPDATE privilege_users 
SET allowed = true 
WHERE user_id = 1 AND menu_id = 5;
```

### **Button CRUD semua muncul**

**Penyebab:** Permission check belum diimplementasikan  
**Solusi:** Tambahkan `*ngIf="canCreate()"` di button

### **Privileges tidak ter-load**

**Penyebab:** Token invalid atau tidak dikirim  
**Solusi:** 
1. Cek localStorage ada `auth_token`
2. Cek interceptor sudah inject token
3. Login ulang

### **Cross-business unit access**

**Penyebab:** Backend filtering  
**Solusi:** Tidak perlu handle di frontend, Laravel API sudah handle 403 Forbidden

---

## 📚 Reference

- **Implementation Summary:** `IMPLEMENTATION_SUMMARY.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **API Integration:** `ANGULAR_LARAVEL_INTEGRATION.md`
- **Presentation:** `PRESENTASI.md`

---

## ✨ Summary

**Fitur yang sudah diimplementasikan:**

✅ Login dengan auto-load privileges  
✅ Business unit isolation (auto dari backend)  
✅ Menu visibility control (allowed flag)  
✅ Granular permissions (c, r, u, d)  
✅ Permission checking methods di AuthService  
✅ Show/Hide buttons berdasarkan permissions  
✅ Dynamic sidebar dari API (/user/privileges)  

**Hasil:**
- Admin melihat semua menu dan full CRUD
- User melihat limited menu dan limited permissions
- Data ter-isolasi per business unit (auto dari backend)
- Button CRUD muncul sesuai permission user

---

**🎉 Integration Complete!**
