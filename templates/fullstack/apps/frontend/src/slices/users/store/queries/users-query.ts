import {
  usersListResponseSchema,
  type UsersListResponse,
} from '@app/types/slices/users/user-contracts';
import { queryOptions } from '@tanstack/react-query';
import { apiUrl } from '@/common/api-url';

export const usersQueryKey = ['users'] as const;

export const usersQuery = () =>
  queryOptions({
    queryKey: usersQueryKey,
    queryFn: async (): Promise<UsersListResponse> => {
      const response = await fetch(`${apiUrl}/users`);

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      return usersListResponseSchema.parse(await response.json());
    },
  });
