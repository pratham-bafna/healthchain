# Use Node.js LTS version
FROM node:16-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the entire project
COPY . .

# Expose port
EXPOSE 8545

# Start the app
CMD ["node", "src/blockchain/blockchain_demo.js"] 