FROM node:9.4.0

WORKDIR /home/user-service

ADD . /home/user-service

RUN cd /home/user-service && npm install

EXPOSE 3000

CMD cd /home/user-service && \
	node user-service.js