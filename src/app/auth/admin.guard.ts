import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in and is admin
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Redirect ke dashboard jika bukan admin
  router.navigate(['/admin/dashboard']);
  return false;
};
