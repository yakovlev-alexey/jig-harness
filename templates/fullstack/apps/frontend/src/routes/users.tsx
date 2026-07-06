import { createFileRoute } from '@tanstack/react-router';
import { CreateUserFormWidget } from '@/slices/users/widgets/create-user-form/create-user-form.widget';
import { UserListWidget } from '@/slices/users/widgets/user-list/user-list.widget';
import { UsersFilterWidget } from '@/slices/users/widgets/users-filter/users-filter.widget';
import { usersQuery } from '@/slices/users/store/queries/users-query';
import './users.css';

export const Route = createFileRoute('/users')({
  loader: ({ context }) => context.queryClient.ensureQueryData(usersQuery()),
  component: UsersPage,
});

function UsersPage() {
  return (
    <main className="users-page">
      <h1 className="users-page__title">Users</h1>
      <CreateUserFormWidget className="users-page__form" />
      <UsersFilterWidget className="users-page__filter" />
      <UserListWidget className="users-page__list" />
    </main>
  );
}
