import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../auth/auth.service';

interface BusinessUnit {
  id: number;
  business_unit: string;
  user_id: number;
  active: string;
}

@Component({
  selector: 'app-select-business-unit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatListModule,
    MatIconModule
  ],
  templateUrl: './select-business-unit.component.html',
  styleUrl: './select-business-unit.component.scss'
})
export class SelectBusinessUnitComponent implements OnInit {
  businessUnits: BusinessUnit[] = [];
  loading = false;
  loadingBUId: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // LOGIC: Admin should not be here, auto-redirect to dashboard
    if (this.authService.isAdmin()) {
      console.log('👑 Admin detected - Redirecting to dashboard');
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    console.log('👤 User must select business unit');
    this.loadBusinessUnits();
  }

  loadBusinessUnits(): void {
    this.loading = true;
    this.authService.getBusinessUnits().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.businessUnits = response.data;
          
          // If only one BU, auto-select it
          if (this.businessUnits.length === 1) {
            this.selectBusinessUnit(this.businessUnits[0].id);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading business units:', error);
        this.snackBar.open(
          error.error?.message || 'Gagal memuat business units',
          'Tutup',
          { duration: 3000 }
        );
      }
    });
  }

  selectBusinessUnit(buId: number): void {
    this.loadingBUId = buId;
    this.authService.selectBusinessUnit(buId).subscribe({
      next: (response) => {
        this.loadingBUId = null;
        if (response.success) {
          this.snackBar.open(
            response.message || 'Business unit berhasil dipilih',
            'Tutup',
            { duration: 2000 }
          );
          // Redirect ke /user/dashboard untuk user biasa
          this.router.navigate(['/user/dashboard']);
        }
      },
      error: (error) => {
        this.loadingBUId = null;
        console.error('Error selecting business unit:', error);
        this.snackBar.open(
          error.error?.message || 'Gagal memilih business unit',
          'Tutup',
          { duration: 3000 }
        );
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }

  /**
   * Skip business unit selection (for admin)
   */
  skipSelection(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  /**
   * Check if user can skip BU selection
   */
  canSkipSelection(): boolean {
    return this.authService.isAdmin();
  }
}
