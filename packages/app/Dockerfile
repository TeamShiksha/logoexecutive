FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./

RUN corepack enable && \
    corepack prepare pnpm@10 --activate && \
    pnpm install --prod && \
    rm -rf ~/.pnpm-store /root/.local

COPY . .

EXPOSE 5000

CMD ["pnpm", "serve"]
