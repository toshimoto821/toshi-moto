# API Backend

This is intended to be hosted on an Umbrel server. It can also be hosted and run with docker.

I am currently doing that on Digital Ocean docker os and these commands:

```
ssh root@<IP>
export MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<subdomain>.mongodb.net/<DBName>
docker run -d -e MONGODB_URI -p 80:8121 toshimoto821/toshi-moto-api:v1.1.0

docker run -d -e MONGODB_URI -e API_KEY -e NEW_RELIC_LICENSE_KEY -p 80:8121 toshimoto821/toshi-moto-api:v1.1.0
```

For hosting public api, there is an internal API_KEY env variable that its set on the host. It is also set at cf worker. This is so only CF worker may call hosted backend.

<!-- build -->
<!-- build -->
<!-- build -->
<!-- build -->
