FROM node:18-alpine

WORKDIR /app

RUN npm install -g nodemon

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV NODE_OPTIONS="--inspect=0.0.0.0:9228"

EXPOSE 9228
EXPOSE 3009

CMD ["npm", "run", "dev"]
