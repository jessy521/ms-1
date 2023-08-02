# syntax=docker/dockerfile:1
FROM node:20-alpine
#RUN apk add --no-cache python2 g++ make
WORKDIR /hotel-management-system-be
COPY . .
RUN npm install
CMD ["npm", "start"]
EXPOSE 3008
