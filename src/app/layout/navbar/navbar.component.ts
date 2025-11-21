import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';

interface BusinessUnit {
  id: number;
  business_unit: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;
  currentBU: BusinessUnit | null = null;
  businessUnits: BusinessUnit[] = [];
  selectedBUId: number | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
    });
    
    // Load current business unit
    this.currentBU = this.authService.getCurrentBusinessUnit();
    this.selectedBUId = this.authService.getSelectedBusinessUnitId();
    
    // Load available business units
    this.loadBusinessUnits();
  }

  loadBusinessUnits(): void {
    this.authService.getBusinessUnits().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.businessUnits = response.data;
        }
      },
      error: (error: any) => {
        console.error('Error loading business units:', error);
      }
    });
  }

  onBUChange(buId: number): void {
    this.authService.selectBusinessUnit(buId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.currentBU = response.data.business_unit;
          this.snackBar.open(
            `Switched to ${this.currentBU?.business_unit}`,
            'Close',
            { duration: 2000 }
          );
          // Reload page to refresh data
          window.location.reload();
        }
      },
      error: (error: any) => {
        console.error('Error switching business unit:', error);
        this.snackBar.open(
          'Failed to switch business unit',
          'Close',
          { duration: 3000 }
        );
      }
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        // Logout berhasil, AuthService sudah handle redirect
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Tetap redirect ke login meskipun error
        this.router.navigate(['/login']);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/admin/profile']);
  }
}
