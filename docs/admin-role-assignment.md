# Admin Role Assignment Process

## Overview

- This document describes how to assign the **Admin** role to a designated Team Member in the database.

## Prerequisites

- Ensure Prisma is configured and you have database access.
- Confirm the user exists in the database.

## SQL Query Example

```sql
-- Assign Admin role to a specific user by ID
UPDATE "User"
SET role = 'Admin'
WHERE id = '<USER_ID>';
```

## Prisma Client Example

```ts
import { prisma } from "@/server/db";

async function assignAdminRole(userId: string) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: "Admin" },
  });
  console.log("Assigned Admin role to:", updatedUser.email);
}
```

## Safety Checks

1. **Verify current role** before updating:
   ```sql
   SELECT id, email, role FROM "User" WHERE id = '<USER_ID>';
   ```
2. **Confirmation prompt** in scripts to prevent accidental assignments.

## Verification

- Run the following to confirm the change:
  ```sql
  SELECT id, email, role FROM "User" WHERE id = '<USER_ID>';
  ```

## Future Role Management

- Document Admin role revocation process.
- Plan for UI integration in a later phase (e.g., via Shadcn UI forms).
