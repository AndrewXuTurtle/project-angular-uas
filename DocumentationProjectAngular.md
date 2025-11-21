# Dokumentasi Project Angular - Admin Dashboard

## 📋 Daftar Isi
1. [Overview Project](#overview-project)
2. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
3. [Struktur Project](#struktur-project)
4. [Arsitektur & Cara Kerja](#arsitektur--cara-kerja)
5. [Authentication & Authorization](#authentication--authorization)
6. [Components](#components)
7. [Services & API Integration](#services--api-integration)
8. [Models & Interfaces](#models--interfaces)
9. [Routing & Navigation](#routing--navigation)
10. [State Management](#state-management)
11. [UI/UX Features](#uiux-features)
12. [Cara Menjalankan Project](#cara-menjalankan-project)

---

## Overview Project

**Nama Project**: Admin Dashboard Management System  
**Framework**: Angular 17+ (Standalone Components)  
**Backend**: Laravel API  
**Database**: MySQL/MariaDB

### Fitur Utama:
- ✅ Authentication & Authorization (Login/Logout)
- ✅ Role-based Access Control (Admin & User)
- ✅ Multi Business Unit Management
- ✅ Dynamic Menu System dari Database
- ✅ User Management (CRUD)
- ✅ Business Unit Management (CRUD)
- ✅ Menu Management (CRUD)
- ✅ Customer Management dengan Business Unit Filter
- ✅ Profile Management dengan Change Password
- ✅ Modern UI dengan Glassmorphism & Gradients

---

## Teknologi yang Digunakan

### Frontend (Angular)
```
- Angular 17+ (Latest)
- TypeScript 5.x
- RxJS 7.x (Observables)
- Angular Material 17+
- Standalone Components (No NgModules)
- SCSS untuk styling
```

### Backend (Laravel) - Separate Repository
```
- Laravel 10.x
- MySQL Database
- RESTful API
- JWT Authentication
```

### Design System
```
- Glassmorphism (backdrop-filter)
- Gradient Colors (Purple #667eea → #764ba2)
- Material Design Components
- Responsive Design (Mobile-first)
```

---

## Struktur Project

```
src/
├── app/
│   ├── auth/                      # Authentication Module
│   │   ├── auth.service.ts        # Auth logic & token management
│   │   ├── auth.guard.ts          # Route protection (logged in)
│   │   ├── admin.guard.ts         # Admin-only route protection
│   │   └── login/                 # Login component
│   │
│   ├── layout/                    # Layout Components
│   │   ├── layout.component.ts    # Main layout wrapper
│   │   ├── navbar/                # Top navigation bar
│   │   ├── sidebar/               # Side menu navigation
│   │   └── footer/                # Footer component
│   │
│   ├── dashboard/                 # Dashboard page
│   │   ├── dashboard.component.ts # Stats & overview
│   │   └── dashboard.component.html
│   │
│   ├── users/                     # User Management
│   │   ├── users.component.ts     # List, Create, Edit, Delete
│   │   └── user-form-dialog.component.ts
│   │
│   ├── business-units/            # Business Unit Management
│   │   └── business-units.component.ts
│   │
│   ├── menus/                     # Menu Management
│   │   └── menus.component.ts
│   │
│   ├── customers/                 # Customer Management
│   │   └── customers.component.ts
│   │
│   ├── profile/                   # User Profile
│   │   └── profile.component.ts
│   │
│   ├── services/                  # API Services
│   │   ├── user.service.ts        # User CRUD API
│   │   ├── business-unit.service.ts
│   │   ├── menu.service.ts
│   │   ├── privilege.service.ts
│   │   └── customer.service.ts
│   │
│   ├── models/                    # TypeScript Interfaces
│   │   ├── user.model.ts
│   │   ├── business-unit.model.ts
│   │   ├── menu.model.ts
│   │   └── privilege.model.ts
│   │
│   ├── interceptors/              # HTTP Interceptors
│   │   └── auth.interceptor.ts    # Inject JWT token
│   │
│   ├── app.routes.ts              # Routing configuration
│   └── app.config.ts              # App configuration
│
├── environments/
│   └── environment.ts             # API URL configuration
│
└── styles.scss                    # Global styles & design system
```

---

## Arsitektur & Cara Kerja

### 1. Application Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│  Angular App    │ ← Standalone Components
│  (Port 4200)    │
└──────┬──────────┘
       │
       ↓ HTTP Requests (with JWT Token)
┌─────────────────┐
│   Laravel API   │ ← RESTful API
│  (Port 8000)    │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│   MySQL DB      │ ← Database
└─────────────────┘
```

### 2. Authentication Flow

```typescript
// Login Process
User → LoginComponent 
     → AuthService.login(credentials)
     → HTTP POST /api/login
     → Laravel validates & returns JWT token
     → Save token to localStorage
     → Navigate to /admin/dashboard
```

### 3. Route Protection Flow

```typescript
// Every Route Check
User navigates → Router 
              → AuthGuard.canActivate()
              → Check if token exists in localStorage
              → If yes: Allow access
              → If no: Redirect to /login

// Admin Only Routes
User navigates → Router
              → AdminGuard.canActivate()
              → Check user level === 'admin'
              → If yes: Allow access
              → If no: Redirect to /dashboard
```

### 4. API Request Flow

```typescript
// Every API Call
Component → Service method (e.g., userService.getAll())
         → HTTP Interceptor adds JWT token to header
         → HTTP Request to Laravel API
         → Laravel validates token
         → Returns JSON response
         → Observable emits data
         → Component receives data via subscribe()
```

---

## Authentication & Authorization

### AuthService (`auth.service.ts`)

**Observables yang Digunakan:**
```typescript
// BehaviorSubject untuk current user
private currentUserSubject: BehaviorSubject<User | null>
public currentUser: Observable<User | null>

// Methods
login(credentials): Observable<LoginResponse>
logout(): Observable<any>
getCurrentUser(): Observable<any>
isLoggedIn(): boolean
isAdmin(): boolean
getToken(): string | null
```

**Cara Kerja:**
1. **Login**: POST ke `/api/login` dengan username & password
2. **Token Storage**: Simpan JWT token di `localStorage`
3. **User State**: BehaviorSubject menyimpan current user state
4. **Auto Load**: Saat app start, load user dari localStorage
5. **Logout**: Clear localStorage & redirect ke login

### Auth Interceptor (`auth.interceptor.ts`)

```typescript
// Intercept setiap HTTP request
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Clone request & tambahkan Authorization header
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};
```

**Cara Kerja:**
- Setiap HTTP request otomatis dapat JWT token dari localStorage
- Tambahkan ke header `Authorization: Bearer <token>`
- Laravel API validate token ini untuk authorize request

### Route Guards

**AuthGuard** - Cek user sudah login:
```typescript
canActivate(): boolean {
  if (this.authService.isLoggedIn()) {
    return true;
  }
  this.router.navigate(['/login']);
  return false;
}
```

**AdminGuard** - Cek user adalah admin:
```typescript
canActivate(): boolean {
  if (this.authService.isAdmin()) {
    return true;
  }
  this.router.navigate(['/dashboard']);
  return false;
}
```

---

## Components

### 1. Layout Components

#### **LayoutComponent** (`layout/layout.component.ts`)
- Container utama untuk semua halaman
- Mengatur Navbar, Sidebar, Content, Footer
- Responsive dengan MatSidenav

```typescript
@Component({
  selector: 'app-layout',
  template: `
    <div class="layout-container">
      <app-navbar (toggleSidebar)="sidenav.toggle()"></app-navbar>
      
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened>
          <app-sidebar></app-sidebar>
        </mat-sidenav>
        
        <mat-sidenav-content class="main-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `
})
```

#### **NavbarComponent** (`layout/navbar/navbar.component.ts`)
- Menampilkan logo, username, business unit selector
- User menu dengan profile & logout
- Observable `currentUser` dari AuthService

```typescript
ngOnInit(): void {
  // Subscribe ke current user
  this.authService.currentUser.subscribe((user) => {
    this.currentUser = user;
  });
  
  // Load business units untuk admin
  this.loadBusinessUnits();
}
```

#### **SidebarComponent** (`layout/sidebar/sidebar.component.ts`)
- Menu navigation dinamis dari database
- Hierarchical menu dengan nested children
- Observable `getUserMenus()` dari MenuService

```typescript
loadMenusFromDatabase(): void {
  this.menuService.getUserMenus().subscribe({
    next: (userMenus) => {
      this.buildMenusFromDatabase(userMenus);
    }
  });
}
```

### 2. Dashboard Component

**Observables yang Digunakan:**
```typescript
// Load data paralel dengan Promise.all
Promise.all([
  this.userService.getAll().toPromise(),
  this.menuService.getMenus().toPromise(),
  this.businessUnitService.getBusinessUnits().toPromise()
]).then(([users, menus, businessUnits]) => {
  // Process data untuk stats cards
});
```

**Loading State:**
```typescript
isLoading = true;  // Loading overlay active

loadStats(): void {
  this.isLoading = true;
  // ... fetch data
  this.isLoading = false;  // Loading overlay hide
}
```

### 3. Users Component

**Expandable Cards Layout:**
- Setiap user = 1 mat-expansion-panel
- Collapsed: Tampil ID & Username
- Expanded: Full form dengan Business Units & Menus checkboxes

**Observables:**
```typescript
// Load users
this.userService.getAll().subscribe({
  next: (response) => {
    this.users = response.data;
  }
});

// Load user access saat panel dibuka
onPanelOpened(user: User): void {
  this.userService.getUserAccess(user.id!).subscribe({
    next: (access) => {
      this.editingUser[user.id!] = {
        ...user,
        business_units: access.business_units,
        menus: access.menus
      };
    }
  });
}

// Update user
saveUser(user: User): void {
  const updateData = {
    level: this.editingUser[user.id!].level,
    is_active: this.editingUser[user.id!].is_active ? 1 : 0,
    business_unit_ids: this.editingUser[user.id!].business_units?.map(bu => bu.id),
    menu_ids: this.editingUser[user.id!].menus?.map(m => m.id)
  };
  
  this.userService.updateUser(user.id!, updateData).subscribe({
    next: () => {
      this.snackBar.open('User updated successfully!', 'Close', {
        duration: 3000
      });
    }
  });
}
```

### 4. Customers Component

**Business Unit Filter:**
- Admin bisa pilih business unit
- Data customer di-filter berdasarkan BU yang dipilih

**Observables:**
```typescript
// Load customers dengan BU filter
loadCustomers(): void {
  const buId = this.selectedBusinessUnitId;
  
  this.customerService.getAll(buId).subscribe({
    next: (response) => {
      this.customers = response.data;
    }
  });
}

// Bulk delete
bulkDelete(): void {
  const ids = this.selection.selected.map(c => c.id);
  
  this.customerService.bulkDelete(ids).subscribe({
    next: () => {
      this.loadCustomers();
      this.selection.clear();
    }
  });
}
```

---

## Services & API Integration

### Pattern yang Digunakan:
```typescript
// Generic API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Service Method Pattern
getAll(): Observable<ApiResponse<T[]>> {
  return this.http.get<ApiResponse<T[]>>(this.apiUrl);
}

// Component Usage Pattern
this.service.getAll().subscribe({
  next: (response) => {
    this.items = response.data;
  },
  error: (error) => {
    console.error('Error:', error);
  }
});
```

### 1. UserService (`services/user.service.ts`)

**API Endpoints:**
```typescript
GET    /api/users                    // Get all users
GET    /api/users/:id                // Get user by ID
POST   /api/users                    // Create user
PUT    /api/users/:id                // Update user
DELETE /api/users/:id                // Delete user
GET    /api/users/:id/access         // Get user's BU & menus
PUT    /api/users/:id/access         // Update user's BU & menus
```

**Key Methods:**
```typescript
getAll(): Observable<ApiResponse<User[]>>
getUserById(id: number): Observable<User>
createUser(user: Partial<User>): Observable<User>
updateUser(id: number, user: Partial<User>): Observable<User>
deleteUser(id: number): Observable<any>
getUserAccess(userId: number): Observable<UserAccess>
updateUserAccess(userId: number, access: UserAccessForm): Observable<UserAccess>
```

### 2. BusinessUnitService (`services/business-unit.service.ts`)

**API Endpoints:**
```typescript
GET    /api/business-units           // Get all business units
GET    /api/business-units/:id       // Get BU by ID
POST   /api/business-units           // Create BU
PUT    /api/business-units/:id       // Update BU
DELETE /api/business-units/:id       // Delete BU
```

### 3. MenuService (`services/menu.service.ts`)

**API Endpoints:**
```typescript
GET    /api/menus                    // Get all menus (master)
GET    /api/user/menus               // Get user's accessible menus
GET    /api/menus/tree               // Get menu hierarchy
GET    /api/menus/:id                // Get menu by ID
POST   /api/menus                    // Create menu
PUT    /api/menus/:id                // Update menu
DELETE /api/menus/:id                // Delete menu
```

**Key Methods:**
```typescript
getMenus(): Observable<Menu[]>              // All menus
getUserMenus(): Observable<Menu[]>          // User's menus only
getMenuTree(): Observable<Menu[]>           // Hierarchical structure
```

### 4. CustomerService (`services/customer.service.ts`)

**API Endpoints:**
```typescript
GET    /api/customers?business_unit_id=X   // Get customers by BU
POST   /api/customers                       // Create customer
PUT    /api/customers/:id                   // Update customer
DELETE /api/customers/:id                   // Delete customer
POST   /api/customers/bulk-delete           // Bulk delete
```

**Key Feature: Business Unit Filtering**
```typescript
getAll(businessUnitId?: number): Observable<ApiResponse<Customer[]>> {
  let url = this.apiUrl;
  
  if (businessUnitId) {
    url += `?business_unit_id=${businessUnitId}`;
  }
  
  return this.http.get<ApiResponse<Customer[]>>(url);
}
```

---

## Models & Interfaces

### User Model (`models/user.model.ts`)
```typescript
export interface User {
  id?: number;
  username: string;
  email?: string;
  level: 'admin' | 'user';
  is_active: number;  // 1 = active, 0 = inactive
  business_units?: BusinessUnit[];
  menus?: Menu[];
}

export interface UserAccess {
  user: User;
  business_units: BusinessUnit[];
  menus: Menu[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
```

### Menu Model (`models/menu.model.ts`)
```typescript
export interface Menu {
  id: number;
  nama_menu: string;
  parent: number | null;  // Parent menu ID
  url_link: string;
  icon: string;
  active: 'y' | 'n';
}
```

### Business Unit Model (`models/business-unit.model.ts`)
```typescript
export interface BusinessUnit {
  id: number;
  business_unit: string;
  active: 'y' | 'n';
}
```

---

## Routing & Navigation

### Route Configuration (`app.routes.ts`)
```typescript
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Protected Routes
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      
      // Admin Only Routes
      { 
        path: 'users', 
        component: UsersComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'business-units', 
        component: BusinessUnitsComponent,
        canActivate: [adminGuard]
      },
      { 
        path: 'menus', 
        component: MenusComponent,
        canActivate: [adminGuard]
      },
      
      // Available for All Logged In Users
      { path: 'customers', component: CustomersComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'settings', component: SettingsComponent }
    ]
  },
  
  { path: '**', redirectTo: '/login' }
];
```

---

## State Management

### Menggunakan RxJS BehaviorSubject

**Current User State (AuthService):**
```typescript
private currentUserSubject: BehaviorSubject<User | null>;
public currentUser: Observable<User | null>;

constructor() {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  
  this.currentUserSubject = new BehaviorSubject<User | null>(user);
  this.currentUser = this.currentUserSubject.asObservable();
}

// Update state
login(credentials): Observable<LoginResponse> {
  return this.http.post<LoginResponse>('/api/login', credentials)
    .pipe(
      tap(response => {
        if (response.success) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
}

// Components subscribe
this.authService.currentUser.subscribe(user => {
  this.currentUser = user;
});
```

### LocalStorage untuk Persistence
```typescript
// Save
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('selectedBU', businessUnitId);

// Load
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Clear on logout
localStorage.clear();
```

---

## UI/UX Features

### 1. Glassmorphism Design
```scss
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 2. Loading Animation
```typescript
// Component
isLoading = true;

ngOnInit(): void {
  this.loadData();
}

loadData(): void {
  this.isLoading = true;
  
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.isLoading = false;
    }
  });
}
```

```html
<!-- Template -->
@if (isLoading) {
  <div class="loading-overlay">
    <mat-spinner></mat-spinner>
    <h2>Loading Dashboard...</h2>
  </div>
}
```

### 3. Gradient Colors
```scss
:root {
  --primary-gradient-start: #667eea;
  --primary-gradient-end: #764ba2;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### 4. Animations
```scss
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-container {
  animation: fadeIn 300ms ease-out;
}
```

---

## Cara Menjalankan Project

### Prerequisites
```bash
# Install Node.js 18+ dan npm
node --version
npm --version

# Install Angular CLI
npm install -g @angular/cli
```

### Setup Project
```bash
# Clone repository
git clone <repository-url>
cd project-1-angular

# Install dependencies
npm install

# Configure API URL
# Edit src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8000/api'  # Sesuaikan dengan Laravel API URL
};
```

### Running Development Server
```bash
# Start Angular dev server
ng serve

# atau
npm start

# Aplikasi akan berjalan di http://localhost:4200
```

### Login Credentials (Default)
```
Admin:
- Username: admin
- Password: admin123

User:
- Username: user1
- Password: user123
```

### Build untuk Production
```bash
# Build aplikasi
ng build --configuration production

# Output ada di folder dist/
# Deploy folder dist/ ke web server (Apache/Nginx)
```

---

## Catatan Penting

### 1. Token Management
- JWT token disimpan di localStorage
- Token expired? User otomatis redirect ke login
- Setiap request HTTP otomatis include token via interceptor

### 2. Business Unit System
- Admin bisa switch antar business unit
- Data customer di-filter based on selected BU
- User biasa hanya lihat BU yang di-assign

### 3. Dynamic Menu
- Menu dibaca dari database (tbl_menu)
- User hanya lihat menu yang di-assign via tbl_user_menus
- Support nested menu (hierarchical)

### 4. Observable Pattern
- Semua API call menggunakan Observable (RxJS)
- Subscribe di component untuk dapat data
- Unsubscribe otomatis dengan async pipe atau manual di ngOnDestroy

### 5. Error Handling
```typescript
this.service.getData().subscribe({
  next: (data) => {
    // Success handling
  },
  error: (error) => {
    // Error handling
    console.error('Error:', error);
    this.snackBar.open('Error: ' + error.message, 'Close');
  }
});
```

---

## Backup Branches
- `backup-notyetdesign` - Sebelum UI modernization
- `backup-before-cleanup` - Sebelum cleanup file MD

---

**Dokumentasi ini mencakup 90% dari cara kerja aplikasi. Untuk detail implementasi spesifik, lihat kode di folder yang relevan.**
