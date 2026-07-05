# TanStack Query + Nano Stores examples

## Query file

```typescript
// store/queries/users-query.ts
import { queryOptions } from '@tanstack/react-query';
import { usersListResponseSchema } from '@app/types/slices/users/user-contracts';
import { apiUrl } from '@/common/api-url';

export const usersQueryKey = ['users'] as const;

export const usersQuery = () =>
  queryOptions({
    queryKey: usersQueryKey,
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/users`);
      if (!response.ok) throw new Error('Failed to load users');
      return usersListResponseSchema.parse(await response.json());
    },
  });
```

## Command file

```typescript
// store/commands/create-user-command.ts
export async function createUserCommand(body: CreateUserBody): Promise<UserResponse> {
  const payload = createUserBodySchema.parse(body);
  const response = await fetch(`${apiUrl}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  // parse + throw typed errors
}
```

## Mutation in container

```typescript
// widgets/create-user-form/create-user-form.widget.tsx
const createUserMutation = useMutation({
  mutationFn: createUserCommand,
  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: usersQueryKey });
  },
});
```

## Nano Store model

```typescript
// store/model/users-filter-store.ts
import { atom } from 'nanostores';

export const usersFilterAtom = atom('');

export function setUsersFilter(value: string) {
  usersFilterAtom.set(value);
}
```

## Pure selector

```typescript
// store/selectors/filter-users.ts
export function filterUsers(users: UserResponse[], query: string): UserResponse[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') return users;
  return users.filter(
    (user) =>
      user.email.toLowerCase().includes(normalized) ||
      (user.name?.toLowerCase().includes(normalized) ?? false),
  );
}
```

## Shared filter across widgets

Filter widget writes the atom; list widget reads it — no prop drilling through the page:

```typescript
// users-filter.widget.tsx — container
const filter = useStore(usersFilterAtom);
return <UsersFilterUi value={filter} onChange={setUsersFilter} />;

// user-list.widget.tsx — container
const filter = useStore(usersFilterAtom);
const users = filterUsers(data ?? [], filter);
return <UserListUi users={users} ... />;
```
