# Azure single-VM multi-site POC

This proof of concept shows how to run multiple web properties on a single Azure VM using Docker Compose. It includes two Next.js apps, one Express API, a cron worker, Redis, Traefik for HTTPS + routing, and a full Grafana + Loki + Promtail stack for centralized logging.

## What's inside

| Service | Purpose |
| --- | --- |
| `traefik` | Terminates TLS, routes domains to the correct container, auto-renews Let's Encrypt certs |
| `next-app-one` | First sample Next.js site generated with `npx create-next-app` |
| `next-app-two` | Second sample Next.js site (also from `create-next-app`) |
| `levymoreira-blog` | Personal blog site built with Next.js |
| `express-api` | Simple Node/Express API that returns a JSON hello world |
| `cron-logger` | Node-based cron job that logs a heartbeat every minute |
| `redis` | Cache/data store available to any of your apps |
| `loki`, `promtail`, `grafana` | Centralized log storage, collection, and dashboards |

All app containers can be scaled to two replicas (or more) so you can deploy updates without downtime. Logs from every container are scraped via Promtail and sent to Loki, and Grafana is pre-provisioned with Loki as a data source.

## Prerequisites

- Azure VM (or any Linux host) with Docker Engine and Docker Compose v2 installed
- Public DNS records for each domain pointing at the VM's public IP
- Ports 80 and 443 open in the VM's network security group/firewall

## Configuration

1. Copy the provided example env file and set the domains + credentials you plan to use:
   ```bash
   cp .env.example .env
   # edit .env to match your domains and contact email
   ```
2. Make sure the DNS A records for `NEXT_APP_ONE_DOMAIN`, `NEXT_APP_TWO_DOMAIN`, `BLOG_DOMAIN`, `EXPRESS_API_DOMAIN`, and `GRAFANA_DOMAIN` all point at the VM.
3. The `traefik/acme.json` file is already created with the required `chmod 600`. Traefik will store Let's Encrypt certs there.

## Local Development Setup

For local development on your machine (macOS/Linux), you can run the stack without real domains or HTTPS certificates.

### Step 1: Setup Hosts File

**On macOS**, run the automated setup script:

```bash
sudo ./scripts/setup-dev-hosts.sh
```

Or use the Makefile target:
```bash
make setup-dev-hosts
```

This script will:
- Add localhost domain entries to `/etc/hosts`
- Create a backup of your existing hosts file
- Flush DNS cache automatically

**On Linux**, manually edit `/etc/hosts`:

```bash
sudo nano /etc/hosts
```

Add these lines:
```
127.0.0.1 nextone.localhost
127.0.0.1 nexttwo.localhost
127.0.0.1 api.localhost
127.0.0.1 blog.localhost
127.0.0.1 grafana.localhost
127.0.0.1 traefik.localhost
```

Then flush DNS cache:
```bash
sudo systemd-resolve --flush-caches  # Ubuntu/Debian
# or
sudo resolvectl flush-caches          # newer systemd
```

### Step 2: Start Development Environment

Start the stack in development mode (uses HTTP instead of HTTPS):

```bash
make up-dev
```

Or manually:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build \
  --scale next-app-one=2 \
  --scale next-app-two=2 \
  --scale express-api=2 \
  --scale levymoreira-blog=2
```

### Step 3: Access Your Services

Once running, access your services at:

- `http://nextone.localhost` - Next.js App One
- `http://nexttwo.localhost` - Next.js App Two
- `http://api.localhost` - Express API
- `http://blog.localhost` - Levy Moreira Blog
- `http://grafana.localhost` - Grafana Dashboard
- `http://traefik.localhost` - Traefik Dashboard (dev mode only)

### Step 4: Verify Everything Works

Run the verification script to check all services:

```bash
./scripts/verify-urls.sh
```

Or use `make verify`:
```bash
make verify
```

### Development vs Production

- **Development mode** (`make up-dev`): Uses HTTP, localhost domains, no SSL certificates needed
- **Production mode** (`make up`): Uses HTTPS, requires real domains and DNS setup, Let's Encrypt certificates

To switch back to production mode, stop dev and start production:
```bash
make down
make up
```

## Deploying the stack

