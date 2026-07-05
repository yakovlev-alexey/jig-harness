import { test as testBase, expect } from '@playwright/test';
import { defineNetworkFixture, type NetworkFixture } from '@msw/playwright';
import { type AnyHandler } from 'msw';
import { handlers as defaultHandlers } from './mocks/handlers';

type Fixtures = {
  handlers: Array<AnyHandler>;
  network: NetworkFixture;
};

export const test = testBase.extend<Fixtures>({
  handlers: [defaultHandlers, { option: true }],
  network: [
    async ({ context, handlers }, use) => {
      const network = defineNetworkFixture({
        context,
        handlers: [...handlers],
      });

      await network.enable();
      await use(network);
      await network.disable();
    },
    { auto: true },
  ],
});

export { expect };
