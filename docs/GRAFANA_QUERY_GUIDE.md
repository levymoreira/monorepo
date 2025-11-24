# Grafana Log Query Guide

## Accessing Logs in Grafana

Your logs are being collected and stored in Loki. Here's how to view them in Grafana:

### Step 1: Navigate to Explore

1. Log into Grafana at `http://grafana.localhost` (dev) or `https://${GRAFANA_DOMAIN}` (production)
2. Click on **"Explore"** in the left sidebar (compass icon)

### Step 2: Select the Loki Data Source

1. At the top of the Explore page, make sure the data source is set to **"Loki"** (not "grafana")
2. If you don't see "Loki", click the dropdown and select it

### Step 3: Query Logs

Use these LogQL queries to view logs from your services:

#### View all logs from all services:
```
{compose_project="monorepo"}
```

#### View logs from a specific service:
```
{compose_service="cron-logger"}
```

```
{compose_service="next-app-one"}
```

```
{compose_service="next-app-two"}
```

```
{compose_service="express-api"}
```

#### View logs from multiple services:
```
{compose_service=~"next-app-one|next-app-two|express-api"}
```

#### View logs with text filtering:
```
{compose_service="cron-logger"} |= "All systems green"
```

```
{compose_service="express-api"} |= "error"
```

### Step 4: View Logs

1. Enter one of the queries above in the query box
2. Click **"Run query"** or press Enter
3. Select a time range (e.g., "Last 15 minutes" or "Last 1 hour")
4. Logs will appear in the panel below

### Available Labels

You can filter by these labels:
- `compose_project` - Always "monorepo"
- `compose_service` - Service name (cron-logger, next-app-one, next-app-two, express-api, etc.)
- `container` - Container name
- `stream` - stdout or stderr

### Example Queries

**All cron logger messages:**
```
{compose_service="cron-logger"}
```

**Errors from any service:**
```
{compose_project="monorepo"} |= "error" | json
```

**Next.js app logs:**
```
{compose_service=~"next-app-one|next-app-two"}
```

**Express API logs:**
```
{compose_service="express-api"}
```

### Troubleshooting

If you don't see any logs:

1. **Check the data source**: Make sure "Loki" is selected (not "grafana")
2. **Check the time range**: Make sure you're looking at a recent time range (e.g., "Last 15 minutes")
3. **Verify services are running**: Run `docker compose ps` to ensure services are up
4. **Check Promtail**: Run `docker compose logs promtail` to see if it's collecting logs
5. **Test Loki directly**: The logs are confirmed to be in Loki - try refreshing Grafana or clearing browser cache

### Verify Data is Available

You can verify logs are in Loki by running:
```bash
docker compose exec promtail wget -qO- 'http://loki:3100/loki/api/v1/label/compose_service/values'
```

This should return a list of all services: `["cron-logger","express-api","grafana","loki","next-app-one","next-app-two","promtail","redis","traefik"]`

