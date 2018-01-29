FROM node:9.4.0

ADD . /home/api-gateway

RUN cd /home/api-gateway && npm install

CMD cd /home/api-gateway && node ./gateway-server.js