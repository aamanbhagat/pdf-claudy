"use strict";

/**
 * Patra convert service — the server-only document conversions that can't run
 * in the browser. One small Express API that shells out to the right tool:
 *   LibreOffice (office <-> pdf), Ghostscript (pdf/a), qpdf (repair),
 *   Chromium headless (html/url -> pdf).
 *
 * Auth: every /convert request needs `Authorization: Bearer <CONVERT_TOKEN>`.
 * Files are processed in a per-request temp dir that is always cleaned up.
 */

const express = require("express");
const multer = require("multer");
const { execFile } = require("node:child_process");
const { randomUUID } = require("node:crypto");
const fs = require("node:fs/promises");
const fssync = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = Number(process.env.PORT || 8090);
const TOKEN = process.env.CONVERT_TOKEN || "";
const MAX_BYTES = Number(process.env.MAX_BYTES || 60 * 1024 * 1024); // 60 MB
const JOB_TIMEOUT = Number(process.env.JOB_TIMEOUT_MS || 150_000);
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY || 2);

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: MAX_BYTES } });
const app = express();
app.disable("x-powered-by");

/* ---------- tiny concurrency gate (LibreOffice/Chromium are heavy) ---------- */
let active = 0;
const waiters = [];
function acquire() {
  if (active < MAX_CONCURRENCY) {
    active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiters.push(resolve));
}
function release() {
  active--;
  const next = waiters.shift();
  if (next) {
    active++;
    next();
  }
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout: JOB_TIMEOUT, maxBuffer: 1 << 24, ...opts }, (err, stdout, stderr) => {
      if (err) {
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/* ---------- conversion ops ---------- */
// Each op: input -> a file in `dir`. Returns { outPath, ext, mime, name }.
const PDF = "application/pdf";
const MIME = {
  pdf: PDF,
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

async function libreConvert(dir, input, target /* e.g. 'pdf' or 'docx:"MS Word 2007 XML"' */, outExt) {
  const profile = path.join(dir, "lo-profile");
  await run("soffice", [
    "--headless",
    "--norestore",
    "--invisible",
    "--nodefault",
    "--nologo",
    "--nofirststartwizard",
    "--nolockcheck",
    `-env:UserInstallation=file://${profile}`,
    "--convert-to",
    target,
    "--outdir",
    dir,
    input,
  ], { env: { ...process.env, HOME: dir } });
  const base = path.basename(input, path.extname(input));
  const outPath = path.join(dir, `${base}.${outExt}`);
  if (!fssync.existsSync(outPath)) {
    // LibreOffice occasionally lowercases / changes the name — find the produced file.
    const produced = (await fs.readdir(dir)).find((f) => f.toLowerCase().endsWith(`.${outExt}`) && !f.startsWith("lo-profile"));
    if (!produced) throw new Error(`LibreOffice produced no .${outExt} output`);
    return path.join(dir, produced);
  }
  return outPath;
}

const OPS = {
  "word-to-pdf": (dir, input) => libreConvert(dir, input, "pdf", "pdf").then((p) => ({ outPath: p, ext: "pdf" })),
  "powerpoint-to-pdf": (dir, input) => libreConvert(dir, input, "pdf", "pdf").then((p) => ({ outPath: p, ext: "pdf" })),
  "excel-to-pdf": (dir, input) => libreConvert(dir, input, "pdf", "pdf").then((p) => ({ outPath: p, ext: "pdf" })),

  // LibreOffice opens a PDF as a Draw doc, which has no export path to Word —
  // pdf2docx reconstructs real text + layout into a .docx instead.
  "pdf-to-word": async (dir, input) => {
    const out = path.join(dir, "out.docx");
    await run("python3", ["-c", `from pdf2docx import Converter; c=Converter(${JSON.stringify(input)}); c.convert(${JSON.stringify(out)}); c.close()`], {
      env: { ...process.env, HOME: dir },
    });
    return { outPath: out, ext: "docx" };
  },
  // pdf-to-powerpoint and pdf-to-excel: no reliable engine here yet (deferred).

  "pdf-to-pdfa": async (dir, input) => {
    const out = path.join(dir, "out.pdf");
    await run("gs", [
      "-dPDFA=2",
      "-dBATCH",
      "-dNOPAUSE",
      "-dNOOUTERSAVE",
      "-sColorConversionStrategy=RGB",
      "-sDEVICE=pdfwrite",
      "-dPDFACompliance=2",
      "-dAutoRotatePages=/None",
      `-sOutputFile=${out}`,
      input,
    ]);
    return { outPath: out, ext: "pdf" };
  },

  "repair-pdf": async (dir, input) => {
    const out = path.join(dir, "out.pdf");
    try {
      await run("qpdf", ["--no-warn", "--replace-input", input]); // repairs in place
      await fs.copyFile(input, out);
      return { outPath: out, ext: "pdf" };
    } catch {
      // qpdf couldn't fix it — rewrite the page stream with Ghostscript.
      await run("gs", ["-o", out, "-sDEVICE=pdfwrite", "-dPDFSETTINGS=/prepress", input]);
      return { outPath: out, ext: "pdf" };
    }
  },

  "html-to-pdf": async (dir, input, { url }) => {
    const out = path.join(dir, "out.pdf");
    const source = url || `file://${input}`;
    await run("chromium", [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--hide-scrollbars",
      "--no-pdf-header-footer",
      "--virtual-time-budget=12000",
      "--run-all-compositor-stages-before-draw",
      `--print-to-pdf=${out}`,
      source,
    ], { env: { ...process.env, HOME: dir } });
    return { outPath: out, ext: "pdf" };
  },
};

/* ---------- routes ---------- */
app.get("/health", (_req, res) => {
  res.json({ ok: true, ops: Object.keys(OPS), maxBytes: MAX_BYTES });
});

function authed(req, res, next) {
  const header = req.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!TOKEN || token !== TOKEN) return res.status(401).json({ error: "Unauthorized" });
  next();
}

app.post("/convert/:op", authed, upload.single("file"), async (req, res) => {
  const op = req.params.op;
  const handler = OPS[op];
  if (!handler) return res.status(404).json({ error: `Unknown op: ${op}` });

  const url = (req.body && req.body.url) || "";
  if (!req.file && !url) return res.status(400).json({ error: "No file or url provided" });

  const dir = path.join(os.tmpdir(), `job-${randomUUID()}`);
  await fs.mkdir(dir, { recursive: true });
  let inputPath = null;
  if (req.file) {
    // keep the original extension so LibreOffice/Chromium detect the format
    const ext = path.extname(req.file.originalname || "") || "";
    inputPath = path.join(dir, `input${ext}`);
    await fs.rename(req.file.path, inputPath);
  }

  await acquire();
  try {
    const { outPath, ext } = await handler(dir, inputPath, { url });
    const data = await fs.readFile(outPath);
    const base = (req.file?.originalname || "document").replace(/\.[^.]+$/, "");
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${base}.${ext}"`);
    res.send(data);
  } catch (err) {
    console.error(`[${op}] failed:`, err.message, err.stderr || "");
    res.status(500).json({ error: "Conversion failed", op, detail: String(err.stderr || err.message).slice(0, 500) });
  } finally {
    release();
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
    if (req.file?.path) fs.rm(req.file.path, { force: true }).catch(() => {});
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: "File too large" });
  res.status(500).json({ error: "Server error" });
});

app.listen(PORT, "0.0.0.0", () => console.log(`convert service listening on :${PORT}`));
