import type { preHandlerHookHandler } from 'fastify';

export const requireTestToken: preHandlerHookHandler = async (request, reply) => {
  const token = request.headers['x-test-token'];
  const expected = process.env.TEST_ROUTES_TOKEN;

  if (!expected || token !== expected) {
    return reply.code(403).send({ message: 'Forbidden' });
  }
};
