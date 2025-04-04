# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json & install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the application port
EXPOSE 6000

# Read secrets from Docker secrets directory
CMD ["sh", "-c", "export MONGO_URI=$(cat /run/secrets/mongo_uri) && export JWT_SECRET=$(cat /run/secrets/jwt_secret) && node server.js"]
