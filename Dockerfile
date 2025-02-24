FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y libc6

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["node", "server.js"]
