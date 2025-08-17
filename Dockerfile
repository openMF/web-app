###############
### STAGE 1: Build app
###############
ARG BUILDER_IMAGE=node:22.9.0-alpine
ARG NGINX_IMAGE=nginx:1.27.4-alpine3.21-slim

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

COPY --from=builder /dist/browser /usr/share/nginx/html

EXPOSE 80

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
