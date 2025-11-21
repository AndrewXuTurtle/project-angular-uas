# API Testing Guide

## Testing dengan curl

### 1. Login dan Dapatkan Token
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response akan berisi token, copy token tersebut.

### 2. Test Business Units API
```bash
# Ganti YOUR_TOKEN_HERE dengan token dari login
curl -X GET http://localhost:8000/api/business-units \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test Menus API
```bash
curl -X GET http://localhost:8000/api/menus \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Test Users API
```bash
curl -X GET http://localhost:8000/api/users \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Test User Access API
```bash
# Ganti {id} dengan user ID, contoh: 1
curl -X GET http://localhost:8000/api/users/1/access \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Responses

### Business Units
```json
[
  {
    "id": 1,
    "business_unit": "Jakarta",
    "active": "y",
    "created_at": "...",
    "updated_at": "..."
  }
]
```

### Menus
```json
[
  {
    "id": 1,
    "nama_menu": "Dashboard",
    "url_link": "/admin/dashboard",
    "icon": "dashboard",
    "parent": null,
    "active": "y"
  }
]
```

## Common Errors

### 401 Unauthenticated
- Token tidak ada atau expired
- Solusi: Login ulang dan gunakan token baru

### 500 Internal Server Error
- Ada error di backend Laravel
- Check Laravel logs: `tail -f storage/logs/laravel.log`

### Call to undefined relationship [user]
- Model BusinessUnit masih ada relationship user()
- Solusi: Remove dari Laravel model
