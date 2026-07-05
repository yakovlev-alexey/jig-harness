# Frontend slice layout examples

## Slice segments

```text
src/slices/profile/
  components/
    avatar-badge/
      avatar-badge.tsx
      avatar-badge.css
  widgets/
    profile-stats/
      profile-stats.tsx
      profile-stats.css
      profile-stats.widget.tsx
  store/
    model/
      profile-filters.ts
    selectors/
      profile-filter-selector.ts
    queries/
      profile-stats-query.ts
    commands/
      update-profile-command.ts
  utils/
    format-display-name.ts
  constants/
    profile-tabs.ts
```

Route targets (pages) live in `src/routes/` — not inside slices:

```text
src/routes/
  profile.tsx
  profile.css
```

## Import examples (fe-no-barrels, fe-named-exports)

```typescript
// Good — concrete named file
import { AvatarBadge } from '../../components/avatar-badge/avatar-badge';

// Bad — barrel alias
export { AvatarBadge } from './avatar-badge/avatar-badge';
```

## Common non-component files (fe-slices-layout)

```text
src/common/query-client.ts
src/common/utils/format-date.ts
src/common/components/app-logo/app-logo.tsx
src/routes/users.tsx
src/routeTree.gen.ts
```

Do not nest `common/query-client/query-client.ts` or segment subcategories like `common/components/ui/`.
