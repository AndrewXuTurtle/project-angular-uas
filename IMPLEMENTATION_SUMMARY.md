# Angular Frontend - API V3 Integration

## ✅ Perubahan yang Sudah Diimplementasikan

### 1. **Flow Login Baru**
- Login tanpa business unit selection
- Setelah login, user diarahkan ke halaman **Select Business Unit**
- User memilih business unit, baru bisa masuk dashboard

### 2. **Menghapus Sistem Privilege**
- ✅ Dihapus semua permission checking (canCreate, canRead, canUpdate, canDelete)
- ✅ Akses ditentukan berdasarkan role (admin/user) saja
- ✅ Admin: full access ke semua fitur
- ✅ User: akses ke dashboard dan customers saja

### 3. **Menghapus Tabel Transaksis**
- ✅ File `transaksis` component tidak digunakan lagi
- ✅ Routing ke transaksis dihapus

### 4. **Menambahkan Tabel Customers**
- ✅ Customer model dan service
- ✅ Customer component dengan CRUD (Create, Read, Update, Delete)
- ✅ Customer otomatis filtered berdasarkan business unit yang dipilih
- ✅ Lokasi customer ditampilkan di tabel

### 5. **Business Unit Switcher**
- ✅ Dropdown di navbar untuk ganti business unit
- ✅ Saat ganti BU, data customer auto reload
- ✅ Current BU ditampilkan sebagai badge

---

## 🔄 Flow Aplikasi Baru

```
1. User Login (username + password)
   ↓
2. Select Business Unit
   ↓
3. Dashboard Admin
   ├─ Customers (filtered by BU)
   ├─ Users (admin only)
   ├─ Business Units (admin only)
   ├─ Menus (admin only)
   └─ Settings (admin only)
```

---

## 📂 Struktur File Baru

```
src/app/
├── auth/
│   ├── auth.service.ts (updated - tanpa privilege methods)
│   ├── auth.guard.ts
│   └── login/
│       ├── login.component.ts (updated - tanpa BU dropdown)
│       ├── login.component.html (simplified)
│       └── login.component.scss
├── select-business-unit/
│   ├── select-business-unit.component.ts (NEW)
│   ├── select-business-unit.component.html (NEW)
│   └── select-business-unit.component.scss (NEW)
├── customers/
│   ├── customers.component.ts (NEW)
│   ├── customers.component.html (NEW)
│   └── customers.component.scss (NEW)
├── models/
│   ├── customer.model.ts (NEW)
│   └── user.model.ts (updated)
├── services/
│   ├── customer.service.ts (NEW)
│   └── ...
├── layout/
│   ├── navbar/ (updated - BU switcher integrated)
│   └── sidebar/ (simplified - tanpa privilege check)
└── app.routes.ts (updated - added /select-business-unit route)
```

---

## 🔑 API Endpoints yang Digunakan

### Authentication
- `POST /api/login` - Login tanpa BU
- `GET /api/user/business-units` - Get BU list
- `POST /api/select-business-unit` - Pilih BU
- `POST /api/logout` - Logout

### Customers
- `GET /api/customers` - Get customers (auto-filtered by selected BU)
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer (admin only)
- `DELETE /api/customers/:id` - Delete customer (admin only)

---

## 🧪 Testing Credentials

```
Admin:
- Username: admin
- Password: Admin123
- Access: Full (all features)

User:
- Username: user1
- Password: User123
- Access: Limited (dashboard + customers only)
```

---

## 🚀 Cara Menjalankan

1. **Start Laravel API** (port 8000):
   ```bash
   cd laravel-api
   php artisan serve
   ```

2. **Start Angular App** (port 4200):
   ```bash
   cd project-1-angular
   ng serve
   ```

3. **Buka browser**:
   ```
   http://localhost:4200
   ```

4. **Flow testing**:
   - Login dengan `admin` / `Admin123`
   - Pilih business unit (e.g., Batam)
   - Masuk dashboard
   - Buka menu Customers
   - Test CRUD operations
   - Ganti BU dari dropdown navbar
   - Lihat customer list berubah sesuai BU

---

## ⚠️ File yang Tidak Dipakai (Opsional: Bisa Dihapus)

```
src/app/transaksis/  → Tidak dipakai lagi
src/app/privileges/  → Sistem privilege dihapus
src/app/privilege-management/ → Tidak dipakai lagi
src/app/layout/bu-switcher/ → Integrated ke navbar
```

---

## 📝 Notes

- Semua request API otomatis include `Authorization: Bearer {token}`
- Token disimpan di localStorage dengan key `token`
- Selected BU disimpan di localStorage dengan key `selectedBU`
- Saat switch BU, halaman auto-reload untuk refresh data
- Admin bisa CRUD customers, user hanya bisa create

---

**Status: ✅ READY FOR TESTING**
