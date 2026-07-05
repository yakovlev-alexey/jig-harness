import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { classNames } from '@/common/utils/class-names';
import {
  UserAlreadyExistsError,
  createUserCommand,
} from '../../store/commands/create-user-command';
import { usersQueryKey } from '../../store/queries/users-query';
import './create-user-form.css';

type CreateUserFormUiProps = {
  className?: string;
};

export function CreateUserFormUi({ className }: CreateUserFormUiProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createUserMutation = useMutation({
    mutationFn: createUserCommand,
    onSuccess: async () => {
      setEmail('');
      setName('');
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: usersQueryKey });
    },
    onError: (error) => {
      if (error instanceof UserAlreadyExistsError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage('Failed to create user.');
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    createUserMutation.mutate({
      email,
      name: name.trim() === '' ? undefined : name.trim(),
    });
  };

  return (
    <section className={classNames('create-user-form', className)}>
      <h2 className="create-user-form__title">Create user</h2>
      <form className="create-user-form__form" onSubmit={handleSubmit}>
        <label className="create-user-form__field">
          <span className="create-user-form__label">Email</span>
          <input
            className="create-user-form__input"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
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
            onChange={(event) => setName(event.target.value)}
            type="text"
            value={name}
          />
        </label>
        {errorMessage ? (
          <p className="create-user-form__error" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <button
          className="create-user-form__submit"
          disabled={createUserMutation.isPending}
          type="submit"
        >
          Create user
        </button>
      </form>
    </section>
  );
}
