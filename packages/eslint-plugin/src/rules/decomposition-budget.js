/** @param {import('eslint').SourceCode} sourceCode */
function countLines(sourceCode, startLine, endLine) {
  const lines = sourceCode.lines;
  const commentLines = new Set();

  for (const comment of sourceCode.getAllComments()) {
    for (let line = comment.loc.start.line; line <= comment.loc.end.line; line++) {
      commentLines.add(line);
    }
  }

  let count = 0;
  for (let line = startLine; line <= endLine; line++) {
    const text = lines[line - 1] ?? '';
    if (text.trim() === '') continue;
    if (commentLines.has(line)) continue;
    count++;
  }
  return count;
}

/** @type {import('eslint').Rule.RuleModule} */
export const decompositionBudget = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Hard line caps for files and functions with decomposition-flavored messages',
    },
    schema: [
      {
        type: 'object',
        properties: {
          file: { type: 'integer', minimum: 1 },
          function: { type: 'integer', minimum: 1 },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      fileBudget:
        'File exceeds the hard line budget ({{count}}/{{max}}). Split into a sub-component, extract a hook (`use-*.ts`), or move pure logic to `utils/`.',
      functionBudget:
        'Function exceeds the hard line budget ({{count}}/{{max}}). Split into a sub-component, extract a hook (`use-*.ts`), or move pure logic to `utils/`.',
    },
  },
  create(context) {
    const options = context.options[0] ?? {};
    const fileMax = options.file;
    const functionMax = options.function;
    const sourceCode = context.sourceCode;

    const visitors = {};

    if (typeof fileMax === 'number') {
      visitors.Program = (node) => {
        const count = countLines(sourceCode, 1, sourceCode.lines.length);
        if (count > fileMax) {
          context.report({
            node,
            messageId: 'fileBudget',
            data: { count: String(count), max: String(fileMax) },
          });
        }
      };
    }

    if (typeof functionMax === 'number') {
      const functionTypes = [
        'FunctionDeclaration',
        'FunctionExpression',
        'ArrowFunctionExpression',
      ];

      for (const type of functionTypes) {
        visitors[type] = (node) => {
          const count = countLines(sourceCode, node.loc.start.line, node.loc.end.line);
          if (count > functionMax) {
            context.report({
              node,
              messageId: 'functionBudget',
              data: { count: String(count), max: String(functionMax) },
            });
          }
        };
      }
    }

    return visitors;
  },
};
