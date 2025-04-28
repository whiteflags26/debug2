FROM node:20-alpine

# Create app directory in the container
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of application code
COPY . ./

# Build the TypeScript application
RUN npm run build

# Expose the port the app runs on
EXPOSE 80

# Command to run the application
CMD ["npm", "start"]