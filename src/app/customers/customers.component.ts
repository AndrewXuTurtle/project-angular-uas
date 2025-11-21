import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { SelectionModel } from '@angular/cdk/collections';
import { CustomerService } from '../services/customer.service';
import { BusinessUnitService } from '../services/business-unit.service';
import { AuthService } from '../auth/auth.service';
import { Customer, CustomerFormData } from '../models/customer.model';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSelectModule
  ],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.scss'
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  displayedColumns: string[] = ['select', 'name', 'email', 'phone', 'address', 'actions'];
  selection = new SelectionModel<Customer>(true, []);
  loading = false;
  currentBusinessUnit: any = null;
  isAdmin = false;
  businessUnits: any[] = [];
  selectedBusinessUnitId: number | null = null;

  constructor(
    private customerService: CustomerService,
    private authService: AuthService,
    private businessUnitService: BusinessUnitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentBusinessUnit = this.authService.getCurrentBusinessUnit();
    this.isAdmin = this.authService.isAdmin();
    console.log('🔍 Customers Component Init:', {
      isAdmin: this.isAdmin,
      currentUser: this.authService.getCurrentUser(),
      displayedColumns: this.displayedColumns
    });
    
    // Load business units for admin to switch between them
    if (this.isAdmin) {
      this.loadBusinessUnits();
    } else {
      // For regular user, use their selected business unit
      this.selectedBusinessUnitId = this.currentBusinessUnit?.id || null;
      this.loadCustomers();
    }
  }

  loadBusinessUnits(): void {
    console.log('📡 Loading business units for admin...');
    this.businessUnitService.getBusinessUnits().subscribe({
      next: (businessUnits: any) => {
        console.log('✅ Business units loaded:', businessUnits);
        this.businessUnits = businessUnits;
        console.log('📊 Total business units:', this.businessUnits.length);
        
        // Auto-select first business unit if available
        if (this.businessUnits.length > 0) {
          this.selectedBusinessUnitId = this.businessUnits[0].id;
          console.log('🎯 Auto-selected BU:', this.businessUnits[0]);
          this.onBusinessUnitChange();
        } else {
          console.warn('⚠️ No business units available!');
          this.loadCustomers(); // Load anyway
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading business units:', error);
        this.loadCustomers(); // Load anyway even if BU load fails
      }
    });
  }

  onBusinessUnitChange(): void {
    console.log('📍 Business Unit changed to:', this.selectedBusinessUnitId);
    this.loadCustomers();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.customers.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.customers);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Customer): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }

  loadCustomers(): void {
    this.loading = true;
    this.selection.clear(); // Clear selection when reloading
    this.customerService.getAll().subscribe({
      next: (response: any) => {
        this.loading = false;
        if (response.success) {
          this.customers = response.data;
        }
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error loading customers:', error);
        this.snackBar.open(
          error.error?.message || 'Gagal memuat customers',
          'Tutup',
          { duration: 3000 }
        );
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '600px',
      data: { customer: null }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.createCustomer(result);
      }
    });
  }

  openEditDialog(customer: Customer): void {
    const dialogRef = this.dialog.open(CustomerFormDialogComponent, {
      width: '600px',
      data: { customer }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateCustomer(customer.id, result);
      }
    });
  }

  createCustomer(data: CustomerFormData): void {
    this.customerService.create(data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.snackBar.open('Customer berhasil dibuat', 'Tutup', { duration: 3000 });
          this.loadCustomers();
        }
      },
      error: (error: any) => {
        console.error('Error creating customer:', error);
        this.snackBar.open(
          error.error?.message || 'Gagal membuat customer',
          'Tutup',
          { duration: 3000 }
        );
      }
    });
  }

  updateCustomer(id: number, data: Partial<CustomerFormData>): void {
    this.customerService.update(id, data).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.snackBar.open('Customer berhasil diupdate', 'Tutup', { duration: 3000 });
          this.loadCustomers();
        }
      },
      error: (error: any) => {
        console.error('Error updating customer:', error);
        this.snackBar.open(
          error.error?.message || 'Gagal mengupdate customer',
          'Tutup',
          { duration: 3000 }
        );
      }
    });
  }

  deleteCustomer(customer: Customer): void {
    if (confirm(`Yakin ingin menghapus customer ${customer.name}?`)) {
      this.customerService.delete(customer.id).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.snackBar.open('Customer berhasil dihapus', 'Tutup', { duration: 3000 });
            this.loadCustomers();
          }
        },
        error: (error: any) => {
          console.error('Error deleting customer:', error);
          this.snackBar.open(
            error.error?.message || 'Gagal menghapus customer',
            'Tutup',
            { duration: 3000 }
          );
        }
      });
    }
  }

  bulkDelete(): void {
    const selectedCount = this.selection.selected.length;
    if (selectedCount === 0) {
      this.snackBar.open('Pilih minimal 1 customer untuk dihapus', 'Tutup', { duration: 3000 });
      return;
    }

    const confirmMessage = selectedCount === 1
      ? `Yakin ingin menghapus ${this.selection.selected[0].name}?`
      : `Yakin ingin menghapus ${selectedCount} customers?`;

    if (confirm(confirmMessage)) {
      const ids = this.selection.selected.map(c => c.id);
      this.loading = true;
      this.customerService.bulkDelete(ids).subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response.success) {
            this.snackBar.open(
              `${selectedCount} customer berhasil dihapus`,
              'Tutup',
              { duration: 3000 }
            );
            this.loadCustomers();
          }
        },
        error: (error: any) => {
          this.loading = false;
          console.error('Error bulk deleting customers:', error);
          this.snackBar.open(
            error.error?.message || 'Gagal menghapus customers',
            'Tutup',
            { duration: 3000 }
          );
        }
      });
    }
  }
}

// Customer Form Dialog Component
@Component({
  selector: 'app-customer-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.customer ? 'Edit Customer' : 'Tambah Customer' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nama</mat-label>
          <input matInput formControlName="name" required>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Nama wajib diisi</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
            <mat-error>Email wajib diisi</mat-error>
          }
          @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
            <mat-error>Email tidak valid</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Telepon</mat-label>
          <input matInput formControlName="phone" required>
          @if (form.get('phone')?.hasError('required') && form.get('phone')?.touched) {
            <mat-error>Telepon wajib diisi</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Alamat</mat-label>
          <textarea matInput formControlName="address" rows="3" required></textarea>
          @if (form.get('address')?.hasError('required') && form.get('address')?.touched) {
            <mat-error>Alamat wajib diisi</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Batal</button>
      <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="!form.valid">
        {{ data.customer ? 'Update' : 'Simpan' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      min-width: 400px;
      padding-top: 20px;
    }
  `]
})
export class CustomerFormDialogComponent implements OnInit {
  form: FormGroup;
  businessUnits: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CustomerFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer | null }
  ) {
    this.form = this.fb.group({
      name: [data.customer?.name || '', Validators.required],
      email: [data.customer?.email || '', [Validators.required, Validators.email]],
      phone: [data.customer?.phone || '', Validators.required],
      address: [data.customer?.address || '', Validators.required]
    });
  }

  ngOnInit(): void {
    // No need to load business units anymore
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
