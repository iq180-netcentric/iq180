FROM node:8-alpine
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
RUN npm prune --production
CMD yarn start:prod