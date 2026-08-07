FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm@10

COPY package.json ./

ARG API_BASE_URL
ENV API_BASE_URL=${API_BASE_URL}

RUN pnpm install

COPY . .

RUN pnpm build

FROM nginx:alpine

RUN addgroup -S nonroot && adduser -S nonroot -G nonroot \
    && mkdir -p /var/cache/nginx /var/lib/nginx /run/nginx \
    && chown -R nonroot:nonroot /var/cache/nginx /var/lib/nginx /run/nginx \
    && chmod -R 700 /var/cache/nginx /var/lib/nginx /run/nginx \
    && chown -R nonroot:nonroot /etc/nginx/conf.d \
    && chmod -R g+w /etc/nginx/conf.d \
    && chown nonroot:nonroot /etc/nginx/nginx.conf \ 
    && chmod g+w /etc/nginx/nginx.conf \
    && touch /var/run/nginx.pid && chown nonroot:nonroot /var/run/nginx.pid || true

COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/nginx.conf

USER nonroot

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
