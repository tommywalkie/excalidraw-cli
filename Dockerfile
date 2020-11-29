FROM node:lts-alpine

VOLUME [ "/data" ]
ENTRYPOINT [ "/home/excalidraw/bin/run" ]

RUN addgroup -S excalidraw && adduser -S excalidraw -G excalidraw
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

USER excalidraw
WORKDIR /home/excalidraw

COPY --chown=excalidraw:excalidraw package.json .
RUN yarn -s
RUN yarn global add typescript

COPY --chown=excalidraw:excalidraw .npmignore tsconfig.json ./
COPY --chown=excalidraw:excalidraw bin/ bin
COPY --chown=excalidraw:excalidraw src/ src

RUN yarn prepack

WORKDIR /data
