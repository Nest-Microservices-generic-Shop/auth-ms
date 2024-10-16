FROM node:21-alpine3.19
WORKDIR /usr/src/app

COPY prisma ./prisma/
COPY package*.json ./
COPY package-lock.json ./

RUN npm install

COPY . .



EXPOSE 3004