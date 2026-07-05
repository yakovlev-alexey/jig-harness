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

  plop.setGenerator('page', {
    description: 'Create a TanStack Router route file in src/routes/',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Route name in kebab-case (e.g. dashboard, settings)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) ? true : 'Use lowercase kebab-case (fe-kebab-case)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/routes/{{name}}.tsx',
        templateFile: join(templatesDir, 'page/page.tsx.hbs'),
      },
      {
        type: 'add',
        path: 'src/routes/{{name}}.css',
        templateFile: join(templatesDir, 'page/page.css.hbs'),
      },
    ],
  });

  plop.setGenerator('slice', {
    description: 'Create frontend slice layer folders under src/slices/<slice>/',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. landing, profile)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/components/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/widgets/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/store/model/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/store/selectors/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/store/queries/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/store/commands/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/utils/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/constants/.gitkeep',
        template: '',
      },
    ],
  });

  plop.setGenerator('backend-slice', {
    description: 'Create backend slice layer folders under src/slices/<slice>/',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. users, billing)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/domain/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/usecases/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/commands/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/queries/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/endpoints/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/plugins/.gitkeep',
        template: '',
      },
      {
        type: 'add',
        path: 'src/slices/{{slice}}/schemas/.gitkeep',
        template: '',
      },
    ],
  });

  plop.setGenerator('endpoint', {
    description: 'Create a Fastify endpoint file in a backend slice',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. users)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Endpoint name in kebab-case (e.g. create-user)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) ? true : 'Use lowercase kebab-case (be-kebab-case)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/endpoints/{{name}}-endpoint.ts',
        templateFile: join(templatesDir, 'backend/endpoint.ts.hbs'),
      },
    ],
  });

  plop.setGenerator('usecase', {
    description: 'Create a usecase file in a backend slice',
    prompts: [
      {
        type: 'input',
        name: 'slice',
        message: 'Slice name (e.g. users)',
        validate: (value) => (value ? true : 'Slice name is required'),
      },
      {
        type: 'input',
        name: 'name',
        message: 'Usecase name in kebab-case (e.g. create-user)',
        validate: (value) =>
          /^[a-z][a-z0-9-]*$/.test(value) ? true : 'Use lowercase kebab-case (be-kebab-case)',
      },
    ],
    actions: [
      {
        type: 'add',
        path: 'src/slices/{{slice}}/usecases/{{name}}-usecase.ts',
        templateFile: join(templatesDir, 'backend/usecase.ts.hbs'),
      },
    ],
  });
}
