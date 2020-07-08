FROM node:alpine

RUN apk update
RUN apk add --no-cache \
    build-base cairo-dev cairo cairo-tools \
    python

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node ./package.json .
RUN yarn