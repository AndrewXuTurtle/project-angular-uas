# 🧪 Testing Commands untuk API Laravel V2

## Persiapan
```bash
# Start Laravel Server
cd /path/to/laravel/project
php artisan serve --port=8001
```

## 1. Get Business Units List (Public - No Auth)
```bash
curl http://localhost:8001/api/business-units/list
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "business_unit": "Batam",
      "active": "y"
    },
    {
      "id": 2,
      "business_unit": "Jakarta",
      "active": "y"
    },
    {
      "id": 3,
      "business_unit": "Surabaya",
      "active": "y"
    }
  ]
}
```

---

## 2. Login dengan Business Unit Selection

### Test Admin - Batam
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123",
    "business_unit_id": 1
  }'
```

**Expected Response:**
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
    "business_unit": {
      "id": 1,
      "business_unit": "Batam",
      "active": "y"
    },
    "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

**✅ Simpan TOKEN_BATAM untuk test selanjutnya**

### Test User1 - Jakarta
```bash
curl -X POST http://localhost:8001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "User123",
    "business_unit_id": 2
  }'
```

**✅ Simpan TOKEN_JAKARTA**

---

## 3. Get User Privileges

### Admin - Batam
```bash
curl -X GET http://localhost:8001/api/user/privileges \
  -H "Authorization: Bearer {TOKEN_BATAM}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "level": "admin"
    },
    "business_unit": {
      "id": 1,
      "business_unit": "Batam"
    },
    "menus": [
      {
        "id": 1,
        "nama_menu": "Dashboard",
        "url_link": "/dashboard",
        "parent": null,
        "icon": null,
        "allowed": true,
        "permissions": {
          "c": true,
          "r": true,
          "u": true,
          "d": true
        }
      },
      {
        "id": 2,
        "nama_menu": "Transaksi",
        "url_link": "/transaksi",
        "parent": null,
        "icon": null,
        "allowed": true,
        "permissions": {
          "c": true,
          "r": true,
          "u": true,
          "d": true
        }
      }
      // ... more menus
    ]
  }
}
```

### User1 - Jakarta
```bash
curl -X GET http://localhost:8001/api/user/privileges \
  -H "Authorization: Bearer {TOKEN_JAKARTA}"
```

**Expected Response (Limited):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "username": "user1",
      "level": "user"
    },
    "business_unit": {
      "id": 2,
      "business_unit": "Jakarta"
    },
    "menus": [
      {
        "id": 1,
        "nama_menu": "Dashboard",
        "allowed": true,
        "permissions": {
          "c": false,
          "r": true,
          "u": false,
          "d": false
        }
      },
      {
        "id": 2,
        "nama_menu": "Transaksi",
        "allowed": true,
        "permissions": {
          "c": true,
          "r": true,
          "u": false,
          "d": false
        }
      }
      // Menu lain dengan allowed=false tidak muncul
    ]
  }
}
```

---

## 4. Get Transaksis (Filtered by Business Unit from Token)

### Admin - Batam
```bash
curl -X GET http://localhost:8001/api/transaksis \
  -H "Authorization: Bearer {TOKEN_BATAM}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaksi retrieved successfully",
  "data": [
    {
      "id": 1,
      "kode_transaksi": "TRX-BTM-001",
      "nama_transaksi": "Pembelian Komputer",
      "jumlah": "15000000.00",
      "tanggal": "2025-11-01",
      "status": "approved",
      "business_unit": {
        "id": 1,
        "business_unit": "Batam"
      },
      "user": {
        "id": 1,
        "username": "admin"
      }
    },
    {
      "id": 2,
      "kode_transaksi": "TRX-BTM-002",
      "nama_transaksi": "Sewa Kantor",
      "jumlah": "5000000.00",
      "tanggal": "2025-11-02",
      "status": "pending",
      "business_unit": {
        "id": 1,
        "business_unit": "Batam"
      }
    },
    {
      "id": 3,
      "kode_transaksi": "TRX-BTM-003",
      "nama_transaksi": "Gaji Karyawan",
      "jumlah": "20000000.00",
      "tanggal": "2025-11-03",
      "status": "approved",
      "business_unit": {
        "id": 1,
        "business_unit": "Batam"
      }
    }
  ]
}
```

### User1 - Jakarta
```bash
curl -X GET http://localhost:8001/api/transaksis \
  -H "Authorization: Bearer {TOKEN_JAKARTA}"
```

