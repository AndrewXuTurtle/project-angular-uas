import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Transaksi, TransaksiService } from '../services/transaksi.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-transaksis',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './transaksis.component.html',
  styleUrl: './transaksis.component.scss'
})
export class TransaksisComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'kode_transaksi', 'nama_transaksi', 'jumlah', 'tanggal', 'status', 'actions'];
  dataSource: MatTableDataSource<Transaksi>;
  loading = false;
  permissions: { c: boolean, r: boolean, u: boolean, d: boolean } = { c: false, r: true, u: false, d: false };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transaksiService: TransaksiService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<Transaksi>([]);
  }

  ngOnInit(): void {
    this.loadPermissions();
    this.loadTransaksis();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadPermissions(): void {
    this.authService.getUserPrivileges().subscribe({
      next: (data: any) => {
        // Find transaksi menu permissions
        const transaksiMenu = data.menus.find((menu: any) => menu.nama_menu.toLowerCase().includes('transaksi'));
        if (transaksiMenu) {
          this.permissions = {
            c: transaksiMenu.permissions?.c || false,
            r: transaksiMenu.permissions?.r || true,
            u: transaksiMenu.permissions?.u || false,
            d: transaksiMenu.permissions?.d || false
          };
        } else {
          // Fallback
          this.permissions = { c: false, r: true, u: false, d: false };
        }
      },
      error: (error: any) => {
        console.error('Error loading permissions:', error);
        this.permissions = { c: false, r: true, u: false, d: false };
      }
    });
  }

  loadTransaksis(): void {
    this.loading = true;
    console.log('Loading transaksis...');

    this.transaksiService.getAll().subscribe({
      next: (response: any) => {
        console.log('Transaksis loaded:', response);
        this.dataSource.data = response.data || [];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading transaksis:', error);
        this.showSnackBar('Error loading transaksis: ' + (error.error?.message || error.message), 'error');
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  canCreate(): boolean {
    return this.permissions.c;
  }

  canUpdate(): boolean {
    return this.permissions.u;
  }

  canDelete(): boolean {
    return this.permissions.d;
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'status-active';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  }

  openCreateDialog(): void {
    // TODO: Implement create dialog
    this.showSnackBar('Create dialog not implemented yet', 'error');
  }

  openEditDialog(transaksi: Transaksi): void {
    // TODO: Implement edit dialog
    this.showSnackBar('Edit dialog not implemented yet', 'error');
  }

  deleteTransaksi(transaksi: Transaksi): void {
    if (confirm(`Are you sure you want to delete transaksi "${transaksi.nama_transaksi}"?`)) {
      if (transaksi.id) {
        this.transaksiService.delete(transaksi.id).subscribe({
          next: () => {
            this.loadTransaksis();
            this.showSnackBar('Transaksi deleted successfully', 'success');
          },
          error: (error: any) => {
            this.showSnackBar('Error deleting transaksi: ' + error.message, 'error');
          }
        });
      }
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [type === 'success' ? 'success-snackbar' : 'error-snackbar']
    });
  }
}