/**
 * Dev-only flat-file REST mock (json-server) exposed at `/api`.
 *
 * json-server is Express-based and does not run safely as Connect middleware on
 * Vite's HTTPS/HTTP2 server. We listen on loopback HTTP/1.1 and bridge `/api`
 * with fetch so the app still talks same-origin `/api` under one `vite` process.
 *
 * Delete this folder + the plugin import when the real backend replaces it.
 */
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import type { Plugin, Connect } from "vite";
import type { IncomingMessage, RequestListener } from "node:http";

const require = createRequire(import.meta.url);
const jsonServer = require("json-server") as {
  create: () => RequestListener & { use: (...handlers: unknown[]) => void };
  router: (source: string) => unknown;
};

const mockRoot = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(mockRoot, "db.json");

async function readBody(req: IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/** Loopback json-server over `db.json` — used by the Vite plugin and by `api.test.ts`. */
export function startMockServer(): Promise<{
  origin: string;
  close: () => Promise<void>;
}> {
  const app = jsonServer.create();
  app.use(jsonServer.router(dbPath));

  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      if (!addr || typeof addr === "string") {
        reject(new Error("mock API failed to bind a TCP port"));
        return;
      }
      resolve({
        origin: `http://127.0.0.1:${addr.port}`,
        close: () =>
          new Promise((res, rej) => {
            server.close((err) => (err ? rej(err) : res()));
          }),
      });
    });
    server.on("error", reject);
  });
}

function bridgeToMock(origin: string): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = req.url ?? "";
    if (url !== "/api" && !url.startsWith("/api/") && !url.startsWith("/api?")) {
      next();
      return;
    }

    const pathAndQuery = url.replace(/^\/api/, "") || "/";
    const method = req.method ?? "GET";

    void (async () => {
      try {
        const body =
          method === "GET" || method === "HEAD" ? undefined : new Uint8Array(await readBody(req));

        const upstream = await fetch(new URL(pathAndQuery, origin), {
          method,
          headers: {
            accept: req.headers.accept ?? "application/json",
            "content-type": req.headers["content-type"] ?? "application/json",
          },
          body,
        });

        res.statusCode = upstream.status;
        const contentType = upstream.headers.get("content-type");
        if (contentType) res.setHeader("content-type", contentType);
        res.end(Buffer.from(await upstream.arrayBuffer()));
      } catch (err) {
        next(err);
      }
    })();
  };
}

/** Vite plugin: `/api/*` → in-process json-server over `mock/db.json`. */
export function mockApiPlugin(): Plugin {
  return {
    name: "abcd-mock-api",
    async configureServer(server) {
      const mock = await startMockServer();
      server.middlewares.use(bridgeToMock(mock.origin));
      const prevClose = server.close.bind(server);
      server.close = async () => {
        await mock.close();
        return prevClose();
      };
    },
    async configurePreviewServer(server) {
      const mock = await startMockServer();
      server.middlewares.use(bridgeToMock(mock.origin));
    },
  };
}
