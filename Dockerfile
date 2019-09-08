FROM node:12-alpine as frontend
WORKDIR /app
COPY ./client/package.json .
RUN yarn
COPY ./client .
RUN yarn build

FROM node:12-alpine
WORKDIR /app
COPY package.json .
RUN yarn
COPY . .
RUN yarn build
RUN npm prune --production
COPY --from=frontend /app/dist/client /app/static
CMD yarn start:prod