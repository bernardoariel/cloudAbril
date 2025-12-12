FROM nginx:alpine

# copiás el build de Vue/Nuxt ya generado (dist) al html de nginx
COPY dist/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
