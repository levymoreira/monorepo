# Grafana Dashboards

Three pre-configured dashboards have been set up and will automatically load when Grafana starts:

## 1. Services Overview Dashboard

**Location:** Dashboards → Services Overview

This dashboard provides:
- **All Service Logs**: Live log stream from all services
- **Log Rate by Service**: Graph showing logs per minute for each service
- **Traefik Access Logs**: HTTP access logs from Traefik
- **Error Rate by Service**: Count of errors per service
- **Service-Specific Log Panels**: Separate log viewers for:
  - Next.js App One
  - Next.js App Two
  - Express API
  - Cron Logger

**Query Examples Used:**
- `{compose_project="azure-sites-poc"}` - All logs
- `{compose_service="cron-logger"}` - Cron logger logs
- `sum by (compose_service) (count_over_time({compose_project="azure-sites-poc"}[1m]))` - Log rate

## 2. HTTP Metrics & Status Codes Dashboard

**Location:** Dashboards → HTTP Metrics & Status Codes

This dashboard provides:
- **Request Rate**: Requests per second over time
- **Total Requests**: Count of requests in the last 5 minutes
- **HTTP Status Codes Distribution**: Stacked bar chart showing:
  - 2xx (Success) - Green
  - 3xx (Redirects) - Blue
  - 4xx (Client Errors) - Yellow
  - 5xx (Server Errors) - Red
- **Request Rate by Service**: Requests per second broken down by service
- **Traefik Access Logs**: Full HTTP access log stream
- **Status Code Stats**: Quick stats for:
  - 5xx Errors (last 5min)
  - 4xx Errors (last 5min)
  - 2xx Success (last 5min)
  - 3xx Redirects (last 5min)

**Query Examples Used:**
- `sum(rate({compose_service="traefik"} |= "HTTP" [1m]))` - Request rate
- `sum by (status_code) (count_over_time({compose_service="traefik"} |= "HTTP" | regexp "\" HTTP/1\.[01]\" (?P<status_code>\d{3})" [1m]))` - Status codes

## 3. Errors Overview Dashboard

**Location:** Dashboards → Errors Overview  
**UID:** `errors-overview` (accessible at `/d/errors-overview`)

This dashboard focuses exclusively on errors and provides:
- **Total Errors**: Count of all errors across all services (last 5min)
- **5xx Server Errors**: HTTP 5xx errors from Traefik (last 5min)
- **4xx Client Errors**: HTTP 4xx errors from Traefik (last 5min)
- **Error Rate by Service**: Graph showing errors per minute for each service
- **Error Count by Service**: Stacked bar chart showing error counts per service (last 5min)
- **Service-Specific Error Logs**: Separate error log panels for:
  - Next.js App One - Error Logs
  - Next.js App Two - Error Logs
  - Express API - Error Logs
  - Traefik - HTTP 4xx/5xx Errors
- **All Error Logs**: Combined error log stream from all services

**Query Examples Used:**
- `{compose_project="azure-sites-poc"} |= "error"` - All errors
- `{compose_service="next-app-one"} |= "error"` - Next.js App One errors
- `sum by (compose_service) (count_over_time({compose_project="azure-sites-poc"} |= "error" [1m]))` - Error rate
- `{compose_service="traefik"} |= "HTTP" | regexp "\" HTTP/1\.[01]\" (?P<status_code>[45]\d{2})"` - HTTP errors

## Accessing the Dashboards

1. Log into Grafana at `http://grafana.localhost` (dev) or `https://${GRAFANA_DOMAIN}` (production)
2. Click on **"Dashboards"** in the left sidebar (grid icon)
3. You should see:
   - **Services Overview**
   - **HTTP Metrics & Status Codes**
   - **Errors Overview**

**Direct Links:**
- Services Overview: `/d/services-overview`
- HTTP Metrics: `/d/http-metrics`
- Errors Overview: `/d/errors-overview`

## Dashboard Features

- **Auto-refresh**: Both dashboards refresh every 10 seconds
- **Time Range**: Default to "Last 15 minutes" (adjustable)
- **Editable**: You can edit and customize the dashboards as needed
- **Live Data**: All panels show real-time data from your services

## Troubleshooting

If dashboards don't appear:

1. **Check Grafana logs**: `docker compose logs grafana | grep dashboard`
2. **Verify provisioning**: The dashboards should load automatically on Grafana startup
3. **Manual refresh**: Try refreshing the Grafana page (F5)
4. **Check data source**: Ensure the Loki data source is configured correctly
5. **Verify services are running**: `docker compose ps`

## Customizing Dashboards

The dashboards are stored in:
- `monitoring/grafana/provisioning/dashboards/services-overview.json`
- `monitoring/grafana/provisioning/dashboards/http-metrics.json`
- `monitoring/grafana/provisioning/dashboards/errors-overview.json`

You can edit these JSON files and restart Grafana to apply changes:
```bash
docker compose restart grafana
```

Or edit dashboards directly in the Grafana UI - changes will be saved to the Grafana database.

## Adding More Dashboards

To add more dashboards:

1. Create a new JSON file in `monitoring/grafana/provisioning/dashboards/`
2. Export a dashboard from Grafana UI (or create one manually)
3. Save it with a `.json` extension
4. Restart Grafana: `docker compose restart grafana`

The dashboard will automatically appear in the Dashboards list.

