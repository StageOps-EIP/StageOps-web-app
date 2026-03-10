FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

# Source is mounted as a volume — no COPY needed for dev
EXPOSE 8080
CMD ["npm", "run", "dev"]
