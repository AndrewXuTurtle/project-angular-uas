import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { BusinessUnitService } from '../services/business-unit.service';
import { MenuService } from '../services/menu.service';
import { AuthService } from '../auth/auth.service';
import { UserFormDialogComponent } from './user-form-dialog.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatExpansionModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSelectModule,
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
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  isAdmin = false;
  searchText = '';
  
  // For expanded card editing - keyed by user ID
  editingUser: { [key: number]: any } = {};
  businessUnits: any[] = [];
  allMenus: any[] = [];
  
  constructor(
    private userService: UserService,
    private businessUnitService: BusinessUnitService,
    private menuService: MenuService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadUsers();
    this.loadBusinessUnits();
    this.loadMenus();
  }

  loadUsers(): void {
    this.loading = true;
    console.log('Loading users...');
    
    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.users = users;
        this.filteredUsers = [...users];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.showSnackBar('Error loading users: ' + (error.error?.message || error.message), 'error');
        this.loading = false;
      }
    });
  }

  loadBusinessUnits(): void {
    this.businessUnitService.getBusinessUnits().subscribe({
      next: (units) => {
        this.businessUnits = units;
        console.log('Business units loaded:', units);
      },
      error: (error) => {
        console.error('Error loading business units:', error);
      }
    });
  }

  loadMenus(): void {
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        this.allMenus = menus;
        console.log('Menus loaded:', menus);
      },
      error: (error) => {
        console.error('Error loading menus:', error);
      }
    });
  }

  applyFilter(): void {
    const search = this.searchText.toLowerCase().trim();
    if (!search) {
      this.filteredUsers = [...this.users];
    } else {
      this.filteredUsers = this.users.filter(user => 
        user.username?.toLowerCase().includes(search) ||
        user.full_name?.toLowerCase().includes(search) ||
        user.id?.toString().includes(search)
      );
    }
  }

  onPanelOpened(user: User): void {
    // Initialize editing state for this user
    if (!user.id) return;
    
    this.editingUser[user.id] = {
      ...user,
      selectedBusinessUnits: user.business_units || [],
      selectedMenus: user.menus || []
    };
    console.log('Panel opened for user:', this.editingUser[user.id]);
  }

  toggleBusinessUnit(userId: number, businessUnitId: number): void {
    const editing = this.editingUser[userId];
    if (!editing) return;
    
    const index = editing.selectedBusinessUnits.findIndex((bu: any) => bu.id === businessUnitId);
    if (index > -1) {
      editing.selectedBusinessUnits.splice(index, 1);
    } else {
      const bu = this.businessUnits.find(b => b.id === businessUnitId);
      if (bu) {
        editing.selectedBusinessUnits.push(bu);
      }
    }
  }

  toggleMenu(userId: number, menuId: number): void {
    const editing = this.editingUser[userId];
    if (!editing) return;
    
    const index = editing.selectedMenus.findIndex((m: any) => m.id === menuId);
    if (index > -1) {
      editing.selectedMenus.splice(index, 1);
    } else {
      const menu = this.allMenus.find(m => m.id === menuId);
      if (menu) {
        editing.selectedMenus.push(menu);
      }
    }
  }

  isBusinessUnitSelected(userId: number, businessUnitId: number): boolean {
    const editing = this.editingUser[userId];
    if (!editing) return false;
    return editing.selectedBusinessUnits.some((bu: any) => bu.id === businessUnitId);
  }

  isMenuSelected(userId: number, menuId: number): boolean {
    const editing = this.editingUser[userId];
    if (!editing) return false;
    return editing.selectedMenus.some((m: any) => m.id === menuId);
  }

  saveUser(user: User): void {
    if (!user.id) return;
    
    const editing = this.editingUser[user.id];
    if (!editing) return;

    const updateData = {
      full_name: editing.full_name,
      level: editing.level,
      is_active: editing.is_active,
      business_unit_ids: editing.selectedBusinessUnits.map((bu: any) => bu.id),
      menu_ids: editing.selectedMenus.map((m: any) => m.id)
    };

    console.log('Saving user:', user.id, updateData);

    this.userService.updateUser(user.id, updateData).subscribe({
      next: (response) => {
        this.showSnackBar('User updated successfully', 'success');
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.showSnackBar('Error updating user: ' + (error.error?.message || error.message), 'error');
      }
    });
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
