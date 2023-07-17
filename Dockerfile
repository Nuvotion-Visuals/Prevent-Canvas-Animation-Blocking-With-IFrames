FROM node:14-alpine

WORKDIR /app

COPY . .

EXPOSE 4999
EXPOSE 5000

CMD [ "node", "index.js" ]