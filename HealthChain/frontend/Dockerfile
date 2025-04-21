# Use Node.js LTS version
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy frontend files
COPY . .

# Expose port
EXPOSE 8080

# Start the frontend server
CMD ["npm", "start"] 