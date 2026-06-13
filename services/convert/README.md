# Patra convert service

A small Dockerized REST API for the document conversions that can't run in the
browser. The Next.js app proxies to it from `/api/convert/[op]` (the service is
never called directly by the browser, and the bearer token stays server-side).

## Engines

| Op | Tool |
| --- | --- |
| `word-to-pdf`, `powerpoint-to-pdf`, `excel-to-pdf` | LibreOffice headless |
| `pdf-to-word` | pdf2docx (LibreOffice can't export a PDF to docx) |
| `pdf-to-pdfa` | Ghostscript |
| `repair-pdf` | qpdf, with a Ghostscript rewrite fallback |
| `html-to-pdf` | Chromium headless (`--print-to-pdf`) |

`pdf-to-powerpoint` and `pdf-to-excel` are intentionally **not** implemented here —
LibreOffice opens a PDF as a Draw document with no clean export path to those
formats. They stay as "coming soon" until a dedicated tool is added (per-slide
image rendering for PPTX, table extraction for XLSX).

## API

```
GET  /health
POST /convert/:op    Authorization: Bearer <CONVERT_TOKEN>
                     multipart/form-data: file=<upload>   (html-to-pdf also accepts url=<...>)
                     -> the converted file (Content-Disposition: attachment)
```

## Deploy (on the VPS)

```bash
cd ~/patra-convert
echo "CONVERT_TOKEN=<token>" > .env       # not committed
docker compose up -d --build
curl -s localhost:8090/health
```

Open the port in the firewall: `sudo ufw allow 8090/tcp`.

## Notes / follow-ups

- Transport between the Next.js server and this service is currently plain HTTP
  protected by a bearer token + firewall. Add a domain + TLS (Caddy/Let's Encrypt)
  to encrypt it and to allow large direct uploads that bypass Vercel's request limit.
- `pdf-to-excel` is genuinely hard; LibreOffice output is rough — treat as best-effort.
