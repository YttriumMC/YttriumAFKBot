FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
ENTRYPOINT [ "npm",  "run" ]
CMD [ "localhost", "MercuryAFK" ]

