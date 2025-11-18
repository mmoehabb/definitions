FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm i -g pnpm
RUN pnpm install

# Build the application
COPY . .
RUN pnpm run build

# Set environments
ENV DB_PATH='./my-db'

# Use non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Expose the application port
EXPOSE 3000

# Set docker run command to: pnpm start
CMD [ "pnpm", "start" ]