Use the provided Makefile to boot everything with redundancy:

```bash
make up
```

This runs `docker compose up -d --build --scale next-app-one=2 --scale next-app-two=2 --scale express-api=2 --scale levymoreira-blog=2`, ensuring two replicas for each of your customer-facing services while the supporting services (Traefik, cron job, Redis, Grafana stack) run single instances.

To stop everything:

```bash
make down
```

Tail logs across the project:

```bash
make logs
```

> Need to target a specific service? Use `docker compose logs -f <service>`.

## Troubleshooting & Testing

### Direct Container Testing

Test services directly without Traefik (useful for debugging):

```bash
# Test Next.js apps
docker compose exec next-app-one curl -s http://localhost:3000
docker compose exec next-app-two curl -s http://localhost:3000
docker compose exec levymoreira-blog curl -s http://localhost:3000

# Test Express API
docker compose exec express-api curl -s http://localhost:4000

# Check Redis
docker compose exec redis redis-cli ping

# View Traefik logs for routing issues
docker compose logs traefik | grep -i router
```

### Production Testing

If you have domains configured in `.env` and DNS pointing to your machine:

```bash
# Test HTTPS endpoints
curl -k https://${NEXT_APP_ONE_DOMAIN}
curl -k https://${EXPRESS_API_DOMAIN}
curl -k https://${GRAFANA_DOMAIN}

# Or use the verification script
./scripts/verify-urls.sh
```

> **Note**: Let's Encrypt certificates require real domains and public DNS. For local development, use the [Local Development Setup](#local-development-setup) section above.

## Zero-downtime service updates

When you publish a new image for a service, rebuild it and hot-reload the containers while keeping at least one replica online:

```bash
make redeploy SERVICE=next-app-one
```

The `redeploy` target rebuilds the image and re-applies `--scale service=2` so traffic keeps flowing through Traefik. You can also run the underlying commands manually:

```bash
docker compose build next-app-one
docker compose up -d --no-deps --scale next-app-one=2 next-app-one
```

Repeat for `next-app-two`, `levymoreira-blog`, or `express-api` whenever you ship a new Docker image.

## Logging + monitoring

- Promtail watches the Docker engine via the socket and forwards every container log to Loki.
- Grafana is automatically provisioned with a Loki data source (`uid: poc-loki`).
- Access Grafana at `https://$GRAFANA_DOMAIN` (set in `.env`) using the credentials from `.env`.
- Start exploring logs with this basic Loki query:
  ```
  {compose_project="monorepo"}
  ```

## Cron jobs

The `cron-logger` service demonstrates Dockerized cron-style work. It uses `node-cron` to log a heartbeat every minute, and its output shows up instantly inside Grafana/Loki. You can adapt this pattern for additional scheduled jobs by creating new containers or extending the existing app.

## Adding more sites/services

- Duplicate one of the existing Next.js or Express apps under `apps/` (or generate another via `npx create-next-app`).
- Add a new service block in `docker-compose.yml` with Traefik labels that reference a new domain.
- Point the new domain's DNS at the VM, run `docker compose up -d --build --scale new-service=2 new-service`, and Traefik will handle the HTTPS cert + routing automatically.

## Redis access

`redis` runs on the internal network, so any app container can reach it at `redis:6379`. Wire up your apps by adding the appropriate client libraries and referencing that hostname.

## Directory structure highlights

```
apps/
  next-app-one/        # Next.js sample site + Dockerfile
  next-app-two/        # Second Next.js site
  levymoreira-blog/    # Personal blog site
  express-api/         # Node/Express API service
  cron-logger/         # Node cron worker
monitoring/
  loki-config.yml
  promtail-config.yml
  grafana/provisioning/datasources/loki.yml
traefik/
  acme.json            # Let's Encrypt storage (keep permissions 600)
```

Feel free to iterate on the sample applications and extend the compose file to host additional domains beyond the included three. The combination of Traefik + Docker Compose keeps everything isolated while sharing the single VM.

--

# Update all services
make update

# Update a specific service
make update SERVICE=levymoreira-blog

# Update Traefik
make update SERVICE=traefik

# Update multiple services (pass as argument to script)
make update SERVICE="levymoreira-blog next-app-one"