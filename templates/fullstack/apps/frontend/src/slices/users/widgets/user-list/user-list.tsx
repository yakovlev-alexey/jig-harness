import type { UserResponse } from '@app/types/slices/users/user-contracts';
import { classNames } from '@/common/utils/class-names';
import { UserListItem } from './components/user-list-item/user-list-item';
import './user-list.css';

type UserListUiProps = {
  className?: string;
  isError: boolean;
  isPending: boolean;
  users: UserResponse[];
};

export function UserListUi({ className, isError, isPending, users }: UserListUiProps) {
  if (isPending) {
    return (
      <section className={classNames('user-list', className)}>
        <p className="user-list__status">Loading users…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className={classNames('user-list', className)}>
        <p className="user-list__status user-list__status--error">Failed to load users.</p>
      </section>
    );
  }

  return (
    <section className={classNames('user-list', className)}>
      <h2 className="user-list__title">Users</h2>
      {users.length === 0 ? (
        <p className="user-list__empty">No users yet</p>
      ) : (
        <ul className="user-list__items">
          {users.map((user) => (
            <UserListItem key={user.id} email={user.email} name={user.name} />
          ))}
        </ul>
      )}
    </section>
  );
}
