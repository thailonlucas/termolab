/**
 * TermoLab Track — HTTPS dev server (Bun)
 * Serves static files over HTTPS so getUserMedia works on mobile.
 */
const path = require("path");
const fs   = require("fs");

const ROOT = path.join(import.meta.dir);
const PORT = 5500;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
  ".css":  "text/css",
};

Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",

  tls: {
    key:  Bun.file(path.join(ROOT, ".cert/key.pem")),
    cert: Bun.file(path.join(ROOT, ".cert/cert.pem")),
  },

  fetch(req) {
    const url      = new URL(req.url);
    let   pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filepath = path.join(ROOT, pathname);

    if (!fs.existsSync(filepath)) {
      return new Response("Not found", { status: 404 });
    }

    const ext  = path.extname(filepath);
    const mime = MIME[ext] ?? "application/octet-stream";
    return new Response(Bun.file(filepath), {
      headers: { "Content-Type": mime },
    });
  },
});

console.log(`HTTPS: https://0.0.0.0:${PORT}`);
