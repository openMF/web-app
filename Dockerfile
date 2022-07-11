FROM node:16-alpine as builder

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json

RUN npm install --location=global @angular/cli@12.2.17

RUN npm install

COPY . .

RUN ng build --configuration production

FROM nginx:1.19.3

COPY --from=builder /usr/src/app/dist/web-app /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
