const HOOK_NAME_PATTERN = /^use[A-Z]/;
const HOOK_FILENAME_PATTERN = /^use-[a-z0-9-]+\.(ts|tsx)$/;

/** @param {string | undefined | null} name */
function isHookExportName(name) {
  return typeof name === 'string' && HOOK_NAME_PATTERN.test(name);
}

/** @param {string} filename */
function basename(filename) {
  const normalized = filename.replace(/\\/g, '/');
  return normalized.slice(normalized.lastIndexOf('/') + 1);
}

/** @type {import('eslint').Rule.RuleModule} */
export const hookFileNaming = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Hook modules must be named use-*.{ts,tsx} and export at most one hook',
    },
    schema: [],
    messages: {
      wrongFilename:
        'Hook exports require a `use-*.ts` or `use-*.tsx` filename (fe-hook-file-naming). Colocate beside the widget/component; promote to `common/` only on reuse.',
      multipleHooks:
        'Export at most one hook per file (fe-hook-file-naming). Split additional hooks into separate `use-*.ts` files.',
    },
  },
  create(context) {
    /** @type {Set<string>} */
    const exportedHooks = new Set();

    function trackHook(name) {
      if (isHookExportName(name)) {
        exportedHooks.add(name);
      }
    }

    return {
      ExportNamedDeclaration(node) {
        if (node.declaration) {
          if (node.declaration.type === 'FunctionDeclaration' && node.declaration.id) {
            trackHook(node.declaration.id.name);
          }
          if (node.declaration.type === 'VariableDeclaration') {
            for (const declarator of node.declaration.declarations) {
              if (declarator.id.type === 'Identifier') {
                trackHook(declarator.id.name);
              }
            }
          }
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ExportSpecifier' && specifier.exported.type === 'Identifier') {
            trackHook(specifier.exported.name);
          }
        }
      },
      ExportDefaultDeclaration(node) {
        if (
          node.declaration.type === 'FunctionDeclaration' &&
          node.declaration.id &&
          isHookExportName(node.declaration.id.name)
        ) {
          trackHook(node.declaration.id.name);
        }
      },
      'Program:exit'() {
        if (exportedHooks.size === 0) {
          return;
        }

        const file = basename(context.filename);
        if (!HOOK_FILENAME_PATTERN.test(file)) {
          context.report({
            node: context.sourceCode.ast,
            messageId: 'wrongFilename',
          });
        }

        if (exportedHooks.size > 1) {
          context.report({
            node: context.sourceCode.ast,
            messageId: 'multipleHooks',
          });
        }
      },
    };
  },
};
