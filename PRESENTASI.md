# 📊 Presentasi Aplikasi Angular + Laravel API

## 🎯 Overview Aplikasi

**Frontend:** Angular 17+ (Standalone Components)  
**Backend:** Laravel API dengan Sanctum Authentication  
**UI Framework:** Angular Material Design  

---

## 🔐 1. AUTHENTICATION (Login System)

### Menggunakan Laravel Sanctum
```
User Login → Laravel API → Token Generated → Simpan di localStorage
```

### Flow Login:
1. User masuk ke `/login`
2. Input username & password
3. POST ke `http://localhost:8000/api/login`
4. Dapat response: `{ token: "xxx", user: {...} }`
5. Simpan token di `localStorage` dengan key `auth_token`
6. Redirect ke `/admin/dashboard`

### File Terkait:
- `auth.service.ts` - Handle login/logout
- `auth.interceptor.ts` - Auto inject token ke setiap request
- `auth.guard.ts` - Proteksi routes (wajib login)
- `admin.guard.ts` - Proteksi admin routes (wajib role admin)

---

## 🌐 2. CARA MENJEMPUT API

### Base Configuration
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:8000/api'
};
```

### HTTP Interceptor (Auto Token)
```typescript
// auth.interceptor.ts
request = request.clone({
  setHeaders: {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json'
  }
});
```

### Service Pattern
```typescript
// user.service.ts
getUsers(): Observable<User[]> {
  return this.http.get<ApiResponse<User[]>>(
    `${this.apiUrl}/users`
  ).pipe(
    map(response => response.data)
  );
}
```

### Contoh API Calls:
- `GET /api/users` → Ambil semua users
- `POST /api/users` → Tambah user baru
- `PUT /api/users/{id}` → Update user
- `DELETE /api/users/{id}` → Hapus user

---

## 📁 3. STRUKTUR APLIKASI

### Pembagian Folder:
```
src/app/
├── auth/              # Login & Authentication
│   ├── auth.service.ts
│   ├── auth.guard.ts
│   └── login/
├── interceptors/      # HTTP Interceptors
│   └── auth.interceptor.ts
├── layout/            # Template Layout
│   ├── navbar/        # Header
│   ├── sidebar/       # Menu Samping
│   └── footer/
├── services/          # API Services
│   ├── user.service.ts
│   ├── menu.service.ts
│   └── ...
├── models/            # Data Models (Interface)
│   ├── user.model.ts
│   └── menu.model.ts
└── [pages]/           # Halaman-halaman
    ├── dashboard/
    ├── users/
    ├── menus/
    └── ...
```

---

## 🎨 4. KOMPONEN UTAMA

### A. Layout Components
- **Navbar** - Header dengan user menu & notifications
- **Sidebar** - Menu navigasi (multi-level nested)
- **Footer** - Footer aplikasi

### B. Page Components
- **Dashboard** - Halaman utama setelah login
- **Users** - CRUD management users
- **Menus** - CRUD management menu
- **Business Units** - CRUD business units
- **Settings** - Pengaturan aplikasi
- **Profile** - Profile user & ganti password

### C. Shared Components
- **User Form Dialog** - Form tambah/edit user
- **Confirmation Dialog** - Konfirmasi delete

---

## 🔄 5. DATA FLOW

```
┌─────────────┐
│   User UI   │
└──────┬──────┘
       │ (1) User Action
       ▼
┌─────────────────┐
│   Component     │ (users.component.ts)
└──────┬──────────┘
       │ (2) Call Service
       ▼
┌─────────────────┐
│   Service       │ (user.service.ts)
└──────┬──────────┘
       │ (3) HTTP Request
       ▼
┌─────────────────┐
│  Interceptor    │ (inject token)
└──────┬──────────┘
       │ (4) To API
       ▼
┌─────────────────┐
│  Laravel API    │ http://localhost:8000/api
└──────┬──────────┘
       │ (5) Response
       ▼
┌─────────────────┐
│   Component     │ (update UI)
└─────────────────┘
```

---

## 🛡️ 6. SECURITY FEATURES

### A. Route Guards
```typescript
// Hanya user yang sudah login
canActivate: [authGuard]

