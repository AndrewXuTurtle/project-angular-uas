import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../../../environments/environment';

interface BusinessUnit {
  id: number;
  business_unit: string;
  active: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  returnUrl: string = '';
  hidePassword = true;
  businessUnits: BusinessUnit[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Redirect jika sudah login
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // Load business units for dropdown
    this.loadBusinessUnits();

    // Inisialisasi form with business_unit_id
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      business_unit_id: ['', Validators.required]
    });

    // Get return url dari query params atau default ke dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
  }

  loadBusinessUnits(): void {
    this.http.get<any>(`${environment.apiUrl}/business-units/list`).subscribe({
      next: (response) => {
        this.businessUnits = response.data || [];
      },
      error: (error) => {
        console.error('Error loading business units:', error);
        this.snackBar.open('Failed to load business units', 'Close', {
          duration: 3000
        });
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Store business unit in localStorage
          localStorage.setItem('business_unit', JSON.stringify(response.data.business_unit));
          
          this.snackBar.open(response.message || 'Login berhasil!', 'Tutup', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
          });
          
          this.router.navigate([this.returnUrl]);
        }
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.message || error.message || 'Login gagal. Silakan coba lagi.';
        this.snackBar.open(errorMessage, 'Tutup', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}
