# Use Node.js LTS version
FROM node:16-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++ sqlite-dev

# Create app directory
WORKDIR /app

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy backend files
COPY . .

# Expose port
EXPOSE 3000

# Start the backend server
CMD ["npm", "start"] 