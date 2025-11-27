# ----------- ETAPA 1: BUILDER -----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ----------- ETAPA 2: RUNTIME -----------
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

# ⬇️ ACA EL CAMBIO IMPORTANTE
CMD ["npm", "run", "start:prod"]