// Hanya admin
canActivate: [adminGuard]
```

### B. Auto Logout
- Jika token invalid/expired (401) → auto logout
- Jika manual logout → hapus token & redirect ke login

### C. Token Storage
- Token disimpan di `localStorage` dengan key `auth_token`
- User info disimpan di `localStorage` dengan key `user`

---

## 🎯 7. FITUR UTAMA

### ✅ Authentication
- Login dengan username & password
- Token-based authentication
- Auto logout jika session expired

### ✅ Dynamic Menu
- Menu dimuat dari database (via API)
- Support unlimited nested levels
- Auto convert URL Laravel → Angular routes

### ✅ CRUD Operations
- Create, Read, Update, Delete untuk semua master data
- Form validation
- Loading indicators
- Success/Error notifications

### ✅ Responsive UI
- Material Design
- Mobile-friendly
- Dark/Light theme support

---

## 📡 8. API ENDPOINTS

### Authentication
- `POST /api/login` - Login
- `POST /api/logout` - Logout

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Menus
- `GET /api/menus` - List menus (tree structure)
- `POST /api/menus` - Create menu
- `DELETE /api/menus/{id}` - Delete menu

### Business Units
- `GET /api/business-units` - List business units
- `POST /api/business-units` - Create
- `PUT /api/business-units/{id}` - Update
- `DELETE /api/business-units/{id}` - Delete

---

## 🚀 9. CARA MENJALANKAN

### Setup Laravel API (Backend)
```bash
cd laravel-api
php artisan serve
# Running on http://localhost:8000
```

### Setup Angular (Frontend)
```bash
cd project-1-angular
npm install
npm start
# Running on http://localhost:4200
```

### Login Credentials
```
Username: admin
Password: [sesuai database]
```

---

## 🔧 10. KONFIGURASI PENTING

### CORS di Laravel
```php
// config/cors.php
'allowed_origins' => ['http://localhost:4200'],
'allowed_headers' => ['*'],
'exposed_headers' => ['Authorization'],
```

### Environment Angular
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### Proxy Configuration (Optional)
```json
// proxy.conf.json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false
  }
}
```

---

## 📊 11. STATE MANAGEMENT

### Current User State
```typescript
// auth.service.ts
private currentUserSubject = new BehaviorSubject<User | null>(null);
currentUser = this.currentUserSubject.asObservable();
```

### Loading States
```typescript
isLoading = true;

loadData() {
  this.isLoading = true;
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.isLoading = false;
    }
  });
}
```

---

## 🎨 12. UI COMPONENTS

### Material Modules Used:
- `MatTableModule` - Data tables
- `MatButtonModule` - Buttons
- `MatIconModule` - Material icons
- `MatFormFieldModule` - Form fields
- `MatInputModule` - Input fields
- `MatDialogModule` - Modals/Dialogs
- `MatSnackBarModule` - Notifications
- `MatMenuModule` - Dropdown menus
- `MatExpansionModule` - Accordion/Expandable
- `MatTabsModule` - Tabs
- `MatCardModule` - Cards

---

## 🔑 13. KEY CONCEPTS

### A. Standalone Components
```typescript
@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  // ...
})
```

### B. Reactive Forms
```typescript
userForm = this.fb.group({
  username: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]]
});
```

### C. Observables & RxJS
```typescript
this.userService.getUsers().pipe(
  map(users => users.filter(u => u.active)),
  catchError(error => {
    console.error(error);
    return of([]);
  })
).subscribe(data => this.users = data);
```

### D. Routing
```typescript
// Lazy loading
{
  path: 'users',
  loadComponent: () => import('./users/users.component')
    .then(m => m.UsersComponent),
  canActivate: [authGuard]
}
```

---

## 📝 14. BEST PRACTICES

✅ **Services untuk API calls** - Jangan langsung HttpClient di component  
✅ **Interceptor untuk token** - Auto inject, tidak perlu manual  
✅ **Guards untuk proteksi** - Secure your routes  
✅ **Loading indicators** - Better UX  
✅ **Error handling** - Tampilkan error dengan jelas  
✅ **Type safety** - Gunakan interfaces/models  
✅ **Reactive Forms** - Untuk validasi yang kompleks  
✅ **Standalone Components** - Modern Angular pattern  

---

## 🐛 15. TROUBLESHOOTING

### CORS Error
```bash
# Di Laravel, jalankan:
php artisan config:clear
# Pastikan config/cors.php sudah benar
```

### Token Not Sent
```typescript
// Cek interceptor sudah di-provide di app.config.ts
providers: [
  provideHttpClient(withInterceptors([authInterceptor]))
]
```

### Menu Tidak Muncul
```typescript
// Cek console.log di sidebar.component.ts
// Pastikan API mengembalikan data yang benar
```

### 401 Unauthorized
- Token expired → Login ulang
- Token tidak valid → Logout & login lagi
- API endpoint salah → Cek network tab

---

## 📞 16. SUPPORT & DOCS

- **Angular Docs**: https://angular.dev
- **Material Design**: https://material.angular.io
- **Laravel Docs**: https://laravel.com/docs
- **RxJS**: https://rxjs.dev

---

## ✨ SUMMARY

**Aplikasi ini adalah SPA (Single Page Application) yang:**
- Menggunakan Angular 17+ untuk frontend
- Terintegrasi dengan Laravel API (Sanctum)
- Token-based authentication
- CRUD lengkap untuk semua master data
- Dynamic menu dari database (multi-level nested)
- Material Design UI
- Responsive & modern

**Tech Stack:**
- Frontend: Angular 17+ + Material UI
- Backend: Laravel + Sanctum
- Database: MySQL/PostgreSQL
- Auth: Bearer Token (localStorage)

---

**🎯 End of Presentation**
