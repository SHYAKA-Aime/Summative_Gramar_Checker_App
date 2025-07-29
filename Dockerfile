# lightweight Node.js image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copying all files from project to the container
COPY . .

# Install http-server to serve the app
RUN npm install -g http-server

# Expose port 8080
EXPOSE 8080

# Runing http-server on port 8080
CMD ["http-server", ".", "-p", "8080"]
