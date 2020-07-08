FROM node:alpine

USER node
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node ./client/package.json .
RUN yarn