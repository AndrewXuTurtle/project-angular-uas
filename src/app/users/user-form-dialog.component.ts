import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { User, UserAccess, UserAccessForm } from '../models/user.model';
import { BusinessUnit } from '../models/business-unit.model';
import { Menu } from '../models/menu.model';
import { UserService } from '../services/user.service';
import { BusinessUnitService } from '../services/business-unit.service';
import { MenuService } from '../services/menu.service';
import { forkJoin } from 'rxjs';

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
    MatProgressSpinnerModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.isEdit ? 'edit' : 'person_add' }}</mat-icon>
      {{ data.isEdit ? 'Edit User' : 'Add New User' }}
    </h2>
    
    <mat-dialog-content>
      <div *ngIf="loading" class="loading-overlay">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Loading...</p>
      </div>

      <form [formGroup]="userForm" class="user-form" *ngIf="!loading">
        <!-- Basic Info -->
        <div class="section-header">
          <mat-icon>person</mat-icon>
          <h3>Basic Information</h3>
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
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="full_name" placeholder="Enter full name">
          <mat-icon matPrefix>badge</mat-icon>
          <mat-error *ngIf="userForm.get('full_name')?.hasError('required')">
            Full name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" placeholder="Enter email">
          <mat-icon matPrefix>email</mat-icon>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Invalid email format
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width" *ngIf="!data.isEdit">
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

        <!-- Business Unit Selection (Single) -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Business Unit</mat-label>
          <mat-select formControlName="business_unit_id" placeholder="Select a business unit">
            <mat-option [value]="null">
              <mat-icon>block</mat-icon>
              None / No Business Unit
            </mat-option>
            @if (allBusinessUnits.length === 0) {
              <mat-option disabled>
                <em>Loading business units...</em>
              </mat-option>
            }
            @for (bu of allBusinessUnits; track bu.id) {
              <mat-option [value]="bu.id">
                <mat-icon>business</mat-icon>
                {{ bu.business_unit }}
              </mat-option>
            }
          </mat-select>
          <mat-icon matPrefix>business_center</mat-icon>
          <mat-hint>
            Select user's business unit location
            @if (allBusinessUnits.length > 0) {
              <span> ({{ allBusinessUnits.length }} available)</span>
            }
          </mat-hint>
          <mat-error *ngIf="allBusinessUnits.length === 0">
            No business units available. Check API connection.
          </mat-error>
        </mat-form-field>

        <mat-slide-toggle formControlName="is_active" class="full-width">
          <mat-icon class="toggle-icon">{{ userForm.get('is_active')?.value ? 'check_circle' : 'cancel' }}</mat-icon>
          Active User
        </mat-slide-toggle>

        <!-- Menu Access (for all users) -->
        <div class="access-section">
          <div class="section-header">
            <mat-icon>menu_open</mat-icon>
            <h3>Menu Access</h3>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Accessible Menus</mat-label>
            <mat-select formControlName="menu_ids" multiple>
              <mat-select-trigger>
                <mat-chip-set>
                  @for (id of userForm.get('menu_ids')?.value || []; track id) {
                    <mat-chip>
                      {{ getMenuName(id) }}
                    </mat-chip>
                  }
                </mat-chip-set>
              </mat-select-trigger>
              @for (menu of allMenus; track menu.id) {
                <mat-option [value]="menu.id">
                  <mat-icon>{{ menu.icon || 'menu' }}</mat-icon>
                  {{ menu.nama_menu }}
                </mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>checklist</mat-icon>
            <mat-hint>Select menus this user can access ({{ (userForm.get('menu_ids')?.value || []).length }} selected)</mat-hint>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!userForm.valid || loading">
        <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 600px;
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

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 24px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }

    .section-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #424242;
    }

    .section-header mat-icon {
      color: #1976d2;
    }

    .access-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 16px;
    }

    .toggle-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    h2 mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    mat-chip-set {
      margin: 4px 0;
    }

    mat-chip {
      font-size: 12px;
    }
  `]
})
export class UserFormDialogComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  
  // Master data for dropdowns
  allBusinessUnits: BusinessUnit[] = [];
  allMenus: Menu[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<UserFormDialogComponent>,
    private userService: UserService,
    private businessUnitService: BusinessUnitService,
    private menuService: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: { user: User | null; isEdit: boolean }
  ) {
    // Password only required for create, not edit
    const passwordValidators = data.isEdit ? [] : [Validators.required, Validators.minLength(6)];
    
    this.userForm = this.fb.group({
      username: [data.user?.username || '', Validators.required],
      full_name: [data.user?.full_name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      password: ['', passwordValidators],
      level: [data.user?.level || 'user', Validators.required],
      is_active: [data.user?.is_active ?? true],
      // Single business unit
      business_unit_id: [data.user?.business_unit_id || null],
      // Menu access array
      menu_ids: [[]]
    });
  }

  ngOnInit(): void {
    console.log('🔵 UserFormDialog initialized');
    console.log('Mode:', this.data.isEdit ? 'EDIT' : 'CREATE');
    console.log('User data:', this.data.user);
    
    // Initialize with empty arrays first to prevent undefined errors
    this.allBusinessUnits = [];
    this.allMenus = [];
    
    // Then load master data for dropdowns
    this.loadMasterDataOnly();
    
    // In edit mode, also load user's current access
    if (this.data.isEdit && this.data.user?.id) {
      // Delay to ensure master data is loaded first
      setTimeout(() => this.loadUserAccess(), 500);
    }
  }

  /**
   * Load user's current access (for edit mode)
   */
  loadUserAccess(): void {
    if (!this.data.user?.id) return;

    this.loading = true;

    this.userService.getUserAccess(this.data.user.id).subscribe({
      next: (userAccess) => {
        // Pre-select current menu access
        const selectedMenuIds = userAccess.menus.map(menu => menu.id).filter(id => id !== undefined) as number[];

        this.userForm.patchValue({
          menu_ids: selectedMenuIds
        });

        this.loading = false;
        console.log('User access loaded:', userAccess);
        console.log('Selected Menu IDs:', selectedMenuIds);
      },
      error: (error) => {
        console.error('Error loading user access:', error);
        this.loading = false;
      }
    });
  }

  /**
   * Load master data (business units and menus) for dropdowns
   */
  loadMasterDataOnly(): void {
    console.log('📦 Loading master data...');
    this.loading = true;
    
    forkJoin({
      businessUnits: this.businessUnitService.getBusinessUnits(),
      menus: this.menuService.getMenus()
    }).subscribe({
      next: (result) => {
        this.allBusinessUnits = result.businessUnits;
        this.allMenus = result.menus;
        this.loading = false;
        
        console.log('✅ Master data loaded:');
        console.log('- Business Units:', this.allBusinessUnits.length, this.allBusinessUnits);
        console.log('- Menus:', this.allMenus.length, this.allMenus);
      },
      error: (error) => {
        console.error('❌ Error loading master data:', error);
        console.error('Business Units error details:', error.error);
        this.loading = false;
        
        // Set empty arrays to prevent undefined errors
        this.allBusinessUnits = [];
        this.allMenus = [];
      }
    });
  }

  /**
   * Get business unit name by ID
   */
  getBusinessUnitName(id: number): string {
    const bu = this.allBusinessUnits.find(b => b.id === id);
    return bu?.business_unit || `BU #${id}`;
  }

  /**
   * Get menu name by ID
   */
  getMenuName(id: number): string {
    const menu = this.allMenus.find(m => m.id === id);
    return menu?.nama_menu || `Menu #${id}`;
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formData = this.userForm.value;

      // For edit mode, save user with BU and then save menu access separately
      if (this.data.isEdit && this.data.user?.id) {
        const userId = this.data.user.id;
        
        // Prepare user data with business_unit_id
        const userData: any = {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          level: formData.level,
          is_active: formData.is_active,
          business_unit_id: formData.business_unit_id || null
        };

        // Update user basic info first
        this.userService.updateUser(userId, userData).subscribe({
          next: () => {
            // Then update menu access
            const accessForm: UserAccessForm = {
              user_id: userId,
              menu_ids: formData.menu_ids || []
            };
            
            this.userService.updateUserAccess(userId, accessForm).subscribe({
              next: () => {
                console.log('User and access updated successfully');
                this.dialogRef.close(formData);
              },
              error: (error) => {
                console.error('Error updating access:', error);
                // Still close dialog even if access update fails
                this.dialogRef.close(formData);
              }
            });
          },
          error: (error) => {
            console.error('Error updating user:', error);
          }
        });
      } else {
        // For create mode, include password and business_unit_id
        const userData: any = {
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          level: formData.level,
          is_active: formData.is_active,
          business_unit_id: formData.business_unit_id || null,
          menu_ids: formData.menu_ids || []
        };
        this.dialogRef.close(userData);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
