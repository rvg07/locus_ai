# we use the lastest LTS availble and a lightweight linux distro
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

#it copies all files from the current directory to /app
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]