# Database Schema - V4 Master-Detail Architecture

## 📊 Entity Relationship Diagram

```
┌─────────────────────┐
│  tbl_user (Master)  │
├─────────────────────┤
│ • id (PK)           │
│ • username          │
│ • password          │
│ • full_name         │
│ • email             │
│ • level             │
│ • is_active         │
└──────────┬──────────┘
           │
           │ 1:N
           │
    ┌──────┴───────────────────────────────┐
    │                                      │
    │                                      │
┌───┴────────────────────┐    ┌───────────┴─────────────┐
│ tbl_user_business_units│    │   tbl_user_menus        │
│     (Junction/Detail)  │    │    (Junction/Detail)    │
├────────────────────────┤    ├─────────────────────────┤
│ • id (PK)              │    │ • id (PK)               │
│ • user_id (FK)         │    │ • user_id (FK)          │
│ • business_unit_id (FK)│    │ • menu_id (FK)          │
│ • active               │    │ • active                │
└───┬────────────────────┘    └────┬────────────────────┘
    │ N:1                          │ N:1
    │                              │
┌───┴──────────────────┐    ┌──────┴──────────────────┐
│ tbl_business_units   │    │   tbl_menu (Master)     │
│      (Master)        │    ├─────────────────────────┤
├──────────────────────┤    │ • id (PK)               │
│ • id (PK)            │    │ • nama_menu             │
│ • business_unit      │    │ • url_link              │
│ • active             │    │ • icon                  │
└──────────────────────┘    │ • parent                │
                            │ • active                │
                            └─────────────────────────┘
```

---

## 📋 Table Schemas

### 1. Master Tables (Unchanged)

#### tbl_user
```sql
CREATE TABLE tbl_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    level ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### tbl_business_units
```sql
CREATE TABLE tbl_business_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_unit VARCHAR(255) NOT NULL,
    active ENUM('y', 'n') DEFAULT 'y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### tbl_menu
```sql
CREATE TABLE tbl_menu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama_menu VARCHAR(255) NOT NULL,
    url_link VARCHAR(255),
    icon VARCHAR(100),
    parent INT NULL,
    active ENUM('y', 'n') DEFAULT 'y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent) REFERENCES tbl_menu(id) ON DELETE SET NULL
);
```

---

### 2. Junction Tables (NEW - V4)

#### tbl_user_business_units
```sql
CREATE TABLE tbl_user_business_units (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_unit_id INT NOT NULL,
    active ENUM('y', 'n') DEFAULT 'y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
    FOREIGN KEY (business_unit_id) REFERENCES tbl_business_units(id) ON DELETE CASCADE,
    
    -- Prevent duplicate assignments
    UNIQUE KEY unique_user_bu (user_id, business_unit_id)
);

-- Indexes for performance
CREATE INDEX idx_user_id ON tbl_user_business_units(user_id);
CREATE INDEX idx_business_unit_id ON tbl_user_business_units(business_unit_id);
```

#### tbl_user_menus
```sql
CREATE TABLE tbl_user_menus (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    menu_id INT NOT NULL,
    active ENUM('y', 'n') DEFAULT 'y',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES tbl_user(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES tbl_menu(id) ON DELETE CASCADE,
    
    -- Prevent duplicate assignments
    UNIQUE KEY unique_user_menu (user_id, menu_id)
);

-- Indexes for performance
CREATE INDEX idx_user_id ON tbl_user_menus(user_id);
CREATE INDEX idx_menu_id ON tbl_user_menus(menu_id);
```

---

## 🔄 Migration from V3 to V4

### Step 1: Create New Junction Tables
```sql
-- Create junction tables
SOURCE path/to/create_junction_tables.sql;
```

### Step 2: Migrate Existing Data (Optional)
```sql
-- If you had business_unit_id in tbl_user (V3)
-- Migrate to junction table
INSERT INTO tbl_user_business_units (user_id, business_unit_id, active)
SELECT id, business_unit_id, 'y'
FROM tbl_user
WHERE business_unit_id IS NOT NULL;

-- If you had menu permissions in another table
-- Migrate to junction table
INSERT INTO tbl_user_menus (user_id, menu_id, active)
SELECT user_id, menu_id, 'y'
FROM tbl_old_menu_permissions
WHERE allowed = 1;
```

