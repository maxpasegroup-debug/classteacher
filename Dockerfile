FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .

RUN npm run prisma:generate && npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["sh", "-c", "mkdir -p data && npm run prisma:push && npm run db:seed && npm run start -- -p 3000"]
