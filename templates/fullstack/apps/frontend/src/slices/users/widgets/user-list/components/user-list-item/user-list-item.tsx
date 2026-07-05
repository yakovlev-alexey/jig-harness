import './user-list-item.css';

type UserListItemProps = {
  email: string;
  name: string | null;
};

export function UserListItem({ email, name }: UserListItemProps) {
  return (
    <li className="user-list-item">
      <span className="user-list-item__name">{name ?? email}</span>
      {name ? <span className="user-list-item__email">{email}</span> : null}
    </li>
  );
}
