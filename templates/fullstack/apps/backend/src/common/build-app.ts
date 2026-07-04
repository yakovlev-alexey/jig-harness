import Fastify, { type FastifyBaseLogger } from 'fastify';
import { ZodError } from 'zod';

import { UserAlreadyExistsError } from '../slices/users/domain/user-already-exists-error.js';
import { registerSlicePlugins } from './register-slices.js';

type BuildAppOptions = {
  logger?: boolean | FastifyBaseLogger;
};

function isZodError(error: unknown): error is ZodError {
  return (
    error instanceof ZodError ||
    (typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'ZodError' &&
      'issues' in error)
  );
}

export async function buildApp({ logger = true }: BuildAppOptions = {}) {
  const app = Fastify({ logger });

  app.setErrorHandler((error, request, reply) => {
    if (isZodError(error)) {
      return reply.code(400).send({
        message: 'Validation error',
        issues: error.issues,
      });
    }

    if (error instanceof UserAlreadyExistsError) {
      return reply.code(409).send({
        message: error.message,
      });
    }

    request.log.error(error);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  await registerSlicePlugins(app);

  return app;
}
