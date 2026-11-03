# syntax=docker/dockerfile:1
# ============================================================
#  Gatilin Digital - Aplicación única (web + API) en el puerto 3000
#  Base Directory en Coolify: /   (raíz del repositorio)
#
#  - Etapa web:  compila el frontend Next.js como export estático (out/)
#  - Etapa api:  instala las dependencias de producción del backend
#  - Runner:     Express sirve /api, /uploads, /share y la web, mismo dominio
# ============================================================

ARG NODE_VERSION=22-alpine

# ---------- 1) Frontend (Next.js export estático) ----------
FROM node:${NODE_VERSION} AS web
WORKDIR /web
RUN apk add --no-cache libc6-compat
COPY fe-gatilin-digital_2/package.json fe-gatilin-digital_2/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY fe-gatilin-digital_2/ ./

# URL pública (metadatos / Open Graph). En Coolify marca APP_URL como "Build Variable".
ARG APP_URL
# La API vive en el mismo dominio: rutas relativas (/api/...). Vacía a propósito
# para ignorar cualquier NEXT_PUBLIC_API_BASE_URL antigua.
ENV NEXT_PUBLIC_API_BASE_URL="" \
    NEXT_PUBLIC_SITE_URL=${APP_URL} \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
RUN npm run build

# ---------- 2) Dependencias de producción del backend ----------
FROM node:${NODE_VERSION} AS api-deps
WORKDIR /app
COPY be-gatilin-digital_2/package.json be-gatilin-digital_2/package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# ---------- 3) Runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    FRONTEND_DIR=/app/web

# curl: healthcheck de Coolify · fuentes: texto de las imágenes de la demo (sharp/SVG)
RUN apk add --no-cache curl fontconfig ttf-dejavu \
 && addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=api-deps /app/node_modules ./node_modules
COPY be-gatilin-digital_2/ ./
COPY --from=web /web/out ./web

# Carpetas de subidas (montar /app/public/uploads como volumen persistente)
RUN mkdir -p public/uploads/cofrades public/uploads/reportes public/uploads/cuadrillas \
 && chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

# Forma exec: node es el PID 1 y recibe SIGTERM (cierre limpio del servidor y de Knex)
CMD ["node", "server.js"]
