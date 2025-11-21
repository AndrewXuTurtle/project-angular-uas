import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { BusinessUnit } from '../models/business-unit.model';

@Component({
  selector: 'app-business-unit-form-dialog',
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
      <mat-icon>{{ data.isEdit ? 'edit' : 'add_business' }}</mat-icon>
      {{ data.isEdit ? 'Edit Business Unit' : 'Add New Business Unit' }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Business Unit Name</mat-label>
          <input matInput formControlName="business_unit" placeholder="Enter business unit name">
          <mat-icon matPrefix>business</mat-icon>
          <mat-error *ngIf="form.get('business_unit')?.hasError('required')">
            Business unit name is required
          </mat-error>
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
          <mat-error *ngIf="form.get('active')?.hasError('required')">
            Status is required
          </mat-error>
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
      min-width: 500px;
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
export class BusinessUnitFormDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<BusinessUnitFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { businessUnit: BusinessUnit | null; isEdit: boolean }
  ) {
    this.form = this.fb.group({
      business_unit: [data.businessUnit?.business_unit || '', Validators.required],
      active: [data.businessUnit?.active || 'y', Validators.required]
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
