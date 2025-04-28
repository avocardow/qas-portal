# Permission Constant Imports Inventory

Below is a list of all import statements referencing permission constant groups across the codebase, including file paths and line numbers.

- **src/app/(pages)/(dashboard)/(app)/tasks/new/page.tsx**
  - Line 13: `import { TASK_PERMISSIONS } from "@/constants/permissions";`
- **src/app/(pages)/(dashboard)/(app)/tasks/[taskId]/page.tsx**
  - Line 10: `import { TASK_PERMISSIONS } from "@/constants/permissions";`
- **src/app/(pages)/(dashboard)/(app)/audits/page.tsx**
  - Line 4:  `import { AUDIT_PERMISSIONS } from "@/constants/permissions";`
- **src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx**
  - Line 7:  `import { TASK_PERMISSIONS, AUDIT_PERMISSIONS } from "@/constants/permissions";`
- **src/app/(pages)/(dashboard)/(app)/phone/page.tsx**
  - Line 14: `import { PHONE_PERMISSIONS } from "@/constants/permissions";`
- **src/layout/AppSidebar.tsx**
  - Line 9:  `import { TASK_PERMISSIONS, PHONE_PERMISSIONS } from "@/constants/permissions";`
  - Line 10: `import { AUDIT_PERMISSIONS } from "@/constants/permissions";`
- **src/server/api/routers/document.ts**
  - Line 5:  `import { DOCUMENT_PERMISSIONS } from "@/constants/permissions";`
- **src/server/api/routers/audit.ts**
  - Line 7:  `import { AUDIT_PERMISSIONS } from "@/constants/permissions";`
- **src/server/api/routers/task.ts**
  - Line 4:  `import { TASK_PERMISSIONS } from "@/constants/permissions";`
- **src/server/api/routers/phone.ts**
  - Line 2:  `import { PHONE_PERMISSIONS } from "@/constants/permissions";`
- **src/server/api/utils/rbac.test.ts**
  - Line 11: `import { TASK_PERMISSIONS } from "@/constants/permissions";`
- **src/components/audit/AuditList.tsx**
  - Line 14: `import { AUDIT_PERMISSIONS } from "@/constants/permissions";` 