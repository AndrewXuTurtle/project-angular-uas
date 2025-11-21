import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserService } from '../services/user.service';
import { BusinessUnitService } from '../services/business-unit.service';
import { MenuService } from '../services/menu.service';
import { AuthService } from '../auth/auth.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
  trend?: string;
  trendValue?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [];
  isLoading = true;
  currentUser: any = null;
  
  constructor(
    private userService: UserService,
    private businessUnitService: BusinessUnitService,
    private menuService: MenuService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    
    // Load real data from APIs
    Promise.all([
      this.userService.getAll().toPromise(),
      this.menuService.getAll().toPromise(),
      this.businessUnitService.getAll().toPromise()
    ]).then(([usersResponse, menusResponse, busResponse]) => {
      const users = usersResponse?.data || [];
      const menus = menusResponse?.data || [];
      const businessUnits = busResponse?.data || [];
      
      const activeUsers = users.filter((u: any) => u.is_active === 1).length;
      const inactiveUsers = users.length - activeUsers;
      
      this.stats = [
        {
          title: 'Total Users',
          value: users.length,
          icon: 'people',
          color: '#667eea',
          trend: activeUsers > inactiveUsers ? 'up' : 'stable',
          trendValue: `${activeUsers} Active`
        },
        {
          title: 'Business Units',
          value: businessUnits.length,
          icon: 'business',
          color: '#f093fb',
          trend: 'stable',
          trendValue: 'Locations'
        },
        {
          title: 'Menu Items',
          value: menus.length,
          icon: 'menu_book',
          color: '#4facfe',
          trend: 'up',
          trendValue: 'Navigation'
        },
        {
          title: 'Your Level',
          value: 0,
          icon: this.currentUser?.level === 'admin' ? 'shield' : 'person',
          color: '#fa709a',
          trend: 'stable',
          trendValue: this.currentUser?.level?.toUpperCase() || 'USER'
        }
      ];
      
      this.isLoading = false;
    }).catch(error => {
      console.error('Error loading dashboard stats:', error);
      this.isLoading = false;
    });
  }

  refreshStats(): void {
    console.log('🔄 Refreshing statistics...');
    this.loadStats();
  }
}
