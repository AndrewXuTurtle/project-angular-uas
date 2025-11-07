import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  console.log('🔒 Auth Interceptor');
  console.log('Request URL:', req.url);
  console.log('Token:', token ? 'Present' : 'Not found');

  // Clone request dan tambahkan headers
  let clonedReq = req.clone({
    setHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });

  // Tambahkan Authorization header jika ada token
  if (token) {
    clonedReq = clonedReq.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('✅ Added Authorization header');
  } else {
    console.log('⚠️ No token, proceeding without Authorization header');
  }

  // Handle response dan error
  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid
        console.log('❌ 401 Unauthorized - Redirecting to login');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};
