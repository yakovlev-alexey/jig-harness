import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import {
  UserAlreadyExistsError,
  createUserCommand,
} from '../../store/commands/create-user-command';
import { usersQueryKey } from '../../store/queries/users-query';
import { CreateUserFormUi } from './create-user-form';

type CreateUserFormWidgetProps = {
  className?: string;
};

export function CreateUserFormWidget({ className }: CreateUserFormWidgetProps) {
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
    <CreateUserFormUi
      className={className}
      email={email}
      errorMessage={errorMessage}
      isPending={createUserMutation.isPending}
      name={name}
      onEmailChange={setEmail}
      onNameChange={setName}
      onSubmit={handleSubmit}
    />
  );
}
