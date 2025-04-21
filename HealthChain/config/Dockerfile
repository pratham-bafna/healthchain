# Use Node.js LTS version
FROM node:18

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --build-from-source

# Copy app source
COPY . .

# Create directory for SQLite database with proper permissions
RUN mkdir -p /usr/src/app/data && chmod 777 /usr/src/app/data

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "backend/server.js"] 