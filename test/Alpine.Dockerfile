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