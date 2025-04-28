# Permission Library Selection

Based on the evaluation of CASL and AccessControl, we have chosen **CASL** as the permission engine for our project.

## Decision Criteria

- **Feature Completeness**: CASL's Ability model supports dynamic conditions, field-level permissions, and nested resources, matching our project's complex requirements.
- **Performance**: CASL proved faster in both ability build and permission check benchmarks:

  | Library       | Build Avg (ms) | Check Avg (ms) |
  |---------------|---------------:|---------------:|
  | CASL          | 0.0030         | 0.0004         |
  | AccessControl | 0.0025 (batch) | 0.0008 (per)   |

- **Bundle Size**: With tree-shaking, CASL imports only needed modules and results in smaller optimized bundles. Use `pnpm run analyze:bundle` to visualize.
- **Community & Maintenance**: CASL has a larger community, frequent updates, and extensive documentation.
- **TypeScript Support**: Strongly-typed AbilityBuilder API simplifies developer experience and reduces runtime errors.

## Integration Plan

1. **Install CASL** (already added via `@casl/ability`).
2. **Create Centralized Permission Service**: Define a single API for obtaining abilities and checking permissions across both frontend and backend.
3. **Replace POC Implementations**: Remove AccessControl POC code and unify permission checks through the new service.
4. **UI Integration**: Use `@casl/react`'s `<Can>` and `useAbility` hooks in React components.
5. **Testing**: Add integration tests to verify permission behavior across user roles.

## Usage Examples

```typescript
import { canReadArticle, canUpdateArticle } from 'src/lib/permissionService';

const user = { id: 1, isAdmin: false };
const article = new Article(1, true);

if (canReadArticle(user)) {
  // render read view
}

if (canUpdateArticle(user, article)) {
  // allow update
}
```

Refer to [permissionService.ts](src/lib/permissionService.ts) for full API details. 