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
import { AuthService } from '../auth.service';

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
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Redirect jika sudah login
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/dashboard']);
      return;
    }

    // Inisialisasi form
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
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
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          const user = response.data.user;
          
          this.snackBar.open(response.message || 'Login berhasil!', 'Tutup', {
            duration: 2000,
            horizontalPosition: 'end',
            verticalPosition: 'top'
          });
          
          // LOGIC: Admin bypass BU selection, User must select BU
          if (user.level === 'admin') {
            console.log('👑 Admin login - Direct to dashboard');
            this.router.navigate(['/admin/dashboard']);
          } else {
            console.log('👤 User login - Must select business unit');
            this.router.navigate(['/select-business-unit']);
          }
        }
      },
      error: (error: any) => {
        this.loading = false;
        const errorMessage = error.error?.message || error.message || 'Login gagal. Silakan coba lagi.';
        this.snackBar.open(errorMessage, 'Tutup', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top'
        });
      }
    });
  }
}
