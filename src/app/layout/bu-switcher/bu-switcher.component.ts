import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface BusinessUnit {
  id: number;
  business_unit: string;
  active: string;
}

@Component({
  selector: 'app-bu-switcher',
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="bu-switcher" *ngIf="currentBusinessUnit">
      <mat-form-field appearance="outline" class="bu-select">
        <mat-label>Business Unit</mat-label>
        <mat-select 
          [value]="currentBusinessUnit.id" 
          (selectionChange)="switchBusinessUnit($event.value)"
          [disabled]="switching">
          <mat-option *ngFor="let bu of businessUnits" [value]="bu.id">
            {{ bu.business_unit }}
          </mat-option>
        </mat-select>
      </mat-form-field>
      <mat-spinner *ngIf="switching" diameter="20"></mat-spinner>
    </div>
  `,
  styles: [`
    .bu-switcher {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 16px;
    }

    .bu-select {
      min-width: 150px;
      margin: 0;
      
      ::ng-deep .mat-mdc-form-field-infix {
        padding: 8px 0;
        min-height: 40px;
      }

      ::ng-deep .mat-mdc-text-field-wrapper {
        padding: 0 8px;
      }
    }
  `]
})
export class BuSwitcherComponent implements OnInit {
  businessUnits: BusinessUnit[] = [];
  currentBusinessUnit: BusinessUnit | null = null;
  switching = false;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadCurrentBusinessUnit();
    this.loadBusinessUnits();
  }

  loadCurrentBusinessUnit(): void {
    this.currentBusinessUnit = this.authService.getCurrentBusinessUnit();
  }

  loadBusinessUnits(): void {
    this.http.get<any>(`${environment.apiUrl}/business-units/list`).subscribe({
      next: (response) => {
        this.businessUnits = response.data || [];
      },
      error: (error) => {
        console.error('Error loading business units:', error);
      }
    });
  }

  switchBusinessUnit(businessUnitId: number): void {
    if (businessUnitId === this.currentBusinessUnit?.id) {
      return; // Same BU, no need to switch
    }

    this.switching = true;
    this.authService.switchBusinessUnit(businessUnitId).subscribe({
      next: (response: any) => {
        console.log('Switch BU Response:', response);
        
        if (response.success && response.data) {
          // Update stored token (PENTING! Token baru dengan business_unit_id berbeda)
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            console.log('✅ Token updated:', response.data.token.substring(0, 20) + '...');
          }
          
          // Update stored business unit
          if (response.data.business_unit) {
            localStorage.setItem('business_unit', JSON.stringify(response.data.business_unit));
            this.currentBusinessUnit = response.data.business_unit;
            console.log('✅ Business Unit switched to:', response.data.business_unit.business_unit);
          }
          
          this.switching = false;
          
          // Reload page to refresh all data with new BU context
          console.log('🔄 Reloading page...');
          window.location.reload();
        } else {
          this.switching = false;
          console.error('❌ Invalid response:', response);
          alert('Failed to switch business unit: Invalid response');
        }
      },
      error: (error: any) => {
        console.error('❌ Error switching business unit:', error);
        this.switching = false;
        alert('Failed to switch business unit: ' + (error.error?.message || error.message));
      }
    });
  }
}
