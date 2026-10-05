# Next.js frontend за RepoRun (Docker)
FROM node:20-alpine
WORKDIR /app

# Прво само package фајловите, за да се кешира npm ci
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* се „печат“ во кодот при build. Празно = истиот домен (/api/...)
ARG NEXT_PUBLIC_API_URL=""
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Внатрешна адреса на backend-от во Docker мрежата (за rewrites и за серверот)
ENV API_INTERNAL_URL=http://api:8001
ENV NEXT_TELEMETRY_DISABLED=1

# Build-от не го вика API-то (собите се земаат при барање)
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
