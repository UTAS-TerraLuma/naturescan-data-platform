# ---- BUILD STAGE ----
FROM node:latest AS build

WORKDIR /app

# Add corepack
RUN npm uninstall -g yarn
RUN npm uninstall -g pnpm
RUN npm i -g corepack --force

# Copy manifests
COPY package.json pnpm-lock.yaml ./
RUN corepack install

# Install deps
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# ---- RUNTIM STAGE ----
FROM caddy:latest
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile
EXPOSE 80