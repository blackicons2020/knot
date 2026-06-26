FROM node:20-slim

# Install OpenSSL 1.1 which Prisma 5 requires
RUN apt-get update -y && apt-get install -y openssl libssl-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start:prod"]
