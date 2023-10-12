FROM node:slim
WORKDIR /app
COPY ./v1/ ./v1

RUN npm install

CMD ["node", "v1/src/app.js"]
