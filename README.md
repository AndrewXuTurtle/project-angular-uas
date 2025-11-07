# Admin Dashboard - Angular 20 Application# AdminDashboard



Admin Dashboard aplikasi frontend yang dibangun dengan Angular 20 dan Angular Material, siap untuk dihubungkan ke REST API Laravel.This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.8.



## 🎯 Fitur Utama## Development server



- ✅ **Autentikasi dengan Dummy Data**To start a local development server, run:

  - Login dengan username: `admin`, password: `admin123`

  - Token management di localStorage```bash

  - Auth Guard untuk proteksi routeng serve

```

- ✅ **Layout Admin Responsif**

  - Navbar (top) dengan user menu dan notifikasiOnce the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

  - Sidebar (left) dengan menu tree dinamis

  - Footer (bottom)## Code scaffolding

  - Responsive untuk semua ukuran layar

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

- ✅ **Dashboard**

  - Statistik cards (Users, Menus, Business Units, Privileges)```bash

  - Recent activitiesng generate component component-name

  - Quick actions```

  - System information

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

- ✅ **CRUD Management (Dummy Data)**

  - Users Management (full CRUD dengan dialog form)```bash

  - Menus Management (list dengan placeholder)ng generate --help

  - Privileges Management (list dengan placeholder)```

  - Business Units Management (list dengan placeholder)

## Building

- ✅ **HTTP Interceptor**

  - Auto-inject Bearer token ke setiap requestTo build the project run:

  - Logging untuk debugging

```bash

## 📦 Teknologi yang Digunakanng build

```

- **Angular 20.3.8** - Framework utama

- **Angular Material 20.2.10** - UI Component libraryThis will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

- **RxJS** - Reactive programming

- **TypeScript** - Type-safe JavaScript## Running unit tests

- **SCSS** - Styling

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

## 📁 Struktur Folder

```bash

```ng test

src/app/```

├── auth/

│   ├── login/## Running end-to-end tests

│   │   ├── login.component.ts

│   │   ├── login.component.htmlFor end-to-end (e2e) testing, run:

│   │   └── login.component.scss

│   ├── auth.service.ts          # Service autentikasi dengan dummy data```bash

│   └── auth.guard.ts             # Guard untuk proteksi routeng e2e

├── layout/```

│   ├── navbar/

│   ├── sidebar/Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

│   ├── footer/

│   └── layout.component.ts       # Main layout component## Additional Resources

├── dashboard/

│   └── dashboard.component.ts    # Dashboard dengan statistikFor more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

├── users/
│   ├── users.component.ts        # CRUD Users (full implementation)
│   └── user-form-dialog.component.ts
├── menus/
│   └── menus.component.ts        # Placeholder component
├── privileges/
│   └── privileges.component.ts   # Placeholder component
├── business-units/
│   └── business-units.component.ts # Placeholder component
├── services/
│   ├── user.service.ts           # Dummy service untuk Users
│   └── menu.service.ts           # Dummy service untuk Menu
├── interceptors/
│   └── auth.interceptor.ts       # HTTP interceptor untuk Authorization header
├── models/
│   ├── user.model.ts
│   ├── menu.model.ts
│   ├── privilege.model.ts
│   └── business-unit.model.ts
├── app.routes.ts                 # Routing configuration
└── app.config.ts                 # App configuration dengan providers
```

## 🚀 Cara Menjalankan

### 1. Install Dependencies

```bash
cd admin-dashboard
npm install
```

### 2. Jalankan Development Server

```bash
ng serve
```

Aplikasi akan berjalan di `http://localhost:4200/`

### 3. Build untuk Production

```bash
ng build
```

Output akan tersimpan di folder `dist/admin-dashboard/`

## 🔐 Login Credentials

Untuk testing, gunakan credentials berikut:

- **Username:** `admin`
- **Password:** `admin123`

> **Tip:** Di halaman login, klik tombol "Auto Fill" untuk mengisi form secara otomatis.

