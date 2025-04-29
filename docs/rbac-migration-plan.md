# RBAC Migration Plan

This report summarizes findings from the existing RBAC inventory and outlines a phased migration strategy.

## 1. Summary Statistics

Based on `rbac-inventory-enriched.json`, pattern usage counts:

| Pattern Type | Count |
|--------------|-------|
| useRbac      | 21    |
| unknown      | 18    |
| import       | 6     |
| export       | 4     |
| return       | 3     |

## 2. Priority Migration Phases

### Phase 1: Migrate Hooks & Context
- **Scope**: 21 `useRbac` occurrences
- **Action**: Replace with `useAbility()` and `PermissionContext`
- **Estimated Effort**: 5 min each (≈ 2 days total)

### Phase 2: Replace Direct Checks
- **Scope**: 18 `canAccess` calls (patternType = "unknown" may include some)
- **Action**: Convert to `useAbility().can(...)` or server-side `hasPermission`
- **Estimated Effort**: 10 min each (≈ 3 days total)

### Phase 3: Consolidate Policy Imports/Exports
- **Scope**: 6 import + 4 export statements
- **Action**: Standardize to use `permissionUtils` and deprecate direct `rbacPolicy` references
- **Estimated Effort**: 15 min per file (≈ 1 day total)

### Phase 4: Cleanup Return Logic
- **Scope**: 3 raw `return` patterns in legacy hooks
- **Action**: Ensure no legacy logic remains
- **Estimated Effort**: 30 min total

## 3. Risks & Challenges

- **Inconsistent Overrides**: Custom test spies (`vi.spyOn`) bypass logic; update tests accordingly
- **ABAC Combinations**: Mixed attribute-based access patterns need alignment with new context
- **Edge Cases**: Impersonation vs session flow, fallback UI elements

## 4. Validation & Testing Recommendations

- **Unit Tests**: Add/extend tests for `PermissionContext` and `useAbility` hooks in key components
- **Integration Tests**: Verify guarded pages (Clients, Contacts) render correct UI per role
- **E2E Tests**: Simulate login as different roles and exercise CRUD flows
- **Logging Audit**: Confirm `permissionProcedure` logs denied access

---
*Last updated on `$(date)` by automation script.* 