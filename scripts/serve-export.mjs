#!/usr/bin/env node
import { createReadStream, promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index === -1 ? fallback : args[index + 1];
}
const root = path.resolve(option("--dir", path.join(scriptDirectory, "..", "out")));
const port = Number(option("--port", process.env.PORT ?? 3100));
const host = option("--host", "127.0.0.1");

const mimeTypes = new Map([
  [".avif", "image/avif"], [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"], [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"], [".jpeg", "image/jpeg"], [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"], [".png", "image/png"],
  [".pdf", "application/pdf"], [".svg", "image/svg+xml"], [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"], [".xml", "application/xml; charset=utf-8"],
  [".webp", "image/webp"], [".woff", "font/woff"], [".woff2", "font/woff2"],
]);

function resolveRequestPath(requestUrl) {
  let rawPath;
  let decodedRawPath;
  try {
    rawPath = requestUrl.split(/[?#]/, 1)[0];
    decodedRawPath = decodeURIComponent(rawPath);
  } catch {
    return null;
  }
  if (
    decodedRawPath.includes("\\") ||
    decodedRawPath.includes("\0") ||
    decodedRawPath.split("/").some((segment) => segment === "." || segment === "..")
  ) return null;
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (pathname.includes("\\") || pathname.includes("\0")) return null;
  const target = path.resolve(root, `.${pathname}`);
  return target === root || target.startsWith(`${root}${path.sep}`) ? target : null;
}

async function findFile(target) {
  const candidates = [target];
  if (!path.extname(target)) candidates.push(`${target}.html`, path.join(target, "index.html"));
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return { file: candidate, stat };
      if (stat.isDirectory()) {
        const index = path.join(candidate, "index.html");
        const indexStat = await fs.stat(index);
        if (indexStat.isFile()) return { file: index, stat: indexStat };
      }
    } catch { /* Try the next clean URL candidate. */ }
  }
  return null;
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD", "Content-Length": "0" }).end();
    return;
  }
  const target = resolveRequestPath(request.url ?? "/");
  if (!target) {
    response.writeHead(400, { "Content-Length": "0" }).end();
    return;
  }
  const result = await findFile(target);
  if (!result) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Content-Length": "9" });
    response.end(request.method === "HEAD" ? undefined : "Not Found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": mimeTypes.get(path.extname(result.file).toLowerCase()) ?? "application/octet-stream",
    "Content-Length": result.stat.size,
    "X-Content-Type-Options": "nosniff",
  });
  if (request.method === "HEAD") response.end();
  else createReadStream(result.file).pipe(response);
});

server.listen(port, host, () => {
  process.stdout.write(`Serving ${root} at http://${host}:${port}\n`);
});
