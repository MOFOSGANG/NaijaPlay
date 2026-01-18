# Build Stage for Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build # This assumes a production build script exists

# Final Stage
FROM node:18-alpine
WORKDIR /app

# Copy Backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ .
RUN npx prisma generate

# Copy Built Frontend to Backend static folder (if serving from backend)
# Alternatively, serve frontend separately. For simplicity, we'll suggest a standard backend docker.
# ENTRYPOINT ["npm", "run", "dev"] # For now
