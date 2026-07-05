import { noReexportOnly } from './rules/no-reexport-only.js';
import { noCommandQueryCrossCalls } from './rules/no-command-query-cross-calls.js';
import { domainNoIo } from './rules/domain-no-io.js';
import { decompositionBudget } from './rules/decomposition-budget.js';
import { hookFileNaming } from './rules/hook-file-naming.js';

export const rules = {
  'no-reexport-only': noReexportOnly,
  'no-command-query-cross-calls': noCommandQueryCrossCalls,
  'domain-no-io': domainNoIo,
  'decomposition-budget': decompositionBudget,
  'hook-file-naming': hookFileNaming,
};

export default { rules };
