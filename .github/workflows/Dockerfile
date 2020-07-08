# This Dockerfile is meant for making sure dependencies, like node-canvas,
# which depends on Cairo, are OK on Alpine Linux.
# Usually, node-canvas works out-of-the-box for macOS, Ubuntu and Windows.
FROM node:alpine

RUN apk update
RUN apk add --no-cache \
    python \
    g++ \
    build-base \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node ./package.json .
RUN yarn