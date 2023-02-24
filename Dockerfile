FROM node:18-alpine
RUN apk update && apk add --no-cache git curl bash

WORKDIR usr/src

COPY . .

RUN yarn && WALLETCONNECT_PROJECT_ID={{WALLETCONNECT_PROJECT_ID}} yarn build && yarn formatting

FROM node:18-alpine
COPY --from=0 usr/src/dest /usr/src/dest

WORKDIR usr/src
CMD []