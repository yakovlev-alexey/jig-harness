import { classNames } from '@/common/utils/class-names';
import './users-filter.css';

type UsersFilterUiProps = {
  className?: string;
  onChange: (value: string) => void;
  value: string;
};

export function UsersFilterUi({ className, onChange, value }: UsersFilterUiProps) {
  return (
    <section className={classNames('users-filter', className)}>
      <label className="users-filter__label" htmlFor="users-filter-input">
        Filter users
      </label>
      <input
        className="users-filter__input"
        id="users-filter-input"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search by name or email"
        type="search"
        value={value}
      />
    </section>
  );
}
