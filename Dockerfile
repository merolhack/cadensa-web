# ==============================================================================
# Cadensa Web - Multi-stage Production Dockerfile
# Base: Node 20 Slim (Debian glibc compatible con Next.js Turbopack) + Nginx Alpine
# ==============================================================================

# Etapa 1: Instalación de dependencias
FROM node:20-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Etapa 2: Compilación de la aplicación estática
FROM node:20-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Argumentos de compilación para variables públicas de Supabase
ARG NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder-anon-key"
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Etapa 3: Servidor web de producción de alto rendimiento (Nginx Alpine ~25MB)
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Eliminar configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada y activos generados por Next.js ('out')
COPY nginx.conf /etc/nginx/conf.d/cadensa.conf
COPY --from=builder /app/out ./

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
