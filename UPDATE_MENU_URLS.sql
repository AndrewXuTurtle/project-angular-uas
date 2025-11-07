-- =====================================================
-- UPDATE MENU URLs - Laravel Database
-- =====================================================
-- File ini untuk update URL menu di database Laravel
-- agar sesuai dengan routing Angular (/admin prefix)
-- =====================================================

-- Backup table menus dulu (RECOMMENDED!)
CREATE TABLE menus_backup AS SELECT * FROM menus;

-- =====================================================
-- UPDATE Parent Menus
-- =====================================================

-- Dashboard
UPDATE menus 
SET url_link = '/admin/dashboard' 
WHERE nama_menu = 'Dashboard' 
  AND url_link = '/dashboard';

-- Master Data (parent menu - tidak perlu route)
UPDATE menus 
SET url_link = '#' 
WHERE nama_menu = 'Master Data' 
  AND url_link = '/master';

-- Settings
UPDATE menus 
SET url_link = '/admin/settings' 
WHERE nama_menu = 'Settings' 
  AND url_link = '/settings';

-- =====================================================
-- UPDATE Children Menus (Master Data)
-- =====================================================

-- Users
UPDATE menus 
SET url_link = '/admin/users' 
WHERE nama_menu = 'Users' 
  AND url_link = '/master/users';

-- Menus
UPDATE menus 
SET url_link = '/admin/menus' 
WHERE nama_menu = 'Menus' 
  AND url_link = '/master/menus';

-- Business Units
UPDATE menus 
SET url_link = '/admin/business-units' 
WHERE nama_menu = 'Business Units' 
  AND url_link = '/master/business-units';

-- =====================================================
-- Verify Updates
-- =====================================================

SELECT 
    id,
    nama_menu,
    url_link,
    parent,
    CASE 
        WHEN parent IS NULL THEN 'Parent Menu'
        ELSE 'Child Menu'
    END as menu_type
FROM menus 
ORDER BY 
    CASE WHEN parent IS NULL THEN id ELSE parent END,
    parent,
    id;

-- =====================================================
-- Expected Result After Update:
-- =====================================================
-- id | nama_menu        | url_link                    | parent | menu_type
-- ---|------------------|-----------------------------|---------|-----------
-- 1  | Dashboard        | /admin/dashboard            | NULL   | Parent Menu
-- 2  | Master Data      | #                           | NULL   | Parent Menu
-- 3  | Settings         | /admin/settings             | NULL   | Parent Menu
-- 4  | Users            | /admin/users                | 2      | Child Menu
-- 5  | Menus            | /admin/menus                | 2      | Child Menu
-- 6  | Business Units   | /admin/business-units       | 2      | Child Menu

-- =====================================================
-- Rollback (jika perlu)
-- =====================================================

-- Restore from backup
-- DROP TABLE menus;
-- CREATE TABLE menus AS SELECT * FROM menus_backup;
-- DROP TABLE menus_backup;
