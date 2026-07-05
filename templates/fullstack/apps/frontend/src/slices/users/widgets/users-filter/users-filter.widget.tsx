import { useStore } from '@nanostores/react';
import { setUsersFilter, usersFilterAtom } from '../../store/model/users-filter-store';
import { UsersFilterUi } from './users-filter';

type UsersFilterWidgetProps = {
  className?: string;
};

export function UsersFilterWidget({ className }: UsersFilterWidgetProps) {
  const filter = useStore(usersFilterAtom);

  return <UsersFilterUi className={className} onChange={setUsersFilter} value={filter} />;
}
