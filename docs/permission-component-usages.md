# Permission Component Usages Inventory

Below is a list of all instances of the `<RequirePermission>` component across the codebase, including file path and line numbers.

- **src/components/RequirePermission.tsx**
  - Line 10: `export default function RequirePermission({ permission, children }: RequirePermissionProps)` – Component definition
  - Line 14: `const allowed = usePermission(permission);` – Permission check within the component

- **src/components/Authorized.tsx**
  - Line 1: `export default const Authorized: React.FC<AuthorizedProps>` – Component definition using `useAbility` for permission checks
  - Usage example:
    ```jsx
    <Authorized action="read:document" fallback={<div>No access</div>}>
      <DocumentContent />
    </Authorized>
    ```

**Usage Note:**

The `<Authorized>` component provides a simpler, memoized alternative for conditionally rendering children based on the user's permissions using the `useAbility` hook. Replace instances of `RequirePermission` where caching and performance optimizations are desired. 