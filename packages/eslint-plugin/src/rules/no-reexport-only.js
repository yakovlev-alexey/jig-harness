/** @type {import('eslint').Rule.RuleModule} */
export const noReexportOnly = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow modules that contain only re-exports (barrel aliases without index.ts naming)',
    },
    schema: [],
    messages: {
      reexportOnly:
        'Module contains only re-exports. Import concrete files directly instead of barrel aliases (fe-no-reexport).',
    },
  },
  create(context) {
    return {
      Program(node) {
        const body = node.body;
        if (body.length === 0) return;

        const onlyReexports = body.every((statement) => {
          if (statement.type === 'ExportNamedDeclaration' && statement.source) return true;
          if (statement.type === 'ExportAllDeclaration') return true;
          return false;
        });

        if (onlyReexports) {
          context.report({ node, messageId: 'reexportOnly' });
        }
      },
    };
  },
};
