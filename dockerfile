FROM node:18
WORKDIR /app
COPY package*.json ./
COPY ./v1/ ./v1
RUN npm install 
CMD ["node", "v1/src/app.js"]
