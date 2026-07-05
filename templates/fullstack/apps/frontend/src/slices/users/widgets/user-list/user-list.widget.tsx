import { UserListUi } from './user-list';

type UserListWidgetProps = {
  className?: string;
};

export function UserListWidget({ className }: UserListWidgetProps) {
  return <UserListUi className={className} />;
}