## 📱 Navigasi Aplikasi

Setelah login, Anda dapat mengakses:

- `/admin/dashboard` - Dashboard dengan statistik
- `/admin/users` - Management users (full CRUD)
- `/admin/menus` - Management menus (placeholder)
- `/admin/privileges` - Management privileges (placeholder)
- `/admin/business-units` - Management business units (placeholder)

## 🔄 Menghubungkan ke Laravel API

Saat ini aplikasi menggunakan **dummy data** dan **mock services**. Untuk menghubungkan ke Laravel API:

### 1. Update Environment Configuration

Buat file `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'  // URL Laravel API Anda
};
```

### 2. Update Auth Service

Edit `src/app/auth/auth.service.ts`:

```typescript
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

// Ganti method login dummy dengan HTTP request:
login(credentials: LoginRequest): Observable<LoginResponse> {
  return this.http.post<LoginResponse>(
    `${environment.apiUrl}/auth/login`,
    credentials
  );
}
```

### 3. Update Other Services

Contoh untuk `UserService`:

```typescript
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${environment.apiUrl}/users`);
}

createUser(user: User): Observable<User> {
  return this.http.post<User>(`${environment.apiUrl}/users`, user);
}

updateUser(id: number, user: User): Observable<User> {
  return this.http.put<User>(`${environment.apiUrl}/users/${id}`, user);
}

deleteUser(id: number): Observable<boolean> {
  return this.http.delete<boolean>(`${environment.apiUrl}/users/${id}`);
}
```

### 4. Update Interceptor (Opsional)

Interceptor sudah siap! Hanya perlu menghapus console.log jika tidak diperlukan:

```typescript
// Hapus baris console.log di auth.interceptor.ts
```

## 🎨 Customization

### Mengubah Tema

Edit `src/styles.scss` untuk mengubah warna tema:

```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
// Atau pilih tema lain:
// @import '@angular/material/prebuilt-themes/deeppurple-amber.css';
// @import '@angular/material/prebuilt-themes/purple-green.css';
// @import '@angular/material/prebuilt-themes/pink-bluegrey.css';
```

### Menambah Menu Baru

Edit `src/app/services/menu.service.ts`:

```typescript
private DUMMY_MENUS: Menu[] = [
  // ... existing menus
  {
    id: 10,
    nama_menu: 'Menu Baru',
    url_link: '/admin/menu-baru',
    icon: 'star',
    parent_id: null,
    order_index: 5,
    is_active: true,
    children: []
  }
];
```

## 📋 To-Do List

Ketika API Laravel sudah siap:

- [ ] Ubah semua dummy services menjadi HTTP requests
- [ ] Implementasi error handling yang lebih baik
- [ ] Tambahkan loading indicators
- [ ] Implementasi refresh token mechanism
- [ ] Tambahkan form validation yang lebih kompleks
- [ ] Implementasi full CRUD untuk Menus, Privileges, dan Business Units
- [ ] Tambahkan pagination, sorting, dan filtering di tabel
- [ ] Implementasi role-based access control (RBAC)
- [ ] Tambahkan unit tests dan e2e tests

## 🐛 Troubleshooting

### Port 4200 sudah digunakan

```bash
ng serve --port 4201
```

### Error saat npm install

Hapus folder `node_modules` dan `package-lock.json`, lalu install ulang:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Compile error

Jalankan:

```bash
npm run build
```

Untuk melihat detail error.

## 📝 Notes

- Aplikasi ini menggunakan **standalone components** (Angular modern approach)
- Semua data bersifat **in-memory** dan akan hilang saat refresh
- HTTP Interceptor sudah configured dan akan otomatis menambahkan Bearer token
- Auth Guard melindungi semua route `/admin/*`
- Sidebar menu di-generate secara dinamis dari service

## 📞 Support

Jika ada pertanyaan atau issues, silakan buat issue di repository ini.

## 📄 License

MIT License - Feel free to use for your projects!

---

**Happy Coding! 🚀**
