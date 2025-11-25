# Verification Runbook

Use this checklist whenever you need to prove the single-VM stack still works end-to-end.

## 1. Prepare environment
1. Copy the sample env file and edit values as needed (or just use defaults for local testing):
   ```bash
   cp .env.example .env
   # update domains/emails only if you plan to hit real DNS
   ```
2. Ensure Docker Engine + Compose v2 are available and that ports 80/443 are free.

> For localhost-only development you can layer the dev overrides: `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`.

## 2. Start the stack with redundancy
Run the helper target so customer-facing apps boot with two replicas each:
```bash
make up
```
This wraps `docker compose up -d --build --scale next-app-one=2 --scale next-app-two=2 --scale express-api=2`.

Confirm everything is `Up`:
```bash
docker compose ps
```
You should see traefik, both Next.js apps (x2), express-api (x2), cron-logger, redis, loki, promtail, and grafana.

## 3. Spot-check core services
All commands below assume the stack is running.

### Next.js sites
```bash
docker compose exec --index 1 next-app-one node -e "fetch('http://127.0.0.1:3000').then(r=>r.text()).then(t=>console.log(t.slice(0,120))).catch(e=>{console.error(e);process.exit(1);})"
docker compose exec --index 1 next-app-two node -e "fetch('http://127.0.0.1:3000').then(r=>r.text()).then(t=>console.log(t.slice(0,120))).catch(e=>{console.error(e);process.exit(1);})"
```
Expect to see snippets of HTML from each app.

### Express API
```bash
docker compose exec --index 1 express-api node -e "fetch('http://127.0.0.1:4000').then(r=>r.text()).then(console.log).catch(e=>{console.error(e);process.exit(1);})"
```
Should print `{"message":"Hello world from express-api"}`.

### Cron job heartbeat
```bash
docker compose logs cron-logger --tail 5
```
Look for minute-by-minute `All systems green` entries.

### Redis health
```bash
docker compose exec redis redis-cli ping
```
Should return `PONG`.

### Grafana API health
```bash
docker compose exec grafana wget -qO- http://127.0.0.1:3000/api/health
```
Response must contain `"database": "ok"`.

## 4. Observability pipeline checks

### Loki readiness
```bash
docker compose exec loki wget -qO- http://127.0.0.1:3100/ready
```
Returns `ready` once the single-binary stack finishes booting (can take a few seconds).

### Promtail status
```bash
docker compose logs promtail --tail 20
```
Look for `Starting Promtail` and `added Docker target` lines, no repeating errors.

### Query logs stored in Loki
Fetch recent cron job entries to confirm log shipping works:
```bash
docker compose exec loki /bin/sh -c \
  'wget -qO- "http://127.0.0.1:3100/loki/api/v1/query_range?query=%7Bcompose_service%3D%22cron-logger%22%7D&limit=5"'
```
Expect JSON containing the latest `[YYYY-mm-ddTHH:MM:SSZ] All systems green` messages.

You can also list labels to prove ingestion is happening:
```bash
docker compose exec loki /bin/sh -c 'wget -qO- http://127.0.0.1:3100/loki/api/v1/labels'
```

## 5. Optional: external routing checks
If DNS records point at this VM, run the helper script for HTTPS/domain verification:
```bash
./scripts/verify-urls.sh
```
It reports container status plus curl results against each `https://$DOMAIN` routed through Traefik.

## 6. Tear everything down
Once finished, stop and remove the stack (also removes the custom networks/containers):
```bash
rm -f .env
make down
```

## 7. Troubleshooting tips
- **Traefik certificates**: ensure `traefik/acme.json` exists with `chmod 600`. Delete it to re-request certs if needed.
- **Loki stuck restarting**: verify `monitoring/loki-config.yml` matches the single-binary schema (uses the `common` block) and recreate the container (`docker compose up -d loki`).
- **Promtail errors**: the config leverages the built-in `docker` pipeline stage; remove old `timestamps` stages if you customize it. Recreate with `docker compose up -d promtail` after edits.
- **Scaling during redeploys**: use `make redeploy SERVICE=<name>` to roll a single service without downtime.
- **"exec format error"**: This indicates an architecture mismatch (e.g., ARM64 image on AMD64 server). Rebuild images directly on the server: `make rebuild-server` or `docker compose build --no-cache && docker compose up -d`. For future deployments, ensure images are built with `--platform linux/amd64` when deploying to Azure VMs.

Keep this runbook alongside `README.md` for future validation sessions.
