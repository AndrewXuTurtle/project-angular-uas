import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  generalForm!: FormGroup;
  securityForm!: FormGroup;
  notificationForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
  }

  initForms(): void {
    // General Settings Form
    this.generalForm = this.fb.group({
      appName: ['Admin Dashboard', Validators.required],
      appDescription: ['Application for managing users and business units'],
      itemsPerPage: [10, [Validators.required, Validators.min(5), Validators.max(100)]],
      language: ['en', Validators.required],
      timezone: ['Asia/Jakarta', Validators.required]
    });

    // Security Settings Form
    this.securityForm = this.fb.group({
      sessionTimeout: [30, [Validators.required, Validators.min(5), Validators.max(120)]],
      maxLoginAttempts: [5, [Validators.required, Validators.min(3), Validators.max(10)]],
      passwordMinLength: [8, [Validators.required, Validators.min(6), Validators.max(20)]],
      requireSpecialChar: [true],
      requireUppercase: [true],
      requireNumber: [true]
    });

    // Notification Settings Form
    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [false],
      smsNotifications: [false],
      notifyOnUserCreate: [true],
      notifyOnUserUpdate: [true],
      notifyOnUserDelete: [true]
    });
  }

  saveGeneralSettings(): void {
    if (this.generalForm.valid) {
      console.log('General Settings:', this.generalForm.value);
      this.showSnackBar('General settings saved successfully', 'success');
    }
  }

  saveSecuritySettings(): void {
    if (this.securityForm.valid) {
      console.log('Security Settings:', this.securityForm.value);
      this.showSnackBar('Security settings saved successfully', 'success');
    }
  }

  saveNotificationSettings(): void {
    if (this.notificationForm.valid) {
      console.log('Notification Settings:', this.notificationForm.value);
      this.showSnackBar('Notification settings saved successfully', 'success');
    }
  }

  resetToDefaults(): void {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      this.initForms();
      this.showSnackBar('Settings reset to defaults', 'info');
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [type === 'success' ? 'success-snackbar' : type === 'error' ? 'error-snackbar' : 'info-snackbar']
    });
  }
}
