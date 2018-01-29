FROM node:9.4.0

WORKDIR /home/notification-service

ADD . /home/notification-service

RUN cd /home/notification-service && npm install

EXPOSE 3000

CMD cd /home/notification-service && \
	node notification-service.js