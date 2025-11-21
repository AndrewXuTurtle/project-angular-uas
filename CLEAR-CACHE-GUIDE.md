# Clear Cache & Rebuild Guide

## ✅ Angular Server Sudah Di-Restart

Angular dev server sudah di-restart dengan cache bersih:
- Cleared `.angular/cache` folder
- Cleared `dist` folder  
- Fresh build completed
- Server running on http://localhost:4200

## 🌐 Clear Browser Cache

Sekarang Anda perlu **clear browser cache** untuk melihat perubahan:

### Chrome / Edge:
1. Buka http://localhost:4200
2. **Tekan: `Cmd + Shift + R`** (Mac) atau `Ctrl + Shift + R` (Windows)
   - Ini akan **hard refresh** dan bypass cache
3. Atau buka DevTools:
   - Klik kanan → **Inspect**
   - Klik kanan di **Refresh button** 
   - Pilih **"Empty Cache and Hard Reload"**

### Firefox:
1. Buka http://localhost:4200
2. **Tekan: `Cmd + Shift + R`** (Mac) atau `Ctrl + F5` (Windows)

### Safari:
1. Buka http://localhost:4200
2. **Tekan: `Cmd + Option + E`** (Clear cache)
3. Lalu **`Cmd + R`** (Refresh)

## 🔍 Verifikasi Perubahan Sudah Apply

Setelah hard refresh, check:

### 1. ✅ Login Flow
- Login dengan username/password
- **Harus langsung ke `/admin/dashboard`**
- ❌ TIDAK redirect ke `/select-business-unit`

### 2. ✅ Sidebar Clickable
- Semua menu items **HARUS bisa diklik**
- Click "Dashboard" → Navigate ke dashboard
- Click "Users" → Navigate ke users page
- Click "Business Units" → Navigate ke BU page
- Click "Menus" → Navigate ke menus page

### 3. ✅ No Redirect Loop
- Saat di halaman Users/BU/Menus
- **TIDAK ada redirect** ke business unit selection
- Stay di halaman yang diklik

### 4. ✅ Business Unit Selection (Optional)
- Manual navigate ke `/select-business-unit`
- Jika admin → **Tampil tombol "Skip (Admin)"**
- Click skip → Ke dashboard
- Atau pilih BU → Ke dashboard

## 🐛 Jika Masih Bermasalah

### Check Console Browser
1. Buka DevTools (F12)
2. Lihat tab **Console**
3. Cari error merah
4. Screenshot dan share

### Check Network Tab
1. Buka DevTools → Tab **Network**
2. Refresh page
3. Lihat API calls:
   - `/api/menus` → Harus return 200 OK
   - `/api/business-units` → Check response
4. Jika ada 401/500 error → Backend issue

### Check Angular Console Logs
Look for these logs:
```
Menus loaded from database: [...]
Built menu structure: [...]
Menu clicked: {...}
Navigating to: /admin/...
```

## 📋 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| Login | Direct to `/admin/dashboard` |
| Click sidebar menu | Navigate to page (no redirect) |
| Access Users page | Stay on Users page |
| Access BU page | Stay on BU page |
| Open User Form | Dropdowns filled with BU & Menus |
| Change menu in DB | Sidebar updates after page refresh |

## 🔄 Jika Perlu Rebuild Lagi

```bash
# Stop server
pkill -f "ng serve"

# Clear cache
rm -rf .angular/cache dist

# Start fresh
npm run start
```

Lalu **hard refresh browser** lagi dengan `Cmd + Shift + R`

## ✨ Next Steps

1. **Hard refresh browser** dengan `Cmd + Shift + R`
2. Login dan test navigation
3. Check console untuk error
4. Report jika masih ada issue

Server Angular sudah ready di http://localhost:4200 🚀
