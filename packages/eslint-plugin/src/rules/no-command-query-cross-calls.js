/** @type {import('eslint').Rule.RuleModule} */
export const noCommandQueryCrossCalls = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow commands importing queries and queries importing commands',
    },
    schema: [],
    messages: {
      commandImportsQuery:
        'Commands must not import queries. Compose them in a usecase (be-no-command-query-cross-calls).',
      queryImportsCommand:
        'Queries must not import commands. Compose them in a usecase (be-no-command-query-cross-calls).',
    },
  },
  create(context) {
    const filename = context.filename.replace(/\\/g, '/');
    const isCommand = /\/commands\//.test(filename);
    const isQuery = /\/queries\//.test(filename);

    if (!isCommand && !isQuery) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;

        if (isCommand && (source.includes('/queries/') || source.includes('../queries/'))) {
          context.report({ node, messageId: 'commandImportsQuery' });
        }

        if (isQuery && (source.includes('/commands/') || source.includes('../commands/'))) {
          context.report({ node, messageId: 'queryImportsCommand' });
        }
      },
    };
  },
};
