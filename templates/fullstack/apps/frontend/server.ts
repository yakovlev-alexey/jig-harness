import { createServer as createHttpServer } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createServer as createViteServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? 5174);
const backendUrl = process.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

function escapeStateScript(state: unknown): string {
  const json = JSON.stringify(state).replace(/</g, '\\u003c').replace(/\//g, '\\/');
  return `<script>window.__APP_STATE__=${json}</script>`;
}

async function createServer() {
  process.env.SSR_API_ORIGIN ??= `http://127.0.0.1:${port}`;

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port,
      proxy: {
        '/api': {
          changeOrigin: true,
          target: backendUrl,
        },
      },
    },
    appType: 'custom',
  });

  const template = readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

  const server = createHttpServer(async (req, res) => {
    vite.middlewares(req, res, async () => {
      if (req.method !== 'GET') {
        res.statusCode = 405;
        res.end();
        return;
      }

      const url = req.url ?? '/';

      if (url.startsWith('/api')) {
        res.statusCode = 404;
        res.end();
        return;
      }

      try {
        const { render } = await vite.ssrLoadModule('/src/entry-server.tsx');
        const { appHtml, dehydratedState } = await render(url);

        const html = template
          .replace('<!--ssr-outlet-->', appHtml)
          .replace('<!--ssr-state-->', escapeStateScript(dehydratedState));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(html);
      } catch (error) {
        vite.ssrFixStacktrace(error as Error);
        res.statusCode = 500;
        res.end(String(error));
      }
    });
  });

  server.listen(port, () => {
    console.log(`Frontend SSR dev server listening on http://localhost:${port}`);
  });
}

void createServer();
