import type { FastifyPluginAsync } from 'fastify';
import { createUserBodySchema, userResponseSchema } from '@app/types/slices/users/user-contracts';
import { createUserUsecase } from '../usecases/create-user-usecase.js';

export const createUserEndpoint: FastifyPluginAsync = async (app) => {
  app.post('/users', async (request, reply) => {
    const body = createUserBodySchema.parse(request.body);
    const user = await createUserUsecase(body);

    const response = userResponseSchema.parse({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });

    return reply.code(201).send(response);
  });
};
