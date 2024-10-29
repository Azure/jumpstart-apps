# build environment
FROM mcr.microsoft.com/cbl-mariner/base/nodejs:18 as build
WORKDIR /app
COPY . .
RUN npm install --production
RUN npm run build

# production environment
FROM mcr.microsoft.com/cbl-mariner/base/nginx:1

RUN tdnf install awk -y 

RUN mkdir -p /usr/share/nginx/html
#COPY .env /usr/share/nginx/html
COPY ./nginx.conf.template /etc/nginx/nginx.conf.default
COPY --from=build /app/build /usr/share/nginx/html
COPY ./env-config.sh /docker-entrypoint.d/env-config.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/env-config.sh
RUN chmod +x /docker-entrypoint.d/env-config.sh

EXPOSE 80
CMD ["/bin/sh", "-c", "/docker-entrypoint.d/env-config.sh && nginx -g 'daemon off;'"]
