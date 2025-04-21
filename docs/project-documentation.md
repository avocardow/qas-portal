# Project Documentation

## Folder Structure and Routing Overview

The application uses the Next.js App Router (v15), and the folder and file structure under `src/app` maps directly to URL routes. Below is an overview of key directories and their corresponding routes:

| Directory                                              | Route                              | Description                                     |
| ------------------------------------------------------ | ---------------------------------- | ----------------------------------------------- |
| `src/app/page.tsx`                                     | `/`                                | Landing (home) page                             |
| `src/app/(pages)/(auth)/signin/page.tsx`               | `/auth/signin`                     | User sign-in page                               |
| `src/app/(pages)/(auth)/activate/page.tsx`             | `/auth/activate`                   | Account activation page                         |
| `src/app/(pages)/(dashboard)/(app)/dashboard/page.tsx` | `/dashboard/app/dashboard`         | Main dashboard view                             |
| `src/app/(pages)/(dashboard)/(app)/clients/page.tsx`   | `/dashboard/app/clients`           | Clients list view                               |
| `src/app/(pages)/(dashboard)/(app)/clients/[clientId]` | `/dashboard/app/clients/:clientId` | Dynamic route for individual client details     |
| `src/app/(pages)/(dashboard)/(portal)/home/page.tsx`   | `/dashboard/portal/home`           | Portal home page                                |
| `src/app/(tailadmin)/(full-width-pages)/error-pages`   | `/error-*`                         | TailAdmin template error pages (404, 500, etc.) |

### Next.js App Router Conventions

- **Route Segments**: Folders and files under `src/app` correspond to URL segments. For example, `(pages)/(dashboard)/(portal)/billing/page.tsx` → `/dashboard/portal/billing`.
- **Dynamic Routes**: Names in square brackets (e.g., `[invoiceId]`) indicate route parameters. E.g., `billing/[invoiceId]/page.tsx` → `/dashboard/portal/billing/:invoiceId`.
- **Route Groups**: Folders wrapped in parentheses (`(pages)`, `(dashboard)`) are _route groups_ that organize files without adding to the URL path.
- **Layouts**: Files named `layout.tsx` within a folder apply shared layouts to all child routes in that folder.
- **Not Found and Error Pages**: Special files like `not-found.tsx` and directories under `(full-width-pages)/(error-pages)` define custom error and status pages.

## Migration Script Usage Guide

### Prerequisites

- Ensure you have Node.js 18.x or later and dependencies installed: `pnpm install`
- Copy `.env.example` to `.env` in the project root and fill in:
  - `DATABASE_URL`: Your PostgreSQL connection string
  - `DIRECT_URL`: Alternate DB connection string
- Ensure the CSV file exists at `data/clients.csv`
- Confirm the `scriptRunnerUserId` in `scripts/migrateClients.ts` is updated to a valid admin user UUID
- Generate the Prisma client:
  ```bash
  pnpm prisma generate
  ```

### Usage

Run the migration script with `ts-node` and ESM loader:

```bash
NODE_OPTIONS='--loader ts-node/esm' pnpm exec ts-node scripts/migrateClients.ts
```

Alternatively, using `tsx`:

```bash
pnpm exec tsx scripts/migrateClients.ts
```

### Expected Output

- Initial log:
  ```
  Starting migration from /absolute/path/to/data/clients.csv...
  ```
- Per-client logs:
  ```
  Processing client: <Client Name>
  ...
  ```
- Summary at completion:
  ```
  Migration finished.
    Successfully processed: <successCount> clients.
    Errors encountered: <errorCount> clients.
  ```

### Error Handling

- `Default Audit Status "<status>" not found.`: The default audit status name is missing in the database
- `scriptRunnerUserId is not set correctly.`: The `scriptRunnerUserId` placeholder needs updating
- Any other errors will be printed to the console for troubleshooting

## Data Verification Instructions for Supabase Table Editor

1. Accessing the Table Editor

   - Go to https://app.supabase.com and log in.
   - Select your project, then click **Database → Table Editor**.
   - Choose the **public** schema (or relevant schema) to view tables.

2. Verifying Migrated Tables

   - Identify migrated tables:
     - `clients`, `contacts`, `trustAccounts`
     - `licenses`, `audits`, `documents`
     - `callLogs`, `activityLogs`, `notes`
   - Click a table and use **Browse rows** to:
     - Confirm row counts match expectations (e.g., run `SELECT COUNT(*) FROM clients;`).
     - Inspect sample records for key fields:
       - **clients**: `clientName`, `status`, `createdAt`, `updatedAt`
       - **contacts**: `name`, `email`, `isPrimary`, `clientId`
       - Relationship columns (`clientId`, `contactId`) link tables.
   - Use the **SQL Editor** for custom validations:
     ```sql
     SELECT c.clientName, s.name AS audit_status
     FROM "Audit" a
     JOIN clients c ON a."clientId" = c.id
     JOIN "AuditStatus" s ON a."statusId" = s.id
     WHERE s.name = 'In Progress';
     ```

