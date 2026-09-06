FROM node:22-alpine
WORKDIR /app
COPY server/package.json ./server/package.json
RUN cd server && npm install --omit=dev
COPY . .
ENV PORT=8787
EXPOSE 8787
CMD ["node", "server/server.mjs"]
