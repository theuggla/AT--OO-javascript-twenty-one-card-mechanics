FROM node:9.4.0

WORKDIR /home/github-service

ADD . /home/github-service

RUN cd /home/github-service && npm install

EXPOSE 3000

CMD cd /home/github-service && \
	node github-service.js