import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { buildApp } from '../../../common/build-app.js';

describe('POST /users validation', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 for an invalid email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'not-an-email',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      message: 'Validation error',
    });
  });
});
