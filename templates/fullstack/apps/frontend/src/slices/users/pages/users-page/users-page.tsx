import { CreateUserFormWidget } from '../../widgets/create-user-form/create-user-form.widget';
import { UserListWidget } from '../../widgets/user-list/user-list.widget';
import './users-page.css';

export function UsersPage() {
  return (
    <main className="users-page">
      <h1 className="users-page__title">Users</h1>
      <CreateUserFormWidget className="users-page__form" />
      <UserListWidget className="users-page__list" />
    </main>
  );
}
