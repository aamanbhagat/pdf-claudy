# Patra convert service

A small Dockerized REST API for the document conversions that can't run in the
browser. The Next.js app proxies to it from `/api/convert/[op]` (the service is
never called directly by the browser, and the bearer token stays server-side).

## Engines

| Op | Tool |
| --- | --- |
| `word-to-pdf`, `powerpoint-to-pdf`, `excel-to-pdf` | LibreOffice headless |
| `pdf-to-word` | pdf2docx (LibreOffice can't export a PDF to docx) |
| `pdf-to-powerpoint` | PyMuPDF render + python-pptx (one image slide per page) |
| `pdf-to-excel` | pdfplumber table extraction + openpyxl (text-line fallback) |
| `pdf-to-pdfa` | Ghostscript |
| `repair-pdf` | qpdf, with a Ghostscript rewrite fallback |
| `html-to-pdf` | Chromium headless (`--print-to-pdf`) |

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

## TLS (Caddy + sslip.io)

Caddy fronts the service with automatic HTTPS. `Caddyfile` is deployed to
`/etc/caddy/Caddyfile`; it terminates TLS for `104-214-176-55.sslip.io`
(sslip.io maps the dashed IP to the host, so no domain is needed) and reverse
proxies to the container on `127.0.0.1:8090`. Needs inbound TCP **80 + 443**.

```bash
sudo cp Caddyfile /etc/caddy/Caddyfile && sudo systemctl reload caddy
curl https://104-214-176-55.sslip.io/health
```

`CONVERT_SERVICE_URL` should be `https://104-214-176-55.sslip.io`. Once that's in
use everywhere, the public `8090` port can be closed and the container rebound to
`127.0.0.1` (so only Caddy can reach it).

## Notes / follow-ups

- Vercel caps a serverless request body at ~4.5 MB; very large uploads would need
  a direct browser→VPS upload path (now possible since the VPS has real TLS).
