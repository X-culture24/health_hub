# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Set environment variable to handle hot-reloading in Docker
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=true

# Expose port 3000
EXPOSE 3000

# Start the development server with host set to 0.0.0.0
CMD ["npm", "start"]

# === REMOVE THIS FOR DEV MODE ON PORT 3000 ===
# # Stage 1: Build
# FROM node:20-alpine as build
# WORKDIR /app
# COPY package.json package-lock.json ./
# RUN npm install --legacy-peer-deps
# COPY . .
# RUN npm run build
#
# # Stage 2: Serve with nginx
# FROM nginx:alpine
# COPY --from=build /app/build /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]