**Expected Response (Jakarta transaksis only):**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "kode_transaksi": "TRX-JKT-001",
      "nama_transaksi": "Pembelian Furniture",
      "jumlah": "8000000.00",
      "business_unit": {
        "id": 2,
        "business_unit": "Jakarta"
      }
    },
    {
      "id": 5,
      "kode_transaksi": "TRX-JKT-002",
      "nama_transaksi": "Maintenance AC",
      "jumlah": "3000000.00",
      "business_unit": {
        "id": 2,
        "business_unit": "Jakarta"
      }
    },
    {
      "id": 6,
      "kode_transaksi": "TRX-JKT-003",
      "nama_transaksi": "Biaya Listrik",
      "jumlah": "2500000.00",
      "business_unit": {
        "id": 2,
        "business_unit": "Jakarta"
      }
    }
  ]
}
```

---

## 5. Create Transaksi (Auto-assigned to Business Unit from Token)

### Admin - Batam
```bash
curl -X POST http://localhost:8001/api/transaksis \
  -H "Authorization: Bearer {TOKEN_BATAM}" \
  -H "Content-Type: application/json" \
  -d '{
    "kode_transaksi": "TRX-BTM-004",
    "nama_transaksi": "Pembelian Printer",
    "jumlah": 3500000,
    "tanggal": "2025-11-07",
    "status": "pending",
    "keterangan": "Printer Canon untuk admin"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Transaksi created successfully",
  "data": {
    "id": 9,
    "kode_transaksi": "TRX-BTM-004",
    "nama_transaksi": "Pembelian Printer",
    "jumlah": "3500000.00",
    "tanggal": "2025-11-07",
    "status": "pending",
    "keterangan": "Printer Canon untuk admin",
    "business_unit_id": 1,
    "user_id": 1,
    "business_unit": {
      "id": 1,
      "business_unit": "Batam"
    }
  }
}
```

---

## 6. Switch Business Unit (Tanpa Logout)

### Switch dari Batam ke Jakarta
```bash
curl -X POST http://localhost:8001/api/switch-business-unit \
  -H "Authorization: Bearer {TOKEN_BATAM}" \
  -H "Content-Type: application/json" \
  -d '{
    "business_unit_id": 2
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Business unit switched successfully",
  "data": {
    "user": {
      "id": 1,
      "username": "admin"
    },
    "business_unit": {
      "id": 2,
      "business_unit": "Jakarta"
    },
    "token": "2|yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy"
  }
}
```

**✅ Simpan NEW_TOKEN_JAKARTA**

### Test dengan Token Baru (Sekarang Lihat Jakarta Data)
```bash
curl -X GET http://localhost:8001/api/transaksis \
  -H "Authorization: Bearer {NEW_TOKEN_JAKARTA}"
