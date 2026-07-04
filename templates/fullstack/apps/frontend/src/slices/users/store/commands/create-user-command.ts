import {
  createUserBodySchema,
  userResponseSchema,
  type CreateUserBody,
  type UserResponse,
} from '@app/types/slices/users/user-contracts';
import { apiUrl } from '@/common/api-url';

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('User with this email already exists');
    this.name = 'UserAlreadyExistsError';
  }
}

export class CreateUserError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'CreateUserError';
    this.status = status;
  }
}

export async function createUserCommand(body: CreateUserBody): Promise<UserResponse> {
  const payload = createUserBodySchema.parse(body);

  const response = await fetch(`${apiUrl}/users`, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (response.status === 409) {
    throw new UserAlreadyExistsError();
  }

  if (!response.ok) {
    throw new CreateUserError(response.status, `Failed to create user (${response.status})`);
  }

  return userResponseSchema.parse(await response.json());
}
