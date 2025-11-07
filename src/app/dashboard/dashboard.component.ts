import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';

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
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  stats: StatCard[] = [];
  
  recentActivities = [
    { user: 'Admin', action: 'Created new user', time: '2 minutes ago' },
    { user: 'John Doe', action: 'Updated profile', time: '15 minutes ago' },
    { user: 'Jane Smith', action: 'Deleted menu item', time: '1 hour ago' },
    { user: 'Admin', action: 'Added new business unit', time: '2 hours ago' },
    { user: 'Bob Wilson', action: 'Modified privilege', time: '3 hours ago' }
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    // Dummy statistics data
    this.stats = [
      {
        title: 'Total Users',
        value: 152,
        icon: 'people',
        color: '#3f51b5',
        trend: 'up',
        trendValue: '+12%'
      },
      {
        title: 'Active Menus',
        value: 28,
        icon: 'menu_book',
        color: '#4caf50',
        trend: 'up',
        trendValue: '+5%'
      },
      {
        title: 'Business Units',
        value: 8,
        icon: 'business',
        color: '#ff9800',
        trend: 'stable',
        trendValue: '0%'
      },
      {
        title: 'Privileges',
        value: 45,
        icon: 'security',
        color: '#f44336',
        trend: 'down',
        trendValue: '-3%'
      }
    ];
  }

  refreshStats(): void {
    console.log('Refreshing statistics...');
    // TODO: Implement refresh logic when connected to API
  }
}
