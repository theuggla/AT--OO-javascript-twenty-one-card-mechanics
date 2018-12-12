FROM node:9.4.0

WORKDIR /home/travel-together-api

ADD . /home/travel-together-api

RUN cd /home/travel-together-api && npm install

EXPOSE 9000

CMD cd /home/travel-together-api && \
	node api-server.js