### Step 3: Remove Old Columns (Optional)
```sql
-- If you want to remove old V3 structure
ALTER TABLE tbl_user DROP COLUMN business_unit_id;
DROP TABLE IF EXISTS tbl_old_menu_permissions;
```

---

## 📊 Sample Data

### Insert Sample Business Units
```sql
INSERT INTO tbl_business_units (business_unit, active) VALUES
('Batam', 'y'),
('Jakarta', 'y'),
('Surabaya', 'y'),
('Bandung', 'y'),
('Medan', 'y');
```

### Insert Sample Menus
```sql
INSERT INTO tbl_menu (nama_menu, url_link, icon, parent, active) VALUES
-- Parent menus
('Dashboard', '/admin/dashboard', 'dashboard', NULL, 'y'),
('Master Data', NULL, 'storage', NULL, 'y'),
('Reports', NULL, 'assessment', NULL, 'y'),
('Settings', '/admin/settings', 'settings', NULL, 'y'),

-- Child menus (under Master Data - parent_id = 2)
('Users', '/admin/users', 'people', 2, 'y'),
('Business Units', '/admin/business-units', 'business', 2, 'y'),
('Menus', '/admin/menus', 'menu', 2, 'y'),

-- Child menus (under Reports - parent_id = 3)
('Sales Report', '/admin/reports/sales', 'show_chart', 3, 'y'),
('User Activity', '/admin/reports/activity', 'timeline', 3, 'y');
```

### Insert Sample Users
```sql
INSERT INTO tbl_user (username, password, full_name, email, level, is_active) VALUES
('admin', '$2y$10$HASHED_PASSWORD', 'Administrator', 'admin@example.com', 'admin', TRUE),
('user1', '$2y$10$HASHED_PASSWORD', 'John Doe', 'john@example.com', 'user', TRUE),
('user2', '$2y$10$HASHED_PASSWORD', 'Jane Smith', 'jane@example.com', 'user', TRUE);
```

### Assign Access to Users
```sql
-- Admin gets all BUs and menus
INSERT INTO tbl_user_business_units (user_id, business_unit_id, active)
SELECT 1, id, 'y' FROM tbl_business_units;

INSERT INTO tbl_user_menus (user_id, menu_id, active)
SELECT 1, id, 'y' FROM tbl_menu;

-- User1 gets Batam & Jakarta, limited menus
INSERT INTO tbl_user_business_units (user_id, business_unit_id, active) VALUES
(2, 1, 'y'), -- Batam
(2, 2, 'y'); -- Jakarta

INSERT INTO tbl_user_menus (user_id, menu_id, active) VALUES
(2, 1, 'y'), -- Dashboard
(2, 8, 'y'); -- Sales Report

-- User2 gets Surabaya, different menus
INSERT INTO tbl_user_business_units (user_id, business_unit_id, active) VALUES
(3, 3, 'y'); -- Surabaya

INSERT INTO tbl_user_menus (user_id, menu_id, active) VALUES
(3, 1, 'y'), -- Dashboard
(3, 9, 'y'); -- User Activity
```

---

## 🔍 Useful Queries

### Get User's Accessible Business Units
```sql
SELECT u.username, bu.business_unit
FROM tbl_user u
INNER JOIN tbl_user_business_units ubu ON u.id = ubu.user_id
INNER JOIN tbl_business_units bu ON ubu.business_unit_id = bu.id
WHERE u.id = 2 AND ubu.active = 'y' AND bu.active = 'y';
```

### Get User's Accessible Menus
```sql
SELECT u.username, m.nama_menu, m.url_link, m.icon
FROM tbl_user u
INNER JOIN tbl_user_menus um ON u.id = um.user_id
INNER JOIN tbl_menu m ON um.menu_id = m.id
WHERE u.id = 2 AND um.active = 'y' AND m.active = 'y';
```

### Get Full User Access (BUs + Menus)
```sql
-- Business Units
SELECT 
    'business_unit' as type,
    bu.id,
    bu.business_unit as name,
    bu.active
FROM tbl_user_business_units ubu
INNER JOIN tbl_business_units bu ON ubu.business_unit_id = bu.id
WHERE ubu.user_id = 2 AND ubu.active = 'y'

UNION ALL

-- Menus
SELECT 
    'menu' as type,
    m.id,
    m.nama_menu as name,
    m.active
FROM tbl_user_menus um
INNER JOIN tbl_menu m ON um.menu_id = m.id
WHERE um.user_id = 2 AND um.active = 'y';
```

