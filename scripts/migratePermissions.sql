-- scripts/migratePermissions.sql
-- Raw SQL migration for Supabase to populate permissions and rolePermissions

BEGIN;

-- 1. Insert all permission actions
INSERT INTO permissions (action)
VALUES
  ('audit.create'),
  ('audit.updateStageStatus'),
  ('audit.getByClientId'),
  ('audit.getById'),
  ('audit.assignUser'),
  ('audit.unassignUser'),
  ('task.getByAuditId'),
  ('task.getAssignedToMe'),
  ('task.getAll'),
  ('task.create'),
  ('task.update'),
  ('task.delete'),
  ('document.getByClientId'),
  ('document.getByAuditId'),
  ('document.getByTaskId'),
  ('phone.makeCall'),
  ('phone.logCall')
ON CONFLICT (action) DO NOTHING;

-- 2. Grant every permission to Admin and Developer
INSERT INTO "rolePermissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('Admin', 'Developer')
ON CONFLICT DO NOTHING;

-- 3. Grant audit & task permissions to Manager
INSERT INTO "rolePermissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.action LIKE 'audit.%' OR p.action LIKE 'task.%'
WHERE r.name = 'Manager'
ON CONFLICT DO NOTHING;

-- 4. Grant read-only audit permissions to Auditor
INSERT INTO "rolePermissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.action IN ('audit.getByClientId', 'audit.getById')
WHERE r.name = 'Auditor'
ON CONFLICT DO NOTHING;

-- 5. Grant task view permissions to Staff
INSERT INTO "rolePermissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.action IN ('task.getByAuditId', 'task.getAssignedToMe', 'task.getAll')
WHERE r.name = 'Staff'
ON CONFLICT DO NOTHING;

-- 6. Grant document read permissions to Client
INSERT INTO "rolePermissions" ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.action IN ('document.getByClientId', 'document.getByAuditId', 'document.getByTaskId')
WHERE r.name = 'Client'
ON CONFLICT DO NOTHING;

COMMIT; 