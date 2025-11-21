import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BusinessUnit } from '../models/business-unit.model';
import { BusinessUnitService } from '../services/business-unit.service';
import { BusinessUnitFormDialogComponent } from './business-unit-form-dialog.component';

@Component({
  selector: 'app-business-units',
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
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1>Business Units Management</h1>
          <p>Manage organizational business units</p>
        </div>
        <button mat-raised-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon>
          Add Business Unit
        </button>
      </div>
      
      <mat-card *ngIf="!loading">
        <mat-card-content>
          <table mat-table [dataSource]="businessUnits" class="full-width">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef> ID </th>
              <td mat-cell *matCellDef="let bu"> {{bu.id}} </td>
            </ng-container>

            <ng-container matColumnDef="business_unit">
              <th mat-header-cell *matHeaderCellDef> Business Unit </th>
              <td mat-cell *matCellDef="let bu"> {{bu.business_unit}} </td>
            </ng-container>

            <ng-container matColumnDef="active">
              <th mat-header-cell *matHeaderCellDef> Status </th>
              <td mat-cell *matCellDef="let bu">
                <mat-chip [class]="bu.active === 'y' ? 'chip-active' : 'chip-inactive'">
                  {{bu.active === 'y' ? 'Active' : 'Inactive'}}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let bu">
                <button mat-icon-button color="primary" (click)="editBusinessUnit(bu)" matTooltip="Edit">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteBusinessUnit(bu)" matTooltip="Delete">
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
        <p>Loading business units...</p>
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
    .chip-active { 
      background-color: #c8e6c9 !important; 
      color: #2e7d32 !important; 
    }
    .chip-inactive { 
      background-color: #ffcdd2 !important; 
      color: #c62828 !important; 
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
export class BusinessUnitsComponent implements OnInit {
  displayedColumns = ['id', 'business_unit', 'active', 'actions'];
  businessUnits: BusinessUnit[] = [];
  loading = false;

  constructor(
    private businessUnitService: BusinessUnitService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBusinessUnits();
  }

  loadBusinessUnits(): void {
    this.loading = true;
    console.log('Loading business units from API...');
    
    this.businessUnitService.getBusinessUnits().subscribe({
      next: (businessUnits) => {
        console.log('Business units loaded:', businessUnits);
        this.businessUnits = businessUnits;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading business units:', error);
        this.showSnackBar('Error loading business units: ' + (error.error?.message || error.message), 'error');
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(BusinessUnitFormDialogComponent, {
      width: '600px',
      data: { businessUnit: null, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.businessUnitService.createBusinessUnit(result).subscribe({
          next: () => {
            this.loadBusinessUnits();
            this.showSnackBar('Business unit created successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error creating business unit: ' + (error.error?.message || error.message), 'error');
          }
        });
      }
    });
  }

  editBusinessUnit(bu: BusinessUnit): void {
    const dialogRef = this.dialog.open(BusinessUnitFormDialogComponent, {
      width: '600px',
      data: { businessUnit: {...bu}, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && bu.id) {
        this.businessUnitService.updateBusinessUnit(bu.id, result).subscribe({
          next: () => {
            this.loadBusinessUnits();
            this.showSnackBar('Business unit updated successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error updating business unit: ' + (error.error?.message || error.message), 'error');
          }
        });
      }
    });
  }

  deleteBusinessUnit(bu: BusinessUnit): void {
    if (confirm(`Are you sure you want to delete "${bu.business_unit}"?`)) {
      if (bu.id) {
        this.businessUnitService.deleteBusinessUnit(bu.id).subscribe({
          next: () => {
            this.loadBusinessUnits();
            this.showSnackBar('Business unit deleted successfully', 'success');
          },
          error: (error) => {
            this.showSnackBar('Error deleting business unit: ' + (error.error?.message || error.message), 'error');
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
