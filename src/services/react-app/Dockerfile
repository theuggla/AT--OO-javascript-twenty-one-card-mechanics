FROM node:9.4

ADD . /home/react-app
RUN cd /home/react-app && npm install && npm run build

CMD ["node", "/home/react-app/index.js"]
