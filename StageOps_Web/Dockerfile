FROM node:20-alpine
ARG STAGEOPS_NET_BRIDGE
WORKDIR /app

COPY package*.json ./
RUN HTTP_PROXY="$STAGEOPS_NET_BRIDGE" HTTPS_PROXY="$STAGEOPS_NET_BRIDGE" \
    http_proxy="$STAGEOPS_NET_BRIDGE" https_proxy="$STAGEOPS_NET_BRIDGE" \
    npm install --no-audit --no-fund \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=2000 \
    --fetch-retry-maxtimeout=10000 \
    --fetch-timeout=60000

# Source folders are mounted for hot reload; the build configuration stays in
# the image so Vite can resolve the project's @ aliases.
COPY vite.config.ts tsconfig*.json tailwind.config.js postcss.config.js ./

EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
