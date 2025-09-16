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

# Set environment variables for Docker
ENV VITE_API_URL=http://localhost:8000

# Expose port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
