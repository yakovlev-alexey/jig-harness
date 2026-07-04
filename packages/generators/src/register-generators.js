import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = dirname(fileURLToPath(import.meta.url));

/**
 * Register jig code generators on a Plop instance.
 * @param {import('@turbo/gen').PlopTypes.NodePlopAPI} plop
 * @param {{ templatesDir?: string }} [options]
 */
export function registerGenerators(plop, options = {}) {
  const templatesDir = options.templatesDir ?? join(packageRoot, '../templates');

  plop.setHelper('blockClass', (name) => {
    return String(name).replace(/-/g, '-');
  });

  plop.setHelper('pascalCase', (text) => {
    return String(text)
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  });

  plop.setGenerator('component', {
    description: 'Create a presentational component in a product slice',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. landing, profile)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Component name in kebab-case (e.g. hero-banner)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) ? true : 'Use lowercase kebab-case (fe-kebab-case)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/components/{{name}}/{{name}}.tsx',
        templateFile: join(templatesDir, 'component/component.tsx.hbs'),
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/components/{{name}}/{{name}}.css',
        templateFile: join(templatesDir, 'component/component.css.hbs'),
      },
    ],
  });

  plop.setGenerator('widget', {
    description: 'Create a widget with colocated presentational UI in a product slice',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. landing, profile)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Widget name in kebab-case (e.g. profile-stats)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) ? true : 'Use lowercase kebab-case (fe-kebab-case)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/widgets/{{name}}/{{name}}.tsx',
        templateFile: join(templatesDir, 'widget/widget-ui.tsx.hbs'),
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/widgets/{{name}}/{{name}}.css',
        templateFile: join(templatesDir, 'widget/widget.css.hbs'),
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/widgets/{{name}}/{{name}}.widget.tsx',
        templateFile: join(templatesDir, 'widget/widget.tsx.hbs'),
      },
    ],
  });
}
