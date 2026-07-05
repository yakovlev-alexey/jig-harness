/** @param {import('eslint').SourceCode} sourceCode */
function getLineRange(sourceCode, lineNumber) {
  const lineStart = sourceCode.getIndexFromLoc({ line: lineNumber, column: 0 });
  const lineEnd =
    lineNumber < sourceCode.lines.length
      ? sourceCode.getIndexFromLoc({ line: lineNumber + 1, column: 0 })
      : sourceCode.text.length;

  return { lineStart, lineEnd };
}

/** @param {import('eslint').SourceCode} sourceCode */
function isCommentOnlyLine(sourceCode, lineNumber) {
  const lineText = sourceCode.lines[lineNumber - 1] ?? '';
  if (lineText.trim() === '') {
    return true;
  }

  const { lineStart, lineEnd } = getLineRange(sourceCode, lineNumber);
  const commentsOnLine = sourceCode
    .getAllComments()
    .filter((comment) => comment.loc.start.line <= lineNumber && comment.loc.end.line >= lineNumber)
    .sort((left, right) => left.range[0] - right.range[0]);

  if (commentsOnLine.length === 0) {
    return false;
  }

  let nonCommentText = '';
  let lastIndex = lineStart;

  for (const comment of commentsOnLine) {
    const commentStart = Math.max(comment.range[0], lineStart);
    const commentEnd = Math.min(comment.range[1], lineEnd);

    if (commentStart > lastIndex) {
      nonCommentText += sourceCode.text.slice(lastIndex, commentStart);
    }

    lastIndex = Math.max(lastIndex, commentEnd);
  }

  if (lastIndex < lineEnd) {
    nonCommentText += sourceCode.text.slice(lastIndex, lineEnd);
  }

  return nonCommentText.trim() === '';
}

/** @param {import('eslint').SourceCode} sourceCode */
function countLines(sourceCode, startLine, endLine) {
  let count = 0;
  for (let line = startLine; line <= endLine; line++) {
    if (isCommentOnlyLine(sourceCode, line)) {
      continue;
    }
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
