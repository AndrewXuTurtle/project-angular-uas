# Integrasi Angular Frontend dengan Laravel API

Dokumentasi lengkap integrasi aplikasi Angular dengan Laravel API backend.

## 📋 Daftar Isi

- [Setup & Konfigurasi](#setup--konfigurasi)
- [Services](#services)
- [Interceptors](#interceptors)
- [Guards](#guards)
- [Testing Integrasi](#testing-integrasi)
- [Troubleshooting](#troubleshooting)

---

## Setup & Konfigurasi

### 1. Environment Configuration

**Development Environment** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8001/api'
};
```

**Production Environment** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

### 2. Angular Configuration

**App Config** (`src/app/app.config.ts`):
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync()
  ]
};
```

---

## Services

### 1. Auth Service

**Location**: `src/app/auth/auth.service.ts`

**Key Features**:
- Login/Logout functionality
- Token management (localStorage)
- User state management (BehaviorSubject)
- Role checking (isAdmin)

**Storage Keys**:
- `auth_token`: JWT token from Laravel
- `user`: User object as JSON string

**Important Methods**:
```typescript
login(credentials: LoginRequest): Observable<LoginResponse>
logout(): Observable<any>
getCurrentUser(): Observable<any>
getToken(): string | null
isLoggedIn(): boolean
isAdmin(): boolean
```

### 2. User Service

**Location**: `src/app/services/user.service.ts`

**Endpoints**:
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/activate` - Activate user
- `POST /api/users/:id/deactivate` - Deactivate user
- `POST /api/users/:id/change-password` - Change password

### 3. Menu Service

**Location**: `src/app/services/menu.service.ts`

**Endpoints**:
- `GET /api/menus` - Get all menus
- `GET /api/menus/tree` - Get menu hierarchy
- `GET /api/menus/:id` - Get menu by ID
- `POST /api/menus` - Create menu
- `PUT /api/menus/:id` - Update menu
- `DELETE /api/menus/:id` - Delete menu

### 4. Privilege Service

**Location**: `src/app/services/privilege.service.ts`

**Endpoints**:
- `GET /api/privilege-users` - Get all privileges
- `GET /api/privilege-users/:id` - Get privilege by ID
- `POST /api/privilege-users` - Create privilege
- `PUT /api/privilege-users/:id` - Update privilege
- `DELETE /api/privilege-users/:id` - Delete privilege
- `GET /api/privilege-users/check` - Check user privilege

**CRUD Permissions**:
- `c`: Create permission
- `r`: Read permission
- `u`: Update permission
- `d`: Delete permission

### 5. Business Unit Service

**Location**: `src/app/services/business-unit.service.ts`

**Endpoints**:
- `GET /api/business-units` - Get all business units
- `GET /api/business-units/:id` - Get business unit by ID
- `POST /api/business-units` - Create business unit
- `PUT /api/business-units/:id` - Update business unit
- `DELETE /api/business-units/:id` - Delete business unit
- `POST /api/business-units/:id/activate` - Activate business unit
- `POST /api/business-units/:id/deactivate` - Deactivate business unit

---

## Interceptors

### Auth Interceptor

**Location**: `src/app/interceptors/auth.interceptor.ts`

**Functionality**:
1. ✅ Adds Authorization header with Bearer token to all requests
2. ✅ Sets Accept and Content-Type headers
3. ✅ Handles 401 Unauthorized errors
4. ✅ Auto-redirects to login on authentication failure
5. ✅ Cleans up localStorage on 401 errors

**Headers Added**:
```typescript
{
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer {token}' // Only if token exists
}
```

**Error Handling**:
- **401 Unauthorized**: Removes tokens, redirects to `/login`
- All other errors: Propagates to calling component

---

## Guards

### 1. Auth Guard

**Location**: `src/app/auth/auth.guard.ts`

**Purpose**: Protect routes that require authentication

**Usage**:
```typescript
{
  path: 'admin',
  canActivate: [authGuard],
  component: LayoutComponent,
  children: [...]
}
```

**Behavior**:
- ✅ Allows access if user is logged in
- ❌ Redirects to `/login` with returnUrl if not logged in

### 2. Admin Guard

**Location**: `src/app/auth/admin.guard.ts`

**Purpose**: Protect admin-only routes

**Usage**:
```typescript
{
  path: 'users',
  canActivate: [authGuard, adminGuard],
  component: UsersComponent
}
```

**Behavior**:
- ✅ Allows access if user is logged in AND is admin
- ❌ Redirects to `/admin/dashboard` if not admin

---

## API Response Format

Laravel API menggunakan format response standar:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "errors": {
    // Validation errors (optional)
  }
}
```

### Login Response
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "level": "admin",
      "is_active": true
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

---

## Testing Integrasi

### 1. Test Login

```bash
# Pastikan Laravel API berjalan
cd /path/to/laravel-api
php artisan serve --port=8001

# Jalankan Angular app
cd /path/to/angular-app
ng serve
```

Buka browser: `http://localhost:4200/login`

Test credentials (default):
- Username: `admin`
- Password: `admin123`

### 2. Test API Endpoints

Gunakan browser DevTools (Network tab) untuk melihat:
- ✅ Request headers contain Authorization token
- ✅ Response format matches expected structure
- ✅ 401 errors trigger auto-logout

### 3. Test Guards

1. **Auth Guard**: 
   - Logout, coba akses `/admin/dashboard`
   - Should redirect to `/login?returnUrl=/admin/dashboard`

2. **Admin Guard**:
   - Login as non-admin user
   - Try to access `/admin/users`
   - Should redirect to `/admin/dashboard`

---

## Troubleshooting

### CORS Issues

Jika mendapat CORS error, pastikan Laravel API memiliki konfigurasi CORS yang benar:

**File**: `config/cors.php`
```php
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:4200'],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

### Token Not Being Sent

Check:
1. ✅ Token exists in localStorage: `localStorage.getItem('auth_token')`
2. ✅ Auth interceptor is registered in app.config.ts
3. ✅ Request URL includes `/api/` in the path

### 401 Errors After Login

Check:
1. ✅ Token is valid (not expired)
2. ✅ Token is saved correctly after login
3. ✅ Laravel API accepts the token format
4. ✅ Bearer prefix is included in Authorization header

### Service Methods Not Working

Check:
1. ✅ Service is injected correctly in component
2. ✅ API URL in environment.ts is correct
3. ✅ Laravel routes are defined correctly
4. ✅ Response format matches expected structure

---

## Best Practices

### 1. Error Handling

Always handle errors in components:
```typescript
this.userService.getUsers().subscribe({
  next: (users) => {
    // Handle success
  },
  error: (error) => {
    // Handle error
    console.error('Error:', error);
    this.snackBar.open(error.error?.message || 'An error occurred');
  }
});
```

### 2. Loading States

Show loading indicators:
```typescript
loading = false;

loadData() {
  this.loading = true;
  this.service.getData().subscribe({
    next: (data) => {
      this.data = data;
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}
```

### 3. Token Validation

Check token validity before making requests:
```typescript
if (!this.authService.isLoggedIn()) {
  this.router.navigate(['/login']);
  return;
}
```

### 4. Unsubscribe

Use async pipe or unsubscribe to prevent memory leaks:
```typescript
// Option 1: Async pipe (recommended)
users$ = this.userService.getUsers();

// Option 2: Manual unsubscribe
private destroy$ = new Subject<void>();

ngOnInit() {
  this.userService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe(...);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

## Security Considerations

1. **Token Storage**: 
   - ⚠️ localStorage is vulnerable to XSS attacks
   - Consider using httpOnly cookies for production

2. **HTTPS**: 
   - Always use HTTPS in production
   - Never send tokens over HTTP

3. **Token Expiration**:
   - Implement token refresh mechanism
   - Handle expired tokens gracefully

4. **Input Validation**:
   - Validate all user inputs
   - Use Angular's built-in validators

5. **CSRF Protection**:
   - Laravel automatically handles CSRF for API routes
   - Ensure CSRF token is included if needed

---

## Production Deployment

### Build Angular App

```bash
ng build --configuration production
```

### Update Environment

Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.yourdomain.com/api'
};
```

### Deploy Checklist

- [ ] Update API URL in production environment
- [ ] Configure CORS on Laravel API
- [ ] Enable HTTPS
- [ ] Set up proper error logging
- [ ] Test all API endpoints
- [ ] Verify authentication flow
- [ ] Check guard behaviors
- [ ] Test token expiration handling

---

## Useful Commands

```bash
# Start Laravel API
cd /path/to/laravel-api
php artisan serve --port=8001

# Start Angular dev server
ng serve

# Build Angular app
ng build

# Run tests
ng test

# Check for errors
ng lint

# Update dependencies
npm update
```

---

## Support & Documentation

- **Laravel API Documentation**: See `API_INTEGRATION.md`
- **Angular Documentation**: https://angular.io/docs
- **Material UI**: https://material.angular.io

---

**Last Updated**: October 31, 2025

**Version**: 1.0.0
