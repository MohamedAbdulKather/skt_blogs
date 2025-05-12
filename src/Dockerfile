# 1. Use Node.js base image
FROM node:18-alpine

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the project files
COPY . .

# 6. Build the Next.js app
RUN npm run build

# 7. Expose port 3000 (default for Next.js)
EXPOSE 3000

# 8. Start the app
CMD ["npm", "start"]
