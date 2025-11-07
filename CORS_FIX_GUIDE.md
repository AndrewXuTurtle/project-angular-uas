# CORS Configuration Fix untuk Laravel API

## ❌ Error yang Terjadi

```
Access to XMLHttpRequest at 'http://localhost:8000/api/login' from origin 'http://localhost:63684' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ Solusi

### 1. Pastikan CORS Middleware Terpasang di Laravel

Di Laravel project Anda, pastikan file `config/cors.php` ada dan dikonfigurasi dengan benar:

**File: `config/cors.php`**
```php
<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['http://localhost:4200', 'http://localhost:63684'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

### 2. Aktifkan CORS Middleware

Pastikan CORS middleware aktif di `bootstrap/app.php` (Laravel 11) atau `app/Http/Kernel.php` (Laravel 10):

**Laravel 11 (`bootstrap/app.php`):**
```php
<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
```

**Laravel 10 (`app/Http/Kernel.php`):**
```php
protected $middlewareGroups = [
    'api' => [
        \Illuminate\Http\Middleware\HandleCors::class,
        // \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```

### 3. Alternatif: Tambahkan Header Manual di Controller/Middleware

Jika cara di atas tidak bekerja, buat middleware custom:

```bash
php artisan make:middleware Cors
```

**File: `app/Http/Middleware/Cors.php`**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class Cors
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        
        return $response;
    }
}
```

Daftarkan di `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->api(prepend: [
        \App\Http\Middleware\Cors::class,
    ]);
})
```

### 4. Handle OPTIONS Request

Pastikan Laravel menangani preflight OPTIONS request. Tambahkan di `routes/api.php`:

```php
// Handle preflight requests
Route::options('/{any}', function () {
    return response()->json(['status' => 'ok'], 200);
})->where('any', '.*');
```

### 5. Restart Laravel Server

Setelah konfigurasi:

```bash
# Stop server (Ctrl+C)
# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Start server
php artisan serve --port=8000
```

## 📋 Checklist Troubleshooting

- [ ] `config/cors.php` sudah dikonfigurasi dengan benar
- [ ] Origin Angular (`http://localhost:63684`) ada di `allowed_origins`
- [ ] CORS middleware aktif di `bootstrap/app.php` atau `Kernel.php`
- [ ] Laravel server sudah di-restart
- [ ] Cache Laravel sudah di-clear
- [ ] Browser cache sudah di-clear (Ctrl+Shift+Delete)
- [ ] Cek Network tab di DevTools untuk melihat response headers

## 🔍 Test CORS Configuration

### Test dengan CURL

```bash
curl -H "Origin: http://localhost:63684" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -X OPTIONS \
  --verbose \
  http://localhost:8000/api/login
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:63684
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Test dengan Browser DevTools

1. Buka browser DevTools (F12)
2. Go to Network tab
3. Try login dari Angular app
4. Lihat OPTIONS request (preflight)
5. Check response headers harus ada:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`

## ⚙️ Development vs Production

### Development (Lokal)
```php
'allowed_origins' => ['*'], // Izinkan semua origin
```

### Production
```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://app.yourdomain.com'
], // Hanya domain spesifik
```

## 🚨 Common Mistakes

1. ❌ Lupa restart server setelah update config
2. ❌ Cache Laravel tidak di-clear
3. ❌ Origin tidak match persis (http vs https, port berbeda)
4. ❌ CORS middleware tidak terdaftar
5. ❌ Middleware order salah (CORS harus prepend/pertama)

## 📖 References

- [Laravel CORS Documentation](https://laravel.com/docs/11.x/routing#cors)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**Setelah fix CORS, Angular app akan bisa berkomunikasi dengan Laravel API dengan lancar!** ✅
