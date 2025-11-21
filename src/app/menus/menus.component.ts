import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Menu } from '../models/menu.model';
import { MenuService } from '../services/menu.service';
import { MenuFormDialogComponent } from './menu-form-dialog.component';

@Component({
  selector: 'app-menus',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1>Menus Management</h1>
          <p>Manage application menus and navigation</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Menu
        </button>
      </div>
      
      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="menus" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let menu"> {{menu.id}} </td>
            </ng-container>

            <ng-container matColumnDef="nama_menu">
              <th mat-header-cell *matHeaderCellDef> Menu Name </th>
              <td mat-cell *matCellDef="let menu"> 
                <mat-icon *ngIf="menu.icon" style="vertical-align: middle; margin-right: 8px;">{{menu.icon}}</mat-icon>
                {{menu.nama_menu}} 
              </td>
            </ng-container>

            <ng-container matColumnDef="url_link">
              <th mat-header-cell *matHeaderCellDef> URL </th>
              <td mat-cell *matCellDef="let menu"> {{menu.url_link}} </td>
            </ng-container>

            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef> Parent </th>
              <td mat-cell *matCellDef="let menu"> 
                {{menu.parent ? getParentName(menu.parent) : '-'}} 
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let menu">
                <button mat-icon-button color="primary" (click)="editMenu(menu)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteMenu(menu)" matTooltip="Delete">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading menus...</p>
      </div>
    </div>
  `,
  styles: [`
    .container { 
      max-width: 1400px; 
      margin: 0 auto; 
      padding: 24px;
    }
    .header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
    }
    h1 { 
      margin: 0 0 4px 0; 
      font-size: 28px; 
      font-weight: 600;
    }
    p { 
      margin: 0; 
      color: #666; 
    }
    .full-width { 
      width: 100%; 
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .loading-container mat-spinner {
      margin-bottom: 16px;
    }
    .loading-container p {
      color: #666;
      font-size: 14px;
    }
  `]
})
export class MenusComponent implements OnInit {
  displayedColumns = ['id', 'nama_menu', 'url_link', 'parent', 'actions'];
  menus: Menu[] = [];
  loading = false;

  constructor(
    private menuService: MenuService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    this.loading = true;
    console.log('Loading menus from API...');
    
    this.menuService.getMenus().subscribe({
      next: (menus) => {
        console.log('Menus loaded:', menus);
        this.menus = menus;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading menus:', error);
        this.showSnackBar('Error loading menus: ' + (error.error?.message || error.message), 'error');
        this.loading = false;
      }
    });
  }

  getParentName(parentId: number): string {
    const parent = this.menus.find(m => m.id === parentId);
    return parent ? parent.nama_menu : `ID: ${parentId}`;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(MenuFormDialogComponent, {
      width: '650px',
      data: { menu: null, isEdit: false, allMenus: this.menus }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.menuService.createMenu(result).subscribe({
          next: () => {
            this.loadMenus();
            this.showSnackBar('Menu created successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error creating menu: ' + (error.error?.message || error.message), 'error');
          }
        });
      }
    });
  }

  editMenu(menu: Menu): void {
    const dialogRef = this.dialog.open(MenuFormDialogComponent, {
      width: '650px',
      data: { menu: {...menu}, isEdit: true, allMenus: this.menus }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && menu.id) {
        this.menuService.updateMenu(menu.id, result).subscribe({
          next: () => {
            this.loadMenus();
            this.showSnackBar('Menu updated successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error updating menu: ' + (error.error?.message || error.message), 'error');
          }
        });
      }
    });
  }

  deleteMenu(menu: Menu): void {
    if (confirm(`Are you sure you want to delete menu "${menu.nama_menu}"?`)) {
      if (menu.id) {
        this.menuService.deleteMenu(menu.id).subscribe({
          next: () => {
            this.loadMenus();
            this.showSnackBar('Menu deleted successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error deleting menu: ' + (error.error?.message || error.message), 'error');
          }
        });
      }
    }
  }

  private showSnackBar(message: string, type: 'success' | 'error' | 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [type === 'success' ? 'success-snackbar' : type === 'error' ? 'error-snackbar' : 'info-snackbar']
    });
  }
}
