# Frontend slice layout examples

## Slice segments

```text
src/slices/profile/
  components/
    avatar-badge/
      avatar-badge.tsx
      avatar-badge.css
  pages/
    profile-page/
      profile-page.tsx
      profile-page.css
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
```

Do not nest `common/query-client/query-client.ts`.