```

**Expected Response (Jakarta transaksis):**
```json
{
  "success": true,
  "data": [
    {
      "id": 4,
      "kode_transaksi": "TRX-JKT-001",
      "business_unit": {"business_unit": "Jakarta"}
    },
    {
      "id": 5,
      "kode_transaksi": "TRX-JKT-002",
      "business_unit": {"business_unit": "Jakarta"}
    },
    {
      "id": 6,
      "kode_transaksi": "TRX-JKT-003",
      "business_unit": {"business_unit": "Jakarta"}
    }
  ]
}
```

---

## 7. Get Users (Admin Only, All Users Visible)

```bash
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer {TOKEN_BATAM}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "admin",
      "level": "admin",
      "is_active": true
    },
    {
      "id": 2,
      "username": "user1",
      "level": "user",
      "is_active": true
    },
    {
      "id": 3,
      "username": "user2",
      "level": "user",
      "is_active": true
    }
  ]
}
```

---

## 8. Cross-Business Unit Access Test (Should Fail)

### Coba Akses Transaksi Jakarta dengan Token Batam
```bash
curl -X GET http://localhost:8001/api/transaksis/4 \
  -H "Authorization: Bearer {TOKEN_BATAM}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized access to this transaksi"
}
```

---

## 9. User Try to Access Users List (Should Fail)

```bash
curl -X GET http://localhost:8001/api/users \
  -H "Authorization: Bearer {TOKEN_JAKARTA}"
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Only admin can access user list"
}
```

---

## 10. Get All Privilege Users (untuk Privilege Management UI)

```bash
curl -X GET http://localhost:8001/api/privilege-users \
  -H "Authorization: Bearer {TOKEN_BATAM}"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "menu_id": 1,
      "allowed": true,
      "c": true,
      "r": true,
      "u": true,
      "d": true,
      "user": {
        "id": 1,
        "username": "admin"
      },
      "menu": {
        "id": 1,
        "nama_menu": "Dashboard"
      }
    }
    // ... more privilege records
  ]
}
```

---

## 11. Update Privilege (Ubah Allowed dan Permissions)

```bash
curl -X PUT http://localhost:8001/api/privilege-users/1 \
  -H "Authorization: Bearer {TOKEN_BATAM}" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "menu_id": 1,
    "allowed": true,
    "c": false,
    "r": true,
    "u": false,
    "d": false
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Privilege updated successfully",
  "data": {
    "id": 1,
    "user_id": 1,
    "menu_id": 1,
    "allowed": true,
    "c": false,
    "r": true,
    "u": false,
    "d": false
  }
}
```

---

## 📊 Summary Test Checklist

| No | Test Case | Expected Result | Status |
|----|-----------|----------------|--------|
| 1 | Get BU List (Public) | 3 BUs (Batam, Jakarta, Surabaya) | ⬜ |
| 2 | Login Admin + Batam | Token + BU Batam | ⬜ |
| 3 | Login User1 + Jakarta | Token + BU Jakarta | ⬜ |
| 4 | Get Privileges Admin | Full menus, all allowed=true | ⬜ |
| 5 | Get Privileges User1 | Limited menus, some allowed=false | ⬜ |
| 6 | Get Transaksis Batam | 3 Batam transaksis only | ⬜ |
| 7 | Get Transaksis Jakarta | 3 Jakarta transaksis only | ⬜ |
| 8 | Create Transaksi Batam | Auto BU=1, user=1 | ⬜ |
| 9 | Switch BU Batam→Jakarta | New token, BU Jakarta | ⬜ |
| 10 | Get Transaksis (after switch) | Jakarta transaksis | ⬜ |
| 11 | Get Users (Admin) | All 3 users visible | ⬜ |
| 12 | Cross-BU Access | 403 Forbidden | ⬜ |
| 13 | User Access Users List | 403 Forbidden | ⬜ |
| 14 | Get Privilege Users | All privilege records | ⬜ |
| 15 | Update Privilege | Success message | ⬜ |

---

## 🎯 Quick Test Script

Jalankan semua test sekaligus (copy paste ke terminal):

```bash
# Variables
API_URL="http://localhost:8001/api"

echo "=== 1. Get Business Units ==="
curl $API_URL/business-units/list
echo "\n\n"

echo "=== 2. Login Admin - Batam ==="
TOKEN_BATAM=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123","business_unit_id":1}' \
  | jq -r '.data.token')
echo "Token Batam: $TOKEN_BATAM"
echo "\n\n"

echo "=== 3. Login User1 - Jakarta ==="
TOKEN_JAKARTA=$(curl -s -X POST $API_URL/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","password":"User123","business_unit_id":2}' \
  | jq -r '.data.token')
echo "Token Jakarta: $TOKEN_JAKARTA"
echo "\n\n"

echo "=== 4. Get Privileges Admin ==="
curl -s $API_URL/user/privileges \
  -H "Authorization: Bearer $TOKEN_BATAM" | jq
echo "\n\n"

echo "=== 5. Get Transaksis Batam ==="
curl -s $API_URL/transaksis \
  -H "Authorization: Bearer $TOKEN_BATAM" | jq
echo "\n\n"

echo "=== 6. Get Transaksis Jakarta ==="
curl -s $API_URL/transaksis \
  -H "Authorization: Bearer $TOKEN_JAKARTA" | jq
echo "\n\n"

echo "=== 7. Switch BU to Jakarta ==="
NEW_TOKEN=$(curl -s -X POST $API_URL/switch-business-unit \
  -H "Authorization: Bearer $TOKEN_BATAM" \
  -H "Content-Type: application/json" \
  -d '{"business_unit_id":2}' \
  | jq -r '.data.token')
echo "New Token: $NEW_TOKEN"
echo "\n\n"

echo "=== 8. Get Transaksis (After Switch) ==="
curl -s $API_URL/transaksis \
  -H "Authorization: Bearer $NEW_TOKEN" | jq
echo "\n\n"
```

---

**Jalankan test commands ini satu per satu dan catat hasilnya. Jika ada yang tidak sesuai expected response, kirimkan hasil actual response untuk troubleshooting!**
