FROM denoland/deno:alpine-1.42.2

WORKDIR /app

COPY . .

EXPOSE 7777

CMD [ "run", "--allow-net", "--allow-env", "--unstable", "--watch", "app.js" ]