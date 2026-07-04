import { randomUUID } from 'node:crypto';

/** One id per Playwright process; shared across workers in the same run. */
export const runId = process.env.E2E_RUN_ID ?? randomUUID().slice(0, 8);

export function buildNamespace(workerIndex: number): string {
  return `e2e-${runId}-${workerIndex}-${randomUUID()}`;
}

export function namespacedEmail(namespace: string, label: string): string {
  return `${namespace}+${label}@e2e.test`;
}
