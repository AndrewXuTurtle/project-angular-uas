import { Component, OnInit, ViewChild } from '@angular/core';
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
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { AuthService } from '../auth/auth.service';
import { UserFormDialogComponent } from './user-form-dialog.component';

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['id', 'username', 'full_name', 'business_unit', 'level', 'is_active', 'actions'];
  dataSource: MatTableDataSource<User>;
  loading = false;
  isAdmin = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.dataSource = new MatTableDataSource<User>([]);
  }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading users...');
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.dataSource.data = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showSnackBar('Error loading users: ' + (error.error?.message || error.message), 'error');
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

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '600px',
      data: { user: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createUser(result).subscribe({
          next: () => {
            this.loadUsers();
            this.showSnackBar('User created successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error creating user: ' + error.message, 'error');
          }
        });
      }
    });
  }

  openEditDialog(user: User): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '700px',
      data: { user: {...user}, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update is already handled inside dialog component
        // Just reload the list
        this.loadUsers();
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      if (user.id) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.loadUsers();
            this.showSnackBar('User deleted successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error deleting user: ' + error.message, 'error');
          }
        });
      }
    }
  }

  // Permission check methods - based on admin role
  canCreate(): boolean {
    return this.isAdmin;
  }

  canUpdate(): boolean {
    return this.isAdmin;
  }

  canDelete(): boolean {
    return this.isAdmin;
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
