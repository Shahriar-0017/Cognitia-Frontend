# filepath: frontend/Dockerfile
FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 3000
# Make sure Next.js listens on all interfaces (0.0.0.0)
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"]