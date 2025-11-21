import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Menu } from '../models/menu.model';
import { MenuService } from '../services/menu.service';

@Component({
  selector: 'app-menu-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.isEdit ? 'edit' : 'add_circle' }}</mat-icon>
      {{ data.isEdit ? 'Edit Menu' : 'Add New Menu' }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Menu Name</mat-label>
          <input matInput formControlName="nama_menu" placeholder="Enter menu name">
          <mat-icon matPrefix>label</mat-icon>
          <mat-error *ngIf="form.get('nama_menu')?.hasError('required')">
            Menu name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>URL Link</mat-label>
          <input matInput formControlName="url_link" placeholder="/admin/example">
          <mat-icon matPrefix>link</mat-icon>
          <mat-hint>Leave empty for parent menus</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Icon</mat-label>
          <input matInput formControlName="icon" placeholder="dashboard">
          <mat-icon matPrefix>{{ form.get('icon')?.value || 'category' }}</mat-icon>
          <mat-hint>Material icon name (e.g., dashboard, people, settings)</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Parent Menu</mat-label>
          <mat-select formControlName="parent">
            <mat-option [value]="null">
              <mat-icon style="vertical-align: middle;">folder_open</mat-icon>
              None (Top Level Menu)
            </mat-option>
            @for (menu of parentMenus; track menu.id) {
              <mat-option [value]="menu.id">
                <mat-icon style="vertical-align: middle;">{{ menu.icon || 'menu' }}</mat-icon>
                {{ menu.nama_menu }}
              </mat-option>
            }
          </mat-select>
          <mat-icon matPrefix>account_tree</mat-icon>
          <mat-hint>Select parent menu for sub-menu, or None for top-level</mat-hint>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Status</mat-label>
          <mat-select formControlName="active">
            <mat-option value="y">
              <mat-icon style="color: green; vertical-align: middle;">check_circle</mat-icon>
              Active
            </mat-option>
            <mat-option value="n">
              <mat-icon style="color: red; vertical-align: middle;">cancel</mat-icon>
              Inactive
            </mat-option>
          </mat-select>
          <mat-icon matPrefix>toggle_on</mat-icon>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">
        <mat-icon>close</mat-icon>
        Cancel
      </button>
      <button mat-raised-button color="primary" (click)="onSave()" [disabled]="!form.valid">
        <mat-icon>{{ data.isEdit ? 'save' : 'add' }}</mat-icon>
        {{ data.isEdit ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 550px;
      padding: 16px 0;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 70vh;
      overflow-y: auto;
    }

    h2 mat-icon {
      vertical-align: middle;
      margin-right: 8px;
    }

    mat-icon[matPrefix] {
      margin-right: 8px;
    }
  `]
})
export class MenuFormDialogComponent implements OnInit {
  form: FormGroup;
  parentMenus: Menu[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<MenuFormDialogComponent>,
    private menuService: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: { menu: Menu | null; isEdit: boolean; allMenus: Menu[] }
  ) {
    this.form = this.fb.group({
      nama_menu: [data.menu?.nama_menu || '', Validators.required],
      url_link: [data.menu?.url_link || ''],
      icon: [data.menu?.icon || ''],
      parent: [data.menu?.parent || null],
      active: [data.menu?.active || 'y']
    });
  }

  ngOnInit(): void {
    // Filter parent menus (exclude current menu if editing to prevent circular reference)
    this.parentMenus = this.data.allMenus.filter(m => {
      if (!this.data.isEdit) return true;
      return m.id !== this.data.menu?.id;
    });
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
