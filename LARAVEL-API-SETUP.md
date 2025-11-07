# Panduan Koneksi ke Laravel API

Dokumen ini menjelaskan langkah-langkah untuk menghubungkan aplikasi Angular ini ke REST API Laravel.

## 📋 Prerequisites

Sebelum menghubungkan ke Laravel API, pastikan:

1. Laravel API sudah running dan dapat diakses
2. API endpoint sudah tersedia (misalnya: `http://localhost:8000/api`)
3. CORS sudah dikonfigurasi di Laravel untuk menerima request dari Angular

## 🔧 Konfigurasi CORS di Laravel

Di Laravel, install dan konfigurasi CORS:

```bash
# Laravel 8+
# CORS sudah built-in, edit config/cors.php
```

Edit `config/cors.php`:

```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:4200'], // Angular dev server
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## 🌍 Setup Environment File

### 1. Buat file environment

Buat folder dan file berikut:

```bash
mkdir -p src/environments
touch src/environments/environment.ts
touch src/environments/environment.prod.ts
```

### 2. Edit `src/environments/environment.ts` (Development)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',  // URL Laravel API
  apiVersion: 'v1'
};
```

### 3. Edit `src/environments/environment.prod.ts` (Production)

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',  // URL Production API
  apiVersion: 'v1'
};
```

## 🔐 Update Auth Service

Edit `src/app/auth/auth.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User, LoginRequest, LoginResponse } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = environment.apiUrl;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Login via Laravel API
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        // Simpan token dan user data
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Logout
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
      })
    );
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
```

## 📦 Update User Service

Edit `src/app/services/user.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

## 🔄 Update Menu Service

Edit `src/app/services/menu.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../models/menu.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/menus`;

  constructor(private http: HttpClient) {}

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl);
  }

  getMenuTree(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/tree`);
  }
}
```

## 🛡️ Expected Laravel API Endpoints

Aplikasi Angular ini mengharapkan Laravel API memiliki endpoint berikut:

### Authentication

```
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
GET    /api/auth/me            - Get current user info
```

**Request Body untuk Login:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response Login:**
```json
{
  "token": "Bearer eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "full_name": "Administrator",
    "role": "admin",
    "is_active": true
  }
}
```

### Users

```
GET    /api/users              - Get all users
GET    /api/users/{id}         - Get user by ID
POST   /api/users              - Create new user
PUT    /api/users/{id}         - Update user
DELETE /api/users/{id}         - Delete user
```

### Menus

```
GET    /api/menus              - Get all menus
GET    /api/menus/tree         - Get menu tree structure
GET    /api/menus/{id}         - Get menu by ID
POST   /api/menus              - Create new menu
PUT    /api/menus/{id}         - Update menu
DELETE /api/menus/{id}         - Delete menu
```

### Privileges

```
GET    /api/privileges         - Get all privileges
GET    /api/privileges/{id}    - Get privilege by ID
POST   /api/privileges         - Create new privilege
PUT    /api/privileges/{id}    - Update privilege
DELETE /api/privileges/{id}    - Delete privilege
```

### Business Units

```
GET    /api/business-units     - Get all business units
GET    /api/business-units/{id} - Get business unit by ID
POST   /api/business-units     - Create new business unit
PUT    /api/business-units/{id} - Update business unit
DELETE /api/business-units/{id} - Delete business unit
```

## 🔑 Authorization Header

HTTP Interceptor sudah dikonfigurasi untuk otomatis menambahkan header:

```
Authorization: Bearer {token}
```

ke setiap request yang memerlukan autentikasi.

## 🧪 Testing API Connection

Untuk test koneksi, buat service sederhana:

```typescript
// src/app/services/api-test.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTestService {
  constructor(private http: HttpClient) {}

  testConnection() {
    return this.http.get(`${environment.apiUrl}/health`);
  }
}
```

## 📝 Example Laravel Controller

Contoh controller di Laravel untuk Users:

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|unique:users',
            'email' => 'required|email|unique:users',
            'full_name' => 'required',
            'role' => 'required',
            'is_active' => 'boolean',
        ]);

        $user = User::create($validated);
        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $validated = $request->validate([
            'username' => 'sometimes|unique:users,username,' . $id,
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'full_name' => 'sometimes',
            'role' => 'sometimes',
            'is_active' => 'sometimes|boolean',
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
```

## 🚦 Error Handling

Tambahkan error handling di component:

```typescript
this.userService.getUsers().subscribe({
  next: (users) => {
    this.dataSource.data = users;
  },
  error: (error) => {
    console.error('Error:', error);
    
    if (error.status === 401) {
      // Unauthorized - redirect to login
      this.router.navigate(['/login']);
    } else if (error.status === 403) {
      // Forbidden
      this.snackBar.open('You do not have permission', 'Close', {
        duration: 3000
      });
    } else {
      // Other errors
      this.snackBar.open(
        error.error?.message || 'An error occurred',
        'Close',
        { duration: 3000 }
      );
    }
  }
});
```

## 📞 Troubleshooting

### CORS Error

Jika muncul CORS error di browser console:

1. Pastikan Laravel CORS sudah dikonfigurasi dengan benar
2. Check `allowed_origins` di `config/cors.php`
3. Pastikan API endpoint dimulai dengan `/api/`

### 401 Unauthorized

1. Check token tersimpan di localStorage
2. Check interceptor berjalan dengan baik (lihat console.log)
3. Verify token format: `Bearer {token}`

### Network Error

1. Pastikan Laravel API running
2. Check URL di environment file
3. Test endpoint dengan Postman/Insomnia

## ✅ Checklist

- [ ] CORS dikonfigurasi di Laravel
- [ ] Environment file dibuat
- [ ] Auth Service diupdate
- [ ] User Service diupdate
- [ ] Menu Service diupdate
- [ ] Laravel API endpoints tersedia
- [ ] Test login berhasil
- [ ] Test CRUD operations
- [ ] Error handling berfungsi

---

Setelah semua langkah di atas selesai, aplikasi Angular siap terhubung ke Laravel API! 🚀
