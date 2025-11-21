import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from '../../auth/auth.service';
import { MenuService } from '../../services/menu.service';
import { Menu } from '../../models/menu.model';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  menuId?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  menus: MenuItem[] = [];
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private menuService: MenuService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    
    // BOTH admin and user now use dynamic menu from database
    console.log(this.isAdmin ? '👑 Admin - Loading dynamic menu from database' : '👤 User - Loading dynamic menu from database');
    console.log('📋 Menus filtered by tbl_user_menus');
    this.menus = [];
    this.loadMenusFromDatabase();
  }

  /**
   * Load menus dynamically from database
   * For USER: Load only accessible menus from /api/user/menus (filtered by tbl_user_menus)
   * This ensures users only see menus they have access to
   */
  loadMenusFromDatabase(): void {
    console.log('📡 Loading user menus from API...');
    
    this.menuService.getUserMenus().subscribe({
      next: (userMenus) => {
        console.log('✅ User menus loaded from API:', userMenus);
        console.log('📊 User has access to', userMenus.length, 'menus');
        
        if (userMenus && userMenus.length > 0) {
          this.buildMenusFromDatabase(userMenus);
          console.log('✅ Sidebar built with user\'s accessible menus only');
        } else {
          console.warn('⚠️ User has no menu access! Check tbl_user_menus');
          this.menus = [];
        }
      },
      error: (error) => {
        console.error('❌ Error loading user menus from API:', error);
        console.error('API Error Details:', error.error);
        console.log('⚠️ User will see no menus');
        this.menus = [];
      }
    });
  }

  /**
   * Build menu structure from database menus
   */
  buildMenusFromDatabase(dbMenus: Menu[]): void {
    // Filter active menus only
    const activeMenus = dbMenus.filter(m => m.active === 'y' || !m.active);
    
    // Get root menus (parent = null)
    const rootMenus = activeMenus.filter(m => !m.parent);
    
    // Build menu structure
    this.menus = rootMenus.map(menu => this.buildMenuItem(menu, activeMenus));
    
    console.log('Built menu structure:', this.menus);
  }

  /**
   * Recursively build menu item with children
   */
  buildMenuItem(menu: Menu, allMenus: Menu[]): MenuItem {
    const children = allMenus
      .filter(m => m.parent === menu.id)
      .map(child => this.buildMenuItem(child, allMenus));

    // Fix URL: prepend /admin or /user based on role
    let route = menu.url_link;
    const prefix = this.isAdmin ? '/admin' : '/user';
    
    if (route && !route.startsWith('/admin/') && !route.startsWith('/user/') && !route.startsWith('/login')) {
      // Remove leading slash if exists
      route = route.startsWith('/') ? route.substring(1) : route;
      // Prepend role-based prefix
      route = `${prefix}/${route}`;
    }

    return {
      label: menu.nama_menu,
      icon: menu.icon || 'menu',
      route: route || undefined,
      menuId: menu.id,
      children: children.length > 0 ? children : undefined
    };
  }

  /**
   * Static menu structure for Admin (full access)
   */
  buildAdminMenus(): void {
    this.menus = [
      {
        label: 'Dashboard',
        icon: 'dashboard',
        route: '/admin/dashboard'
      },
      {
        label: 'Customers',
        icon: 'people',
        route: '/admin/customers'
      }
    ];

    if (this.isAdmin) {
      this.menus.push(
        {
          label: 'Master Data',
          icon: 'storage',
          children: [
            {
              label: 'Users',
              icon: 'person',
              route: '/admin/users'
            },
            {
              label: 'Business Units',
              icon: 'business',
              route: '/admin/business-units'
            },
            {
              label: 'Menus',
              icon: 'menu_book',
              route: '/admin/menus'
            }
          ]
        },
        {
          label: 'Settings',
          icon: 'settings',
          route: '/admin/settings'
        }
      );
    }
  }

  isActive(route: string): boolean {
    if (!route) return false;
    return this.router.isActive(route, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  hasChildren(menu: MenuItem): boolean {
    return menu.children !== undefined && menu.children.length > 0;
  }

  hasActiveChild(menu: MenuItem): boolean {
    if (!menu.children) return false;
    
    for (const child of menu.children) {
      if (child.route && this.isActive(child.route)) {
        return true;
      }
      if (this.hasActiveChild(child)) {
        return true;
      }
    }
    
    return false;
  }

  onMenuClick(menu: MenuItem): void {
    console.log('Menu clicked:', menu);
    if (menu.route) {
      console.log('Navigating to:', menu.route);
      this.router.navigate([menu.route]);
    }
  }
}
