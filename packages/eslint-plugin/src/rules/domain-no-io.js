/** @type {import('eslint').Rule.RuleModule} */
const forbiddenSources = ['@prisma/client', 'fastify'];

const forbiddenPathPatterns = [
  /\/common\/prisma(?:-executor)?(?:\.js)?$/,
  /\/prisma(?:-executor)?\.js$/,
];

const forbiddenLayerPatterns = [/\/commands\//, /\/queries\//, /\/endpoints\//, /\/plugins\//];

/** @type {import('eslint').Rule.RuleModule} */
export const domainNoIo = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow IO and infrastructure imports in domain layer files',
    },
    schema: [],
    messages: {
      forbiddenImport:
        'Domain layer must not import {{source}}. Keep domain pure (be-domain-no-io).',
      forbiddenProcessEnv:
        'Domain layer must not read process.env. Keep domain pure (be-domain-no-io).',
    },
  },
  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    if (!/\/domain\//.test(filename)) {
      return {};
    }

    function isForbiddenImport(source) {
      if (forbiddenSources.some((entry) => source === entry || source.startsWith(`${entry}/`))) {
        return true;
      }

      if (forbiddenPathPatterns.some((pattern) => pattern.test(source))) {
        return true;
      }

      if (forbiddenLayerPatterns.some((pattern) => pattern.test(source))) {
        return true;
      }

      return false;
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;

        if (node.importKind === 'type') {
          return;
        }

        if (isForbiddenImport(source)) {
          context.report({
            node,
            messageId: 'forbiddenImport',
            data: { source },
          });
        }
      },
      MemberExpression(node) {
        if (
          node.object.type === 'Identifier' &&
          node.object.name === 'process' &&
          node.property.type === 'Identifier' &&
          node.property.name === 'env'
        ) {
          context.report({ node, messageId: 'forbiddenProcessEnv' });
        }
      },
    };
  },
};
