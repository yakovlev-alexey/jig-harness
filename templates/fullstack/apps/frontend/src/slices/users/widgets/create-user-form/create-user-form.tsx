import { type FormEvent } from 'react';
import { classNames } from '@/common/utils/class-names';
import './create-user-form.css';

type CreateUserFormUiProps = {
  className?: string;
  email: string;
  errorMessage: string | null;
  isPending: boolean;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreateUserFormUi({
  className,
  email,
  errorMessage,
  isPending,
  name,
  onEmailChange,
  onNameChange,
  onSubmit,
}: CreateUserFormUiProps) {
  return (
    <section className={classNames('create-user-form', className)}>
      <h2 className="create-user-form__title">Create user</h2>
      <form className="create-user-form__form" onSubmit={onSubmit}>
        <label className="create-user-form__field">
          <span className="create-user-form__label">Email</span>
          <input
            className="create-user-form__input"
            name="email"
            onChange={(event) => onEmailChange(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="create-user-form__field">
          <span className="create-user-form__label">Name</span>
          <input
            className="create-user-form__input"
            name="name"
            onChange={(event) => onNameChange(event.target.value)}
            type="text"
            value={name}
          />
        </label>
        {errorMessage ? (
          <p className="create-user-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button className="create-user-form__submit" disabled={isPending} type="submit">
          Create user
        </button>
      </form>
    </section>
  );
}
