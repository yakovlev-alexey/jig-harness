import {
  createUserBodySchema,
  userResponseSchema,
  usersListResponseSchema,
  type UserResponse,
} from '@app/types/slices/users/user-contracts';
import { http, HttpResponse } from 'msw';
import { createSampleUser } from './mocks/handlers';
import { expect, test } from './fixtures';

const sampleTimestamp = '2026-01-01T00:00:00.000Z';

test('shows empty state when there are no users', async ({ network, page }) => {
  await network.use(
    http.get('/api/users', () => {
      return HttpResponse.json(usersListResponseSchema.parse([]));
    }),
  );

  await page.goto('/users');
  await expect(page.getByText('No users yet')).toBeVisible();
});

test('shows users returned by the API', async ({ network, page }) => {
  const users: UserResponse[] = [
    createSampleUser({ id: 'user-1', email: 'alice@example.com', name: 'Alice' }),
    createSampleUser({ id: 'user-2', email: 'bob@example.com', name: null }),
  ];

  await network.use(
    http.get('/api/users', () => {
      return HttpResponse.json(usersListResponseSchema.parse(users));
    }),
  );

  await page.goto('/users');
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  await expect(page.getByText('bob@example.com')).toBeVisible();
});

test('adds a user after successful POST', async ({ network, page }) => {
  let users: UserResponse[] = [];

  await network.use(
    http.get('/api/users', () => {
      return HttpResponse.json(usersListResponseSchema.parse(users));
    }),
    http.post('/api/users', async ({ request }) => {
      const body = createUserBodySchema.parse(await request.json());
      const createdUser = userResponseSchema.parse({
        id: 'user-created',
        email: body.email,
        name: body.name ?? null,
        createdAt: sampleTimestamp,
        updatedAt: sampleTimestamp,
      });

      users = [createdUser];

      return HttpResponse.json(createdUser, { status: 201 });
    }),
  );

  await page.goto('/users');
  await page.getByLabel('Email').fill('new@example.com');
  await page.getByLabel('Name').fill('New User');
  await page.getByRole('button', { name: 'Create user' }).click();

  await expect(page.getByText('New User')).toBeVisible();
  await expect(page.getByText('new@example.com')).toBeVisible();
});

test('shows an error when POST returns 409', async ({ network, page }) => {
  await network.use(
    http.get('/api/users', () => {
      return HttpResponse.json(usersListResponseSchema.parse([]));
    }),
    http.post('/api/users', () => {
      return HttpResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }),
  );

  await page.goto('/users');
  await page.getByLabel('Email').fill('duplicate@example.com');
  await page.getByRole('button', { name: 'Create user' }).click();

  await expect(page.getByText('User with this email already exists')).toBeVisible();
});

test('filters users by search query', async ({ network, page }) => {
  const users: UserResponse[] = [
    createSampleUser({ id: 'user-1', email: 'alice@example.com', name: 'Alice' }),
    createSampleUser({ id: 'user-2', email: 'bob@example.com', name: 'Bob' }),
  ];

  await network.use(
    http.get('/api/users', () => {
      return HttpResponse.json(usersListResponseSchema.parse(users));
    }),
  );

  await page.goto('/users');
  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  await expect(page.getByText('Bob', { exact: true })).toBeVisible();

  await page.getByLabel('Filter users').fill('alice');

  await expect(page.getByText('Alice', { exact: true })).toBeVisible();
  await expect(page.getByText('Bob', { exact: true })).not.toBeVisible();
});