### Count Access by User
```sql
SELECT 
    u.id,
    u.username,
    COUNT(DISTINCT ubu.business_unit_id) as bu_count,
    COUNT(DISTINCT um.menu_id) as menu_count
FROM tbl_user u
LEFT JOIN tbl_user_business_units ubu ON u.id = ubu.user_id AND ubu.active = 'y'
LEFT JOIN tbl_user_menus um ON u.id = um.user_id AND um.active = 'y'
GROUP BY u.id, u.username;
```

### Find Users Without Access
```sql
-- Users without any BU access
SELECT u.id, u.username
FROM tbl_user u
LEFT JOIN tbl_user_business_units ubu ON u.id = ubu.user_id AND ubu.active = 'y'
WHERE ubu.id IS NULL;

-- Users without any menu access
SELECT u.id, u.username
FROM tbl_user u
LEFT JOIN tbl_user_menus um ON u.id = um.user_id AND um.active = 'y'
WHERE um.id IS NULL;
```

---

## 🛠️ Maintenance Queries

### Revoke User Access to Specific BU
```sql
UPDATE tbl_user_business_units
SET active = 'n'
WHERE user_id = 2 AND business_unit_id = 1;
```

### Grant User Access to Specific Menu
```sql
INSERT INTO tbl_user_menus (user_id, menu_id, active)
VALUES (2, 5, 'y')
ON DUPLICATE KEY UPDATE active = 'y';
```

### Bulk Update: Grant Admin All Access
```sql
-- All Business Units
INSERT IGNORE INTO tbl_user_business_units (user_id, business_unit_id, active)
SELECT 1, id, 'y' FROM tbl_business_units;

-- All Menus
INSERT IGNORE INTO tbl_user_menus (user_id, menu_id, active)
SELECT 1, id, 'y' FROM tbl_menu;
```

### Remove Inactive Assignments (Cleanup)
```sql
DELETE FROM tbl_user_business_units WHERE active = 'n';
DELETE FROM tbl_user_menus WHERE active = 'n';
```

---

## 📈 Performance Optimization

### Add Composite Indexes
```sql
-- For faster lookups
CREATE INDEX idx_user_bu_active ON tbl_user_business_units(user_id, business_unit_id, active);
CREATE INDEX idx_user_menu_active ON tbl_user_menus(user_id, menu_id, active);
```

### Analyze Query Performance
```sql
EXPLAIN SELECT * FROM tbl_user_business_units WHERE user_id = 2;
EXPLAIN SELECT * FROM tbl_user_menus WHERE user_id = 2;
```

---

## 🔐 Constraints & Business Rules

### Enforced by Database
✅ User cannot be assigned to non-existent BU (FK constraint)  
✅ User cannot be assigned to non-existent menu (FK constraint)  
✅ Deleting user cascades to remove all access (ON DELETE CASCADE)  
✅ Cannot create duplicate user-BU assignment (UNIQUE constraint)  
✅ Cannot create duplicate user-menu assignment (UNIQUE constraint)

### Enforced by Application
⚠️ Validate user has at least 1 BU before saving  
⚠️ Validate user has at least 1 menu before saving  
⚠️ Check BU & menu are active before assigning  
⚠️ Log access changes for audit trail

---

## 📝 Notes

**Why Junction Tables?**
- Flexibility: User can have multiple BUs and menus
- Scalability: Easy to add/remove access
- Normalization: No data duplication
- Performance: Indexed for fast lookups

**Why `active` Column?**
- Soft delete: Don't lose history
- Toggle access: Easy enable/disable
- Audit: Track when access was granted/revoked
- Reactivate: Restore access without re-creating

**Foreign Key Cascade:**
- `ON DELETE CASCADE`: When user deleted, remove all access
- `ON UPDATE CASCADE`: When IDs change, update references
- Maintains referential integrity

---

**Database Schema Complete! 🎉**

Use these schemas and queries to implement V4 backend API.
