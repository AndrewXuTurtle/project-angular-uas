import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { Menu } from '../../models/menu.model';
import { MenuService } from '../../services/menu.service';

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
  menus: Menu[] = [];

  // Default icons untuk menu berdasarkan nama atau url
  private defaultIcons: { [key: string]: string } = {
    'dashboard': 'dashboard',
    'master': 'storage',
    'master data': 'storage',
    'users': 'people',
    'menus': 'menu_book',
    'business': 'business',
    'business units': 'business',
    'privileges': 'security',
    'settings': 'settings',
    'reports': 'assessment'
  };

  constructor(
    private menuService: MenuService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadMenus();
  }

  loadMenus(): void {
    // Gunakan endpoint baru untuk mendapatkan menu dengan privilege filtering
    this.menuService.getUserMenus().subscribe({
      next: (menus: any[]) => {
        // Rebuild tree structure dari flat menu array
        const menuTree = this.buildMenuTree(menus);
        
        // Convert URL dari Laravel ke Angular routes
        const convertedMenus = this.convertMenuUrls(menuTree);
        
        this.menus = convertedMenus;
        console.log('Loaded menus from privileges:', this.menus);
      },
      error: (error: any) => {
        console.error('Error loading menus:', error);
        // Fallback ke mock data jika API error
        this.loadMockMenus();
      }
    });
  }

  /**
   * Build proper tree structure from flat menu array
   * API mengembalikan semua menu (termasuk children) di root level
   * Kita perlu rebuild agar children nested dengan benar
   */
  buildMenuTree(flatMenus: Menu[]): Menu[] {
    // Create a map untuk akses cepat menu by ID
    const menuMap = new Map<number, Menu>();
    
    // Clone semua menu dan init children array
    flatMenus.forEach(menu => {
      if (menu.id !== undefined) {
        menuMap.set(menu.id, { ...menu, children: [] });
      }
    });
    
    // Array untuk root menus
    const rootMenus: Menu[] = [];
    
    // Build tree structure
    menuMap.forEach(menu => {
      if (menu.parent === null || menu.parent === undefined) {
        // Ini adalah root menu
        rootMenus.push(menu);
      } else {
        // Ini adalah child menu, tambahkan ke parent
        const parentMenu = menuMap.get(menu.parent);
        if (parentMenu) {
          if (!parentMenu.children) {
            parentMenu.children = [];
          }
          parentMenu.children.push(menu);
        }
      }
    });
    
    return rootMenus;
  }

  /**
   * Convert URL dari Laravel API ke Angular routes (recursive)
   * Laravel: /dashboard, /master/users
   * Angular: /admin/dashboard, /admin/users
   */
  convertMenuUrls(menus: Menu[]): Menu[] {
    return menus.map(menu => {
      const convertedMenu = { ...menu };
      
      // Convert parent URL
      if (convertedMenu.url_link) {
        convertedMenu.url_link = this.convertSingleUrl(convertedMenu.url_link);
      }
      
      // Convert children URLs recursively
      if (convertedMenu.children && convertedMenu.children.length > 0) {
        convertedMenu.children = this.convertMenuUrls(convertedMenu.children);
      }
      
      return convertedMenu;
    });
  }

  /**
   * Convert single URL from Laravel format to Angular format
   */
  convertSingleUrl(url: string): string {
    if (!url || url === '#') return url;
    
    // Mapping URL Laravel ke Angular
    const urlMap: { [key: string]: string } = {
      '/dashboard': '/admin/dashboard',
      '/master': '#', // Parent menu, tidak perlu redirect
      '/master/users': '/admin/users',
      '/master/menus': '/admin/menus',
      '/master/business-units': '/admin/business-units',
      '/settings': '/admin/settings',
      '/privileges': '/admin/privileges'
    };
    
    // Jika ada di mapping, gunakan mapping
    if (urlMap[url]) {
      return urlMap[url];
    }
    
    // Jika URL dimulai dengan /master/, replace dengan /admin/
    if (url.startsWith('/master/')) {
      return url.replace('/master/', '/admin/');
    }
    
    // Jika URL dimulai dengan /, tambahkan /admin prefix
    if (url.startsWith('/') && !url.startsWith('/admin')) {
      return '/admin' + url;
    }
    
    return url;
  }

  loadMockMenus(): void {
    // Mock data sebagai fallback
    this.menus = [
      {
        id: 1,
        nama_menu: 'Dashboard',
        url_link: '/admin/dashboard',
        icon: 'dashboard'
      },
      {
        id: 2,
        nama_menu: 'Master Data',
        url_link: '#',
        icon: 'storage',
        children: [
          { id: 4, nama_menu: 'Users', url_link: '/admin/users', icon: 'people' },
          { id: 5, nama_menu: 'Menus', url_link: '/admin/menus', icon: 'menu_book' },
          { id: 6, nama_menu: 'Business Units', url_link: '/admin/business-units', icon: 'business' },
          { id: 7, nama_menu: 'Privileges', url_link: '/admin/privileges', icon: 'security' }
        ]
      }
    ];
    console.log('Using mock menus');
  }

  isActive(url: string): boolean {
    if (!url) return false;
    return this.router.isActive(url, {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  hasChildren(menu: Menu): boolean {
    return menu.children !== undefined && menu.children.length > 0;
  }

  hasActiveChild(menu: Menu): boolean {
    if (!menu.children) return false;
    
    // Check direct children
    for (const child of menu.children) {
      if (child.url_link && this.isActive(child.url_link)) {
        return true;
      }
      
      // Check nested children recursively
      if (this.hasActiveChild(child)) {
        return true;
      }
    }
    
    return false;
  }

  getMenuIcon(menu: Menu): string {
    // Jika menu sudah punya icon, gunakan itu
    if (menu.icon) {
      return menu.icon;
    }

    // Cari icon berdasarkan nama menu (case insensitive)
    const menuName = menu.nama_menu.toLowerCase();
    for (const key in this.defaultIcons) {
      if (menuName.includes(key)) {
        return this.defaultIcons[key];
      }
    }

    // Default icon untuk parent dan child
    return this.hasChildren(menu) ? 'folder' : 'circle';
  }
}
