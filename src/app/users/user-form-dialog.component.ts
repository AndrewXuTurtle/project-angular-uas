import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-user-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>person_add</mat-icon>
      Add New User
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <div class="info-message">
          <mat-icon>info</mat-icon>
          <p>Create user first, then assign Business Units and Menus from the dashboard.</p>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" placeholder="Enter username">
          <mat-icon matPrefix>account_circle</mat-icon>
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" placeholder="Enter password">
          <mat-icon matPrefix>lock</mat-icon>
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-hint>Minimum 6 characters</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Level</mat-label>
          <mat-select formControlName="level">
            <mat-option value="admin">
              <mat-icon>admin_panel_settings</mat-icon>
              Admin
            </mat-option>
            <mat-option value="user">
              <mat-icon>person</mat-icon>
              User
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>security</mat-icon>
          <mat-error *ngIf="userForm.get('level')?.hasError('required')">
            Level is required
          </mat-error>
        </mat-form-field>

        <mat-slide-toggle formControlName="is_active" class="full-width">
          <mat-icon class="toggle-icon">{{ userForm.get('is_active')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
          Active User
        </mat-slide-toggle>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid">
        <mat-icon>add</mat-icon>
        Create User
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 500px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
      position: relative;
    }

    mat-slide-toggle {
      margin-top: 8px;
    }

    .info-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
      border-left: 4px solid #667eea;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .info-message mat-icon {
      color: #667eea;
      margin-top: 2px;
    }

    .info-message p {
      margin: 0;
      font-size: 14px;
      color: #424242;
      line-height: 1.5;
    }

    .toggle-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    h2 mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }
  `]
})
export class UserFormDialogComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>
  ) {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      level: ['user', Validators.required],
      is_active: [true]
    });
  }

  onSave(): void {
    if (this.userForm.valid) {
      const userData = {
        username: this.userForm.value.username,
        password: this.userForm.value.password,
        level: this.userForm.value.level,
        is_active: this.userForm.value.is_active
      };
      this.dialogRef.close(userData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
