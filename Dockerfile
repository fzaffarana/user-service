FROM node:14-alpine

RUN apk add --no-cache yarn --repository="http://dl-cdn.alpinelinux.org/alpine/edge/community" 

ENV NODE_ENV=test

WORKDIR /usr/src/app

COPY package.json ./

RUN yarn install

COPY . ./