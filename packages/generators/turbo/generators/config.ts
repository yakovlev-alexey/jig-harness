import type { PlopTypes } from '@turbo/gen';
import { registerGenerators } from '@jig-harness/generators/register-generators';

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  registerGenerators(plop);
}
