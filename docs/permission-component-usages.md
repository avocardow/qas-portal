# Permission Component Usages Inventory

Below is a list of all instances of the `<RequirePermission>` component across the codebase, including file path and line numbers.

- **src/components/RequirePermission.tsx**
  - Line 10: `export default function RequirePermission({ permission, children }: RequirePermissionProps)` – Component definition
  - Line 14: `const allowed = usePermission(permission);` – Permission check within the component

**Usage Note:**

No occurrences of `<RequirePermission>` were found elsewhere in the codebase outside of its own declaration. Consider integrating `RequirePermission` into pages or components to enforce permission-based rendering consistently. 