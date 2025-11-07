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
import { UserFormDialogComponent } from './user-form-dialog.component';
import { AuthService } from '../auth/auth.service';

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
  displayedColumns: string[] = ['id', 'username', 'level', 'is_active', 'actions'];
  dataSource: MatTableDataSource<User>;
  loading = false;
  permissions: { [key: number]: { c: boolean, r: boolean, u: boolean, d: boolean } } = {};
  
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
    this.loadPrivileges();
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

  loadPrivileges(): void {
    this.authService.getUserPrivileges().subscribe({
      next: (data: any) => {
        // Find users menu permissions
        const usersMenu = data.menus.find((menu: any) => menu.nama_menu.toLowerCase().includes('users') || menu.nama_menu.toLowerCase().includes('user'));
        if (usersMenu) {
          this.permissions[1] = {
            c: usersMenu.permissions?.c || false,
            r: usersMenu.permissions?.r || true,
            u: usersMenu.permissions?.u || false,
            d: usersMenu.permissions?.d || false
          };
        } else {
          // Fallback: admin full access, user read only
          this.permissions[1] = this.authService.isAdmin() 
            ? { c: true, r: true, u: true, d: true }
            : { c: false, r: true, u: false, d: false };
        }
      },
      error: (error: any) => {
        console.error('Error loading privileges:', error);
        // Fallback
        this.permissions[1] = this.authService.isAdmin() 
          ? { c: true, r: true, u: true, d: true }
          : { c: false, r: true, u: false, d: false };
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
      width: '600px',
      data: { user: {...user}, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && user.id) {
        this.userService.updateUser(user.id, result).subscribe({
          next: () => {
            this.loadUsers();
            this.showSnackBar('User updated successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error updating user: ' + error.message, 'error');
          }
        });
      }
    });
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user "${user.full_name}"?`)) {
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

  canCreate(): boolean {
    return this.permissions[1]?.c || this.authService.isAdmin(); // Assuming menu id 1 for users
  }

  canUpdate(): boolean {
    return this.permissions[1]?.u || this.authService.isAdmin();
  }

  canDelete(): boolean {
    return this.permissions[1]?.d || this.authService.isAdmin();
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
