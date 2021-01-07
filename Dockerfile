FROM node:14
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn

COPY . .
ENV NODE_ENV=production
RUN yarn build

CMD ["node", "dist/main"]
