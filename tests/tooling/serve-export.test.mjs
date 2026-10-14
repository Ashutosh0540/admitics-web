import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import test from "node:test";

async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test("static export server serves clean URLs and assets, supports HEAD, and blocks traversal", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "admitics-export-"));
  const port = await freePort();
  await mkdir(path.join(directory, "about"));
  await mkdir(path.join(directory, "_next", "static"), { recursive: true });
  await writeFile(path.join(directory, "index.html"), "home page");
  await writeFile(path.join(directory, "about", "index.html"), "about page");
  await writeFile(path.join(directory, "app.js"), "console.log('ok')");
  const outside = `${directory}-outside`;
  await writeFile(outside, "private");
  const child = spawn(
    process.execPath,
    ["scripts/serve-export.mjs", "--dir", directory, "--port", String(port)],
    {
      cwd: new URL("../..", import.meta.url),
      stdio: "ignore",
    },
  );
  t.after(async () => {
    child.kill("SIGTERM");
    await rm(directory, { recursive: true, force: true });
    await rm(outside, { force: true });
  });
  const origin = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await fetch(origin);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  assert.ok(ready, "server should start");

  const home = await fetch(origin);
  assert.equal(await home.text(), "home page");
  const clean = await fetch(`${origin}/about`);
  assert.equal(await clean.text(), "about page");
  const asset = await fetch(`${origin}/app.js`);
  assert.match(asset.headers.get("content-type"), /javascript/);
  assert.equal(await asset.text(), "console.log('ok')");
  const head = await fetch(`${origin}/about`, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), "");
  const missing = await fetch(`${origin}/missing`);
  assert.equal(missing.status, 404);
  assert.equal(await missing.text(), "Not Found");
  const missingHead = await fetch(`${origin}/missing`, { method: "HEAD" });
  assert.equal(missingHead.status, 404);
  assert.equal(await missingHead.text(), "");
  assert.equal(
    (await fetch(`${origin}/%2e%2e%2f${path.basename(outside)}`)).status,
    400,
  );
  const method = await fetch(origin, { method: "POST" });
  assert.equal(method.status, 405);
});
