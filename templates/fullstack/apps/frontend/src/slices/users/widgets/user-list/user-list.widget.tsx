import { useStore } from '@nanostores/react';
import { useQuery } from '@tanstack/react-query';
import { usersFilterAtom } from '../../store/model/users-filter-store';
import { filterUsers } from '../../store/selectors/filter-users';
import { usersQuery } from '../../store/queries/users-query';
import { UserListUi } from './user-list';

type UserListWidgetProps = {
  className?: string;
};

export function UserListWidget({ className }: UserListWidgetProps) {
  const { data, isPending, isError } = useQuery(usersQuery());
  const filter = useStore(usersFilterAtom);
  const users = data ? filterUsers(data, filter) : [];

  return <UserListUi className={className} isError={isError} isPending={isPending} users={users} />;
}
