# Use Node.js LTS version
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package files from the root directory
COPY ../package*.json ./

# Install app dependencies
RUN npm install

# Copy the blockchain source code
COPY . .

# Expose port
EXPOSE 8545

# Start the app
CMD ["node", "Blockchain.js"] 