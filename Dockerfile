# Use the official Bun image
FROM oven/bun:1
# Set the working directory
WORKDIR /usr/src/app

# Copy the lock and package file
COPY bun.lockb . 
COPY package.json . 

# Install dependencies
RUN bun install

# Copy your source code
COPY src ./src 

# Copy .env file
COPY .env .env

# Expose the application port
EXPOSE 3004

# Run the app
CMD ["bun", "./src/server.js"]
