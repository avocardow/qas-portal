# RBAC Component Interactions and Dependency Map

This document maps how RBAC-protected components interact, depend on each other, and link frontend components to backend API endpoints.

## 1. Component Dependency Table

| Component                              | Parent/Location                                                   | Child Components / Usage                                   | Permissions Checked                                     |
|----------------------------------------|-------------------------------------------------------------------|------------------------------------------------------------|---------------------------------------------------------|
| `RequirePermission` ([src/components/RequirePermission.tsx](src/components/RequirePermission.tsx)) | Application-wide                                             | Wraps any children                                           | `permission` prop via `usePermission(permission)`         |
| `Authorized` ([src/components/Authorized.tsx](src/components/Authorized.tsx))       | Application-wide                                                   | Wraps UI fragments                                           | `action` prop via `useAbility().can(action)`              |
| `DataTableTwo` ([src/components/tables/DataTables/TableTwo/DataTableTwo.tsx](src/components/tables/DataTables/TableTwo/DataTableTwo.tsx)) | Table component                                                  | Renders `<Authorized action={permission}><TableCell>…</TableCell></Authorized>` for each column that requires gating | Column-level `permission` prop                           |
| `ViewActionButton` ([src/components/common/ViewActionButton.tsx](src/components/common/ViewActionButton.tsx)) | Table row render logic                                             | Renders View/Edit buttons based on `onView` / `onEdit` props and `useAbility().can(...)` | `view:resource` / `update:resource`                    |
| `ClientsPage` ([src/app/(pages)/(dashboard)/(app)/clients/page.tsx](src/app/(pages)/(dashboard)/(app)/clients/page.tsx)) | Dashboard — Clients section                                        | Guards "Add New Client" button with `<Authorized action="clients.create">…</Authorized>` | `clients.create`                                        |
| `ContactsPage` ([src/app/(pages)/(dashboard)/(app)/contacts/page.tsx](src/app/(pages)/(dashboard)/(app)/contacts/page.tsx)) | Dashboard — Contacts section                                      | Guards "Add Contact" button with `<Authorized action="contacts.create">…</Authorized>` | `contacts.create`                                      |

## 2. Frontend ↔ Backend Mapping

| Frontend Component / Action            | tRPC Endpoint                                 | Middleware / Procedure         |
|----------------------------------------|-----------------------------------------------|--------------------------------|
| `ClientsPage` — Create client          | `clientRouter.mutation('create')`             | `permissionProcedure`          |
| `DataTableTwo` — Edit row              | `clientRouter.mutation('update')`             | `permissionProcedure`          |
| `ViewActionButton` — View record       | `clientRouter.query('getById')`               | `permissionProcedure`          |
| `ContactsPage` — List contacts         | `contactRouter.query('getAll')`               | `permissionProcedure`          |
| `Authorized` wrapping `UserEditor`     | `userRouter.mutation('update')`               | `permissionProcedure`          |

---
*This file was generated to provide a high-level map of RBAC component relationships and ensure consistency in permission enforcement.* 