3. Troubleshooting & Tips
   - If row counts differ, re-run migration script:
     ```bash
     pnpm exec tsx scripts/migrateClients.ts
     ```
   - Check Supabase **Activity** logs for errors or missing tables.
   - Ensure `DATABASE_URL` and `DIRECT_URL` in `.env` are correct.
   - Refresh the Table Editor or clear your browser cache if tables do not appear.

## Placeholder Pages and Intended Functionality

Below is a list of current placeholder pages (using `DashboardPlaceholderPageTemplate`) and their intended future functionality:

| Route                                   | Heading      | Intended Functionality                                                 |
| --------------------------------------- | ------------ | ---------------------------------------------------------------------- |
| `/dashboard/portal/home`                | Home         | Portal landing page with quick access to client features and dashboard |
| `/dashboard/portal/billing`             | Billing      | Overview of client billing statements and payment status               |
| `/dashboard/portal/billing/:invoiceId`  | Invoice      | View, download, and pay individual invoices                            |
| `/dashboard/portal/documents`           | Documents    | Client document repository with upload/download functionality          |
| `/dashboard/portal/profile`             | Profile      | User profile settings and personal information management              |
| `/dashboard/app/dashboard`              | Dashboard    | Admin analytics overview with metrics, charts, and summary cards       |
| `/dashboard/app/email`                  | Email        | In-app messaging center for sending and receiving emails               |
| `/dashboard/app/files`                  | Files        | File management interface for uploads, downloads, and previews         |
| `/dashboard/app/phone`                  | Phone        | Call integration dashboard and call logs                               |
| `/dashboard/app/account`                | Account      | Account-level settings and preferences                                 |
| `/dashboard/app/chat`                   | Chat         | Real-time chat interface for client communications                     |
| `/dashboard/app/invoices`               | Invoices     | Invoice list and batch actions                                         |
| `/dashboard/app/invoices/new`           | New Invoice  | Form for creating new invoices                                         |
| `/dashboard/app/invoices/:invoiceId`    | Invoice      | Detailed view and editing of a single invoice                          |
| `/dashboard/app/audits`                 | Audits       | Audit records overview with filters and search                         |
| `/dashboard/app/audits/:auditId`        | Audit        | Detailed audit report view                                             |
| `/dashboard/app/tasks`                  | Tasks        | Task list and Kanban board for task management                         |
| `/dashboard/app/tasks/new`              | New Task     | Form for creating new tasks                                            |
| `/dashboard/app/tasks/:taskId`          | Task         | Detailed task view and update interface                                |
| `/dashboard/app/calendar`               | Calendar     | Calendar view with scheduling and event management                     |
| `/dashboard/app/settings`               | Settings     | System-wide settings configuration                                     |
| `/dashboard/app/settings/users`         | Users        | User management interface for assigning roles and permissions          |
| `/dashboard/app/settings/templates`     | Templates    | Template library for emails, documents, and notifications              |
| `/dashboard/app/settings/templates/new` | New Template | Form for creating new templates                                        |

## Next Steps for Phase 1 Development

Below is an outline of the immediate next steps for Phase 1 development:

1. Implement Core Entity UIs and CRUD Operations
   - Build clients list and detail pages using real data from Supabase via tRPC.
   - Create contacts management pages with create, update, and delete functionality.
   - Develop trust account and license management interfaces.
2. Integrate Authentication and Authorization
   - Finalize NextAuth Azure AD sign-in and role-based access control.
   - Ensure protected routes in the (app) group enforce user permissions.
3. Complete Feature Implementations
   - Implement billing workflows: invoice creation, payment processing, and status updates.
   - Develop audit and task management modules with server actions and real-time updates.
   - Build calendar and chat interfaces with full functionality.
4. Enhance Data Verification and Migration
   - Validate migrated data in staging and production-like environments.
   - Automate migration scripts within CI pipelines for repeatable deployments.
5. Refine UI/UX and Accessibility
   - Review UI components for consistency, responsiveness, and accessibility compliance.
   - Conduct user testing sessions to gather feedback and iterate on designs.
6. Testing and CI/CD Setup
   - Write comprehensive unit and integration tests for both frontend and backend.
   - Configure GitHub Actions workflows for linting, testing, and automated deployments.
7. Documentation and Knowledge Transfer
   - Finalize and publish documentation to the project wiki and README.
   - Host internal walkthrough sessions to onboard the development team.
