###############
### STAGE 1: Build app
###############
ARG BUILDER_IMAGE=node:24-alpine3.22
ARG NGINX_IMAGE=nginx:1.29-alpine3.22-slim

FROM $BUILDER_IMAGE AS builder
ARG NPM_REGISTRY_URL=https://registry.npmjs.org/
ARG BUILD_ENVIRONMENT_OPTIONS="--configuration production"
ARG PUPPETEER_DOWNLOAD_HOST_ARG=https://storage.googleapis.com
ARG PUPPETEER_CHROMIUM_REVISION_ARG=1011831
ARG PUPPETEER_SKIP_DOWNLOAD_ARG

# Set the environment variable to increase Node.js memory limit
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN apk add --no-cache git

WORKDIR /usr/src/app

ENV PATH=/usr/src/app/node_modules/.bin:$PATH

# Export Puppeteer env variables for installation with non-default registry.
ENV PUPPETEER_DOWNLOAD_HOST=$PUPPETEER_DOWNLOAD_HOST_ARG
ENV PUPPETEER_CHROMIUM_REVISION=$PUPPETEER_CHROMIUM_REVISION_ARG
ENV PUPPETEER_SKIP_DOWNLOAD=$PUPPETEER_SKIP_DOWNLOAD_ARG

COPY ./ /usr/src/app/

RUN npm cache clear --force

RUN npm config set fetch-retry-maxtimeout 120000
RUN npm config set registry $NPM_REGISTRY_URL --location=global

RUN npm ci

RUN sh -c "ng build --output-path=/dist $BUILD_ENVIRONMENT_OPTIONS"

###############
### STAGE 2: Serve app with nginx ###
###############
FROM $NGINX_IMAGE

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=builder /dist/browser /usr/share/nginx/html

EXPOSE 80

# Default value for the external National ID API URL (override via docker-compose/k8s)
ENV EXTERNAL_NATIONALID_API_URL=https://apis.mifos.community/1.0/nationalid

# When the container starts:
# 1. Replace env.js with values from environment variables
# 2. Process the nginx config template with envsubst
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && envsubst '${EXTERNAL_NATIONALID_API_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
