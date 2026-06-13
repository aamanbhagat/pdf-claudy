# Patra convert service: Node API + the heavy CLI converters.
# Debian base (not Ubuntu) so `chromium` installs as a real apt package, not a snap.
FROM node:20-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production \
    HOME=/tmp

# LibreOffice (office <-> pdf), Ghostscript (pdf/a), qpdf (repair), Chromium (html -> pdf),
# a JRE for LibreOffice's MS export filters, and a reasonable font set for faithful output.
RUN apt-get update && apt-get install -y --no-install-recommends \
      libreoffice-writer \
      libreoffice-calc \
      libreoffice-impress \
      libreoffice-core \
      default-jre-headless \
      ghostscript \
      qpdf \
      chromium \
      python3 \
      python3-pip \
      fonts-liberation \
      fonts-dejavu \
      fonts-noto-core \
      fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

# Python converters LibreOffice can't do: pdf2docx (-> Word),
# python-pptx + PyMuPDF (-> PowerPoint), pdfplumber + openpyxl (-> Excel).
RUN pip3 install --no-cache-dir --break-system-packages \
      pdf2docx \
      python-pptx \
      pdfplumber \
      openpyxl

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server.js pdf_to_pptx.py pdf_to_xlsx.py ./

EXPOSE 8090
CMD ["node", "server.js"]
