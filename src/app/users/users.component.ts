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
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { trigger, state, style, transition, animate } from '@angular/animations';
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
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatPaginatorModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ height: '0', opacity: 0, overflow: 'hidden' }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ height: '0', opacity: 0, overflow: 'hidden' }))
      ])
    ])
  ]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];
  loading = false;
  isAdmin = false;
  searchText = '';
  
  // Filter visibility
  showFilters = false;
  
  // Checkbox Filters
  filterLevelAll = true;
  filterLevelAdmin = false;
  filterLevelUser = false;
  
  filterStatusAll = true;
  filterStatusActive = false;
  filterStatusInactive = false;
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  
  // For expanded card editing - keyed by user ID
  editingUser: { [key: number]: any } = {};
  expandedUserId: number | null = null;
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
        this.applyFilter();
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
    let filtered = [...this.users];
    
    // Apply search text filter
    const search = this.searchText.toLowerCase().trim();
    if (search) {
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(search) ||
        user.full_name?.toLowerCase().includes(search) ||
        user.id?.toString().includes(search)
      );
    }
    
    // Apply level filter (checkbox-based)
    if (!this.filterLevelAll) {
      const levels: string[] = [];
      if (this.filterLevelAdmin) levels.push('admin');
      if (this.filterLevelUser) levels.push('user');
      
      if (levels.length > 0) {
        filtered = filtered.filter(user => levels.includes(user.level));
      } else {
        // If no checkboxes selected, show nothing
        filtered = [];
      }
    }
    
    // Apply status filter (checkbox-based)
    if (!this.filterStatusAll) {
      const shouldShowActive = this.filterStatusActive;
      const shouldShowInactive = this.filterStatusInactive;
      
      if (shouldShowActive && !shouldShowInactive) {
        filtered = filtered.filter(user => user.is_active);
      } else if (!shouldShowActive && shouldShowInactive) {
        filtered = filtered.filter(user => !user.is_active);
      } else if (!shouldShowActive && !shouldShowInactive) {
        // If no checkboxes selected, show nothing
        filtered = [];
      }
      // If both checked, show all (no filter)
    }
    
    this.filteredUsers = filtered;
    this.pageIndex = 0; // Reset to first page when filtering
    this.updatePaginatedUsers();
    
    console.log('Filter applied:', {
      total: this.users.length,
      filtered: filtered.length,
      levelAll: this.filterLevelAll,
      levelAdmin: this.filterLevelAdmin,
      levelUser: this.filterLevelUser,
      statusAll: this.filterStatusAll,
      statusActive: this.filterStatusActive,
      statusInactive: this.filterStatusInactive
    });
  }

  onLevelAllChange(): void {
    if (this.filterLevelAll) {
      this.filterLevelAdmin = false;
      this.filterLevelUser = false;
    }
  }

  onStatusAllChange(): void {
    if (this.filterStatusAll) {
      this.filterStatusActive = false;
      this.filterStatusInactive = false;
    }
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterLevelAll = true;
    this.filterLevelAdmin = false;
    this.filterLevelUser = false;
    this.filterStatusAll = true;
    this.filterStatusActive = false;
    this.filterStatusInactive = false;
    this.applyFilter();
  }

  onPanelOpened(user: User): void {
    // Initialize editing state for this user
    if (!user.id) return;
    
    const userId = user.id;
    console.log('📂 Panel opened for user:', user);
    
    // Check if user already has business_units and menus from API
    if (user.business_units && user.menus) {
      // Data already loaded from API
      this.editingUser[userId] = {
        ...user,
        selectedBusinessUnits: user.business_units || [],
        selectedMenus: user.menus || []
      };
      console.log('✅ Using existing data:', this.editingUser[userId]);
    } else {
      // Need to fetch user access data
      console.log('🔄 Fetching user access for user:', userId);
      this.userService.getUserAccess(userId).subscribe({
        next: (access) => {
          console.log('✅ User access loaded:', access);
          this.editingUser[userId] = {
            ...user,
            selectedBusinessUnits: access.business_units || [],
            selectedMenus: access.menus || []
          };
        },
        error: (error) => {
          console.error('❌ Error loading user access:', error);
          // Initialize with empty arrays if error
          this.editingUser[userId] = {
            ...user,
            selectedBusinessUnits: [],
            selectedMenus: []
          };
        }
      });
    }
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
      level: editing.level,
      is_active: editing.is_active,
      business_unit_ids: editing.selectedBusinessUnits.map((bu: any) => bu.id),
      menu_ids: editing.selectedMenus.map((m: any) => m.id)
    };

    console.log('💾 Saving user:', {
      userId: user.id,
      updateData,
      editingState: editing
    });

    this.userService.updateUser(user.id, updateData).subscribe({
      next: (response) => {
        console.log('✅ User update response:', response);
        this.showSnackBar('User updated successfully', 'success');
        this.closeEditPanel(); // Auto-close after successful save
        this.loadUsers();
      },
      error: (error) => {
        console.error('❌ Error updating user:', {
          error,
          status: error.status,
          statusText: error.statusText,
          message: error.error?.message,
          fullError: error
        });
        this.showSnackBar('Error updating user: ' + (error.error?.message || error.message), 'error');
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(UserFormDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // result sudah hanya berisi: username, password, level, is_active
        this.userService.createUser(result).subscribe({
          next: () => {
            this.loadUsers();
            this.showSnackBar('User created successfully! Assign Business Units and Menus from the dashboard.', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error creating user: ' + error.message, 'error');
          }
        });
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

  // Stats helper methods
  getAdminCount(): number {
    return this.users.filter(u => u.level === 'admin').length;
  }

  getActiveCount(): number {
    return this.users.filter(u => u.is_active).length;
  }

  getInactiveCount(): number {
    return this.users.filter(u => !u.is_active).length;
  }

  // Edit panel methods
  getUserById(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  closeEditPanel(): void {
    this.expandedUserId = null;
  }

  getSelectedBUCount(userId: number): number {
    return this.editingUser[userId]?.selectedBusinessUnits?.length || 0;
  }

  getSelectedMenuCount(userId: number): number {
    return this.editingUser[userId]?.selectedMenus?.length || 0;
  }

  // Pagination methods
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedUsers();
  }

  updatePaginatedUsers(): void {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }
}
