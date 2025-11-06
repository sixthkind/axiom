FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production=false

COPY . .

# Default environment variables (override these in deployment)
ENV PORT=8091
ENV VITE_POCKETBASE_URL=http://localhost:8090

EXPOSE 8091

CMD ["npm", "start"]

