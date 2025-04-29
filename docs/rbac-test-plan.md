# RBAC Test Plan

This document provides a comprehensive test plan for the new RBAC system using `useAbility` and `<Authorized>` components.

## Test Coverage Matrix

| Page / Feature            | Developer (Bypass) | Admin | Manager | Staff | Auditor | Client |
|---------------------------|--------------------|-------|---------|-------|---------|--------|
| Clients Page              | ✔️                 | ✔️    | ✔️      | ❌    | ❌      | ❌     |
| Contacts Page             | ✔️                 | ✔️    | ✔️      | ❌    | ❌      | ❌     |
| Dashboard                 | ✔️                 | ✔️    | ✔️      | ❌    | ✔️      | ❌     |
| Audits                    | ✔️                 | ✔️    | ✔️      | ❌    | ✔️      | ❌     |
| Tasks                     | ✔️                 | ✔️    | ✔️      | ✔️    | ❌      | ❌     |
| Email                     | ✔️                 | ✔️    | ❌      | ❌    | ❌      | ❌     |
| Files                     | ✔️                 | ✔️    | ✔️      | ❌    | ❌      | ✔️     |
| Invoices                  | ✔️                 | ✔️    | ✔️      | ❌    | ❌      | ❌     |
| Permission Management     | ✔️                 | ✔️    | ❌      | ❌    | ❌      | ❌     |
| Phone                     | ✔️                 | ✔️    | ❌      | ❌    | ❌      | ❌     |

## Test Implementation Details

### Unit Tests
- Configure Jest mocks for `AbilityContext` to simulate permission scenarios.
- Assert `can(permission)` and `cannot(permission)` return correct booleans.
- Snapshot tests for `<Authorized>` and `RequirePermission` components.

### Integration Tests
- Use Vitest + React Testing Library with MSW to mock API calls.
- Simulate user sessions for each role and verify permissions on guarded pages.

### Smoke Tests
- Basic navigation flows for Admin and users without roles.
- Verify redirection and unauthorized messages on protected routes.

### End-to-End Tests (Cypress)
- Custom commands for role-based authentication.
- Perform create/edit/delete flows for tasks, audits, and documents under different roles.

### Documentation
- This file (`docs/rbac-test-plan.md`) documents the coverage matrix and testing strategies. 