FROM node:lts-alpine
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
RUN mkdir -p /home/app
WORKDIR /home/app
COPY package.json .
RUN yarn -s
RUN yarn global add typescript

COPY .npmignore tsconfig.json ./
COPY bin/ bin
COPY src/ src

RUN yarn prepack

VOLUME [ "/data" ]
WORKDIR /data

ENTRYPOINT [ "/home/app/bin/run" ]
