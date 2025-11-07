# Nested Menu Multi-Level Guide

## Fitur Unlimited Nested Menu

Sidebar menu sekarang mendukung **unlimited nested levels** (menu bertingkat tanpa batas).

### Struktur Menu yang Didukung

```
Menu Level 1
├── Menu Level 2 (child of Level 1)
│   ├── Menu Level 3 (child of Level 2)
│   │   ├── Menu Level 4 (child of Level 3)
│   │   │   └── ... dan seterusnya
│   │   └── Menu Level 4 (another child of Level 3)
│   └── Menu Level 3 (another child of Level 2)
└── Menu Level 2 (another child of Level 1)
```

### Contoh Struktur Data dari API

```json
[
  {
    "id": 1,
    "nama_menu": "Master Data",
    "url_link": "#",
    "icon": "storage",
    "children": [
      {
        "id": 2,
        "nama_menu": "User Management",
        "url_link": "#",
        "icon": "people",
        "children": [
          {
            "id": 3,
            "nama_menu": "Users",
            "url_link": "/admin/users",
            "icon": "person"
          },
          {
            "id": 4,
            "nama_menu": "Roles",
            "url_link": "/admin/roles",
            "icon": "security",
            "children": [
              {
                "id": 5,
                "nama_menu": "Role List",
                "url_link": "/admin/roles/list",
                "icon": "list"
              },
              {
                "id": 6,
                "nama_menu": "Permissions",
                "url_link": "/admin/roles/permissions",
                "icon": "key"
              }
            ]
          }
        ]
      }
    ]
  }
]
```

### Fitur yang Diimplementasikan

1. **Recursive Template** - Menggunakan `ng-template` dengan `ngTemplateOutlet` untuk render menu secara rekursif
2. **Auto Indentation** - Setiap level child mendapat padding otomatis (16px per level)
3. **Active State Detection** - Deteksi rekursif untuk menandai parent menu yang memiliki child aktif
4. **URL Conversion** - Konversi URL Laravel ke Angular routes secara rekursif
5. **Responsive Styling** - Font size dan icon size mengecil di level yang lebih dalam

### Cara Kerja

#### 1. HTML Template (Recursive)
```html
<ng-template #menuTemplate let-menu let-level="level">
  <!-- Menu tanpa children -->
  <a *ngIf="!hasChildren(menu)" 
     [style.padding-left.px]="16 + (level * 16)">
    <!-- Content -->
  </a>

  <!-- Menu dengan children (recursive) -->
  <mat-expansion-panel *ngIf="hasChildren(menu)"
                       [style.margin-left.px]="level * 16">
    <mat-nav-list class="submenu-list">
      <ng-container *ngFor="let child of menu.children">
        <!-- Recursive call -->
        <ng-container *ngTemplateOutlet="menuTemplate; context: { $implicit: child, level: level + 1 }">
        </ng-container>
      </ng-container>
    </mat-nav-list>
  </mat-expansion-panel>
</ng-template>
```

#### 2. TypeScript (Recursive Functions)

**convertMenuUrls** - Konversi URL secara rekursif:
```typescript
convertMenuUrls(menus: Menu[]): Menu[] {
  return menus.map(menu => {
    const convertedMenu = { ...menu };
    
    if (convertedMenu.url_link) {
      convertedMenu.url_link = this.convertSingleUrl(convertedMenu.url_link);
    }
    
    // Recursive call untuk children
    if (convertedMenu.children && convertedMenu.children.length > 0) {
      convertedMenu.children = this.convertMenuUrls(convertedMenu.children);
    }
    
    return convertedMenu;
  });
}
```

**hasActiveChild** - Cek active state secara rekursif:
```typescript
hasActiveChild(menu: Menu): boolean {
  if (!menu.children) return false;
  
  for (const child of menu.children) {
    // Check direct child
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
```

### Styling

- **Level 0** (Root): Margin 4px 8px
- **Level 1+**: Margin-left bertambah 16px per level
- **Font Size**: 14px (level 1), 13px (level 2+)
- **Icon Size**: 18px (level 1), 16px (level 2+)
- **Active Indicator**: Background biru dengan opacity

### Testing

Untuk menguji nested menu:

1. **Tambah menu parent** di database:
```sql
INSERT INTO menus (nama_menu, url_link, parent, icon, active) 
VALUES ('Master Data', '#', NULL, 'storage', 1);
```

2. **Tambah child level 1**:
```sql
INSERT INTO menus (nama_menu, url_link, parent, icon, active) 
VALUES ('User Management', '#', 1, 'people', 1);
```

3. **Tambah child level 2** (parent = ID menu level 1):
```sql
INSERT INTO menus (nama_menu, url_link, parent, icon, active) 
VALUES ('Users', '/master/users', 2, 'person', 1);
```

4. **Tambah child level 3** (parent = ID menu level 2):
```sql
INSERT INTO menus (nama_menu, url_link, parent, icon, active) 
VALUES ('User Roles', '/master/users/roles', 3, 'security', 1);
```

Dan seterusnya tanpa batas!

### Performance Notes

- Recursive rendering di Angular sangat efisien dengan Change Detection
- Hanya menu yang visible yang akan di-render
- Expansion panels lazy-load content saat dibuka
- Tidak ada batasan depth, tapi untuk UX sebaiknya maksimal 4-5 levels

### Browser Support

Tested dan berfungsi di:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
