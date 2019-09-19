FROM node:12-alpine
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn build:ssr
RUN npm prune --production
EXPOSE 3000
CMD yarn serve:ssr
