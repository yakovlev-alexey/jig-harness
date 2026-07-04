import {
  createUserBodySchema,
  userResponseSchema,
  usersListResponseSchema,
  type UserResponse,
} from '@app/types/slices/users/user-contracts';
import { http, HttpResponse } from 'msw';

const sampleTimestamp = '2026-01-01T00:00:00.000Z';

export function createSampleUser(overrides: Partial<UserResponse> = {}): UserResponse {
  return userResponseSchema.parse({
    id: 'user-1',
    email: 'alice@example.com',
    name: 'Alice',
    createdAt: sampleTimestamp,
    updatedAt: sampleTimestamp,
    ...overrides,
  });
}

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(usersListResponseSchema.parse([]));
  }),
  http.post('/api/users', async ({ request }) => {
    const body = createUserBodySchema.parse(await request.json());

    return HttpResponse.json(
      createSampleUser({
        email: body.email,
        id: 'user-created',
        name: body.name ?? null,
      }),
      { status: 201 },
    );
  }),
];
