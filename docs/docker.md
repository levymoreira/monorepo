# all logs 
docker compose logs

# usage
docker stats

# status all services
docker compose ps

docker compose restart traefik

docker compose logs -f levymoreira-blog

# remove
docker compose stop traefik
docker compose rm -f traefik
docker compose up -d traefik
docker compose logs -f traefik

# verify version / data of a image
docker images monorepo-levymoreira-blog:latest --format "{{.ID}} - {{.CreatedAt}}"

-- 

error:
308 or 301
Set SSL/TLS mode to "Full (strict)" in Cloudflare