FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENTRYPOINT [ "node",  "main.js" ]
CMD [ "localhost", "MercuryAFK" ]

