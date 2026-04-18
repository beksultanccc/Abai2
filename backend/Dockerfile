FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN mkdir -p /app/src/uploads
EXPOSE 5000
CMD ["sh", "-c", "npx prisma db push && npm run seed && npm start"]
