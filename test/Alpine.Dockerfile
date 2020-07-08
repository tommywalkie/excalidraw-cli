FROM node:alpine

RUN apk update
RUN apk add -u build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node ./package.json .
RUN yarn