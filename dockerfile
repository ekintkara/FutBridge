FROM node:slim
WORKDIR /app
COPY package*.json ./
COPY v1/ ./v1

RUN npm install --production

CMD ["node", "v1/src/app.js"]
FUTALERT_1456325_FUTALERT