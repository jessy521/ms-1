# syntax=docker/dockerfile:1
FROM node:18
#RUN apk add --no-cache python2 g++ make
WORKDIR /hotel-management-system-be
COPY . .
RUN npm install
CMD ["npm", "start"]
EXPOSE 3008
