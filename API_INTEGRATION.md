# API Integration Guide

## Overview
Frontend Angular ini telah dikonfigurasi untuk terhubung dengan Laravel REST API di `http://localhost:8001/api`

## Configuration

### Environment Files
- **Development**: `/src/environments/environment.ts`
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8001/api'
  };
  ```

- **Production**: `/src/environments/environment.prod.ts`
  ```typescript
  export const environment = {
    production: true,
    apiUrl: 'https://your-production-api.com/api'
  };
  ```

## Authentication

### Login
- **Endpoint**: `POST /api/login`
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Login berhasil",
    "data": {
      "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
      "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "full_name": "Administrator",
        "level": "admin"
      }
    }
  }
  ```

### Logout
- **Endpoint**: `POST /api/logout`
- **Headers**: `Authorization: Bearer {token}`

### Get Current User
- **Endpoint**: `GET /api/user`
- **Headers**: `Authorization: Bearer {token}`

## API Endpoints

### Users (`/api/users`)
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/{id}/activate` - Activate user
- `POST /api/users/{id}/deactivate` - Deactivate user
- `POST /api/users/{id}/change-password` - Change password

### Menus (`/api/menus`)
- `GET /api/menus` - Get all menus (flat list)
- `GET /api/menus/tree` - Get menu tree (hierarchical)
- `GET /api/menus/{id}` - Get menu by ID
- `POST /api/menus` - Create new menu
- `PUT /api/menus/{id}` - Update menu
- `DELETE /api/menus/{id}` - Delete menu

### Privileges (`/api/privilege-users`)
- `GET /api/privilege-users` - Get all privileges
- `GET /api/privilege-users?user_id={userId}` - Get user privileges
- `GET /api/privilege-users/{id}` - Get privilege by ID
- `POST /api/privilege-users` - Create privilege
- `PUT /api/privilege-users/{id}` - Update privilege
- `DELETE /api/privilege-users/{id}` - Delete privilege

### Business Units (`/api/business-units`)
- `GET /api/business-units` - Get all business units
- `GET /api/business-units?active=y` - Get active only
- `GET /api/business-units?user_id={userId}` - Get by user
- `GET /api/business-units/{id}` - Get by ID
- `POST /api/business-units` - Create business unit
- `PUT /api/business-units/{id}` - Update business unit
- `DELETE /api/business-units/{id}` - Delete business unit
- `POST /api/business-units/{id}/activate` - Activate
- `POST /api/business-units/{id}/deactivate` - Deactivate

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "message": string,
  "data": any
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [...]
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Terjadi kesalahan",
  "data": null
}
```

## HTTP Interceptor

The app automatically adds `Authorization: Bearer {token}` header to all requests via `auth.interceptor.ts`.

Token is stored in `localStorage` after successful login.

## CORS Configuration

Make sure your Laravel API has CORS configured to allow requests from Angular dev server:

```php
// In Laravel: config/cors.php
'allowed_origins' => ['http://localhost:4200'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => true,
```

## Testing the Integration

### 1. Start Laravel API
```bash
cd /path/to/laravel-api
php artisan serve --port=8001
```

### 2. Start Angular Dev Server
```bash
cd /Users/andrew/development/project-1-angular
ng serve
```

### 3. Access the Application
Open browser: `http://localhost:4200`

### 4. Test Login
- Navigate to `/login`
- Enter credentials (e.g., admin/admin123)
- Should redirect to dashboard with user info in navbar

### 5. Test API Calls
Open browser DevTools → Network tab to see API requests:
- Login request to `/api/login`
- Menu request to `/api/menus/tree`
- User list request to `/api/users`

## Error Handling

The app handles errors in two ways:

1. **HTTP Errors** (4xx, 5xx): Caught in component's error callback
2. **Network Errors**: Also caught in error callback

Example in component:
```typescript
this.userService.getUsers().subscribe({
  next: (users) => {
    // Success - display users
    this.users = users;
  },
  error: (error) => {
    // Error - show message
    const errorMessage = error.error?.message || 'Terjadi kesalahan';
    this.snackBar.open(errorMessage, 'Tutup', { duration: 5000 });
  }
});
```

## Models Updated

All models have been updated to match Laravel API schema:

- ✅ `User`: Added `level` (admin/user), updated LoginResponse
- ✅ `Menu`: Changed `parent_id` → `parent`
- ✅ `Privilege`: Changed to `c/r/u/d` boolean flags
- ✅ `BusinessUnit`: Updated to `business_unit` string, `active` ('y'/'n')

## Services Created/Updated

- ✅ `AuthService`: Real API login/logout/getCurrentUser
- ✅ `UserService`: Full CRUD with API
- ✅ `MenuService`: Get menus and tree from API
- ✅ `PrivilegeService`: NEW - Full CRUD for privileges
- ✅ `BusinessUnitService`: NEW - Full CRUD for business units

## Components Updated

- ✅ `LoginComponent`: Handles API response structure
- ✅ `SidebarComponent`: Loads menu from API (Observable)
- ✅ `NavbarComponent`: Logout calls API

## Next Steps

1. **Test All Endpoints**: Verify each CRUD operation works
2. **Add Error Messages**: Display user-friendly error messages
3. **Add Loading States**: Show spinners during API calls
4. **Add Validation**: Client-side validation before API calls
5. **Add Confirmations**: Confirm dialogs for delete operations
6. **Handle Token Expiry**: Auto logout on 401 responses
7. **Add Refresh Token**: If API supports it
8. **Add Role-Based Access**: Hide/show features based on user level

## Troubleshooting

### CORS Error
**Problem**: `Access to XMLHttpRequest ... has been blocked by CORS policy`
**Solution**: Configure Laravel CORS middleware properly

### 401 Unauthorized
**Problem**: API returns 401 for protected routes
**Solution**: Check if token is being sent in Authorization header

### Connection Refused
**Problem**: `net::ERR_CONNECTION_REFUSED`
**Solution**: Make sure Laravel API is running on port 8001

### Token Not Found
**Problem**: User gets logged out unexpectedly
**Solution**: Check if token is stored in localStorage after login
