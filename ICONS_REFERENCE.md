# Material Icons Reference

## Icons Currently Used in Application

### Layout Icons ✅
- `menu` - Hamburger menu (sidebar toggle)
- `dashboard` - Logo icon
- `account_circle` - User profile icon
- `arrow_drop_down` - Dropdown arrow
- `notifications` - Notification bell

### Navigation/Menu Icons ✅
- `dashboard` - Dashboard
- `people` - Users
- `menu_book` - Menus (VERIFIED: valid Material icon)
- `security` - Privileges
- `business` - Business units
- `storage` - Master data parent
- `assessment` - Reports
- `bar_chart` - Charts/Analytics
- `history` - Activity log
- `folder` - Default fallback icon

### Action Icons ✅
- `add` - Add new item
- `edit` - Edit button
- `delete` - Delete button
- `close` - Close dialog
- `save` - Save changes
- `cancel` - Cancel action
- `search` - Search input
- `filter_list` - Filter data
- `refresh` - Reload data
- `bolt` - Quick actions / Lightning icon
- `info` - Information

### Trend Icons ✅
- `trending_up` - Increase
- `trending_down` - Decrease
- `trending_flat` - Stable

## Material Icons Verification

All icons above are verified as valid Material Icons (v1.0.0+).

**Source**: https://fonts.google.com/icons

## Common Icon Mistakes to Avoid

❌ **Invalid Icons** (DO NOT USE):
- `menu_icon` (use `menu` instead)
- `user` (use `person` or `account_circle`)
- `trash` (use `delete`)
- `pencil` (use `edit`)
- `chart` (use `bar_chart` or `pie_chart`)

✅ **Correct Alternatives**:
- `menu`
- `person` / `account_circle`
- `delete`
- `edit`
- `bar_chart` / `pie_chart`

## Icon Setup in Angular

### 1. Import MatIconModule

```typescript
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [MatIconModule, ...]
})
```

### 2. Add Material Icons Font (already configured)

In `index.html`:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### 3. Use Icons in Templates

```html
<!-- Basic icon -->
<mat-icon>dashboard</mat-icon>

<!-- Icon with color -->
<mat-icon color="primary">dashboard</mat-icon>

<!-- Icon button -->
<button mat-icon-button>
  <mat-icon>edit</mat-icon>
</button>

<!-- Dynamic icon -->
<mat-icon>{{ menu.icon || 'folder' }}</mat-icon>
```

## Current Icon Status

✅ **NO ICON ERRORS** - All icons in the application are valid Material Icons.

The application uses only verified Material Icons from Google Fonts:
- All dashboard icons: ✅ Valid
- All navigation icons: ✅ Valid
- All action buttons: ✅ Valid
- All menu icons: ✅ Valid

## Adding New Icons

When adding new icons, verify first at:
https://fonts.google.com/icons?icon.set=Material+Icons

Popular categories:
- **Action**: search, settings, help, info, home
- **Alert**: warning, error, check_circle
- **AV**: play_arrow, pause, stop, volume_up
- **Communication**: email, chat, phone, contact_phone
- **Content**: add, remove, clear, create, save
- **Editor**: attach_file, insert_chart, format_bold
- **File**: folder, cloud_upload, cloud_download
- **Hardware**: laptop, phone_android, keyboard
- **Image**: photo, camera, image, crop
- **Maps**: location_on, map, directions
- **Navigation**: arrow_back, arrow_forward, menu, close
- **Social**: person, people, group, share
- **Toggle**: star, star_border, favorite

## Icon Sizes

Default sizes available:
- `18px` - Small icons
- `24px` - Default (recommended)
- `36px` - Medium
- `48px` - Large

Set custom size with CSS:
```scss
.mat-icon {
  font-size: 24px;
  height: 24px;
  width: 24px;
}
```

## Icon Colors

Material predefined colors:
- `color="primary"` - Primary theme color
- `color="accent"` - Accent theme color
- `color="warn"` - Warning color (red)

Custom colors with CSS:
```scss
.success-icon {
  color: #4caf50;
}
.error-icon {
  color: #f44336;
}
```
