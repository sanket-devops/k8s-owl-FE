### STAGE 1: Build ###

# We label our stage as 'builder'
FROM node:16.15.1-alpine as build

#ARG ENV_NAME=dev

WORKDIR /app

COPY package.json package-lock.json /app/

RUN cd /app && npm set progress=false && npm cache clear --force && npm install

# Copy project files into the docker image
COPY .  /app

RUN node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod

### STAGE 2: Setup ###

FROM nginx:1.22-alpine

RUN rm -rf /etc/nginx/conf.d/*
# Changing virtual host configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From 'builder' stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=build /app/dist/k8s-owl-FE /usr/share/nginx/html

# Exposing port
EXPOSE 443 80

CMD ["nginx", "-g", "daemon off;"]
