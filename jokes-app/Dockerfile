FROM denoland/deno:alpine-1.42.2

EXPOSE 7777

WORKDIR /app

COPY . .

CMD [ "run", "--unstable", "--allow-net", "app.js" ]