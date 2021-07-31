FROM node:12-alpine as builder

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package.json /usr/src/app/package.json

RUN npm install -g @angular/cli@9.1.12

RUN npm install

COPY . .

RUN npm run build:prod

RUN ls -la /usr/src/app/dist/web-app

# Stage 2: Host Web App on OpenLiteSpeed
FROM litespeedtech/openlitespeed:latest AS runner

ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8 

# Update distro and install some packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install locales locales-all -y && \
    apt-get install --no-install-recommends -y openssl python3-setuptools python3-testtools python3-nose python3-pip vim curl supervisor logrotate locales  telnet && \
    update-locale LANG=C.UTF-8 LC_MESSAGES=POSIX && \
    locale-gen es_MX.UTF-8 \
    && ln -fs /usr/share/zoneinfo/America/Mexico_City /etc/localtime \
	&& dpkg-reconfigure --frontend noninteractive tzdata \
	&& mkdir -p /etc/ssl/certs/ \	
    && dpkg-reconfigure locales \
    && apt-get clean all && \ 
    rm -rf /var/lib/apt/lists/*

#RUN mv /usr/local/lsws/Example /usr/local/lsws/web-app

#RUN mkdir /usr/local/lsws/conf/vhosts/web-app

#COPY --from=builder /usr/src/app/dist/web-app /usr/local/lsws/web-app/html
COPY --from=builder /usr/src/app/dist/web-app /var/www/vhosts/localhost/html

#COPY ./httpd_config.conf /usr/local/lsws/conf/httpd_config.conf

#COPY ./vhconf.conf /usr/local/lsws/conf/vhosts/web-app/vhconf.conf 

#COPY ./.htaccess /usr/local/lsws/web-app/html

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

EXPOSE 80 443 7080 
