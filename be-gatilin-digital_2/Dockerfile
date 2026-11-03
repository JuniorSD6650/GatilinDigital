# syntax=docker/dockerfile:1
# ============================================================
#  Gatilin Digital - Backend (Express + Knex + MySQL)
#  Base Directory en Coolify: /be-gatilin-digital_2
# ============================================================

ARG NODE_VERSION=22-alpine

# ---------- 1) Dependencias de producción ----------
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Sin devDependencies (jest, supertest). sharp instala su binario linuxmusl.
RUN npm ci --omit=dev --no-audit --no-fund

# ---------- 2) Runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=5000

# curl: healthcheck de Coolify · fuentes: texto de las imágenes de la demo (sharp/SVG)
RUN apk add --no-cache curl fontconfig ttf-dejavu \
 && addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 --ingroup nodejs backend

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Carpetas de subidas (se montan como volumen persistente en Coolify)
RUN mkdir -p public/uploads/cofrades public/uploads/reportes public/uploads/cuadrillas \
 && chown -R backend:nodejs /app
USER backend

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS "http://127.0.0.1:${PORT}/api/health" > /dev/null || exit 1

# Forma exec: node es el PID 1 y recibe SIGTERM (server.js cierra el pool de Knex)
CMD ["node", "server.js"]
