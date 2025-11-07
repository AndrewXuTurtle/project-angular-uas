import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { Privilege } from '../models/privilege.model';

@Component({
  selector: 'app-privileges',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div class="container">
      <div class="header">
        <div>
          <h1>Privileges Management</h1>
          <p>Manage user privileges and permissions</p>
        </div>
        <button mat-raised-button color="primary">
          <mat-icon>add</mat-icon>
          Add Privilege
        </button>
      </div>
      
      <mat-card>
        <mat-card-content>
          <table mat-table [dataSource]="privileges" class="full-width">
            <ng-container matColumnDef="user_id">
              <th mat-header-cell *matHeaderCellDef> User ID </th>
              <td mat-cell *matCellDef="let priv"> {{priv.user_id}} </td>
            </ng-container>

            <ng-container matColumnDef="menu_id">
              <th mat-header-cell *matHeaderCellDef> Menu ID </th>
              <td mat-cell *matCellDef="let priv"> {{priv.menu_id}} </td>
            </ng-container>

            <ng-container matColumnDef="permissions">
              <th mat-header-cell *matHeaderCellDef> Permissions </th>
              <td mat-cell *matCellDef="let priv">
                <span *ngIf="priv.c">C </span>
                <span *ngIf="priv.r">R </span>
                <span *ngIf="priv.u">U </span>
                <span *ngIf="priv.d">D</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef> Actions </th>
              <td mat-cell *matCellDef="let priv">
                <button mat-icon-button color="primary"><mat-icon>edit</mat-icon></button>
                <button mat-icon-button color="warn"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container { max-width: 1400px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    h1 { margin: 0 0 4px 0; font-size: 28px; }
    p { margin: 0; color: #666; }
    .full-width { width: 100%; }
  `]
})
export class PrivilegesComponent implements OnInit {
  displayedColumns = ['user_id', 'menu_id', 'permissions', 'actions'];
  privileges: Privilege[] = [
    { id: 1, user_id: 1, menu_id: 1, c: true, r: true, u: true, d: true },
    { id: 2, user_id: 2, menu_id: 2, c: true, r: true, u: true, d: false },
    { id: 3, user_id: 3, menu_id: 3, c: false, r: true, u: false, d: false }
  ];

  ngOnInit(): void {
    console.log('Privileges component loaded with dummy data');
  }
}
