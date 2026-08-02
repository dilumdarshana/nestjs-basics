# Prometheus & Grafana Concepts

An educational companion to the `prometheus` project. The README tells you *how* to run the stack; this file explains *what the concepts mean* and *why they matter*, grounded in the actual code in `src/` and the docker files.

> Read this alongside `src/app.module.ts`, `src/app.service.ts`, `prometheus.yml`, and `docker-compose.yml`.

---

## 1. The big picture — three moving parts

```
NestJS app ──exposes /metrics──> Prometheus ──scrapes──> Grafana
   (produces)                     (stores + queries)      (dashboards)
```

| Piece | Role | Port |
| --- | --- | --- |
| **NestJS app** | produces metrics, exposes them at `/metrics` | 3000 |
| **Prometheus** | scrapes the app, stores the data (TSDB), answers PromQL queries | 9090 |
| **Grafana** | visualizes Prometheus data in dashboards | 3030 |

The key relationship: **Prometheus pulls** (scrapes) from the app — the app does *not* push. And **Grafana pulls** from Prometheus. Data flows one direction.

---

## 2. Metrics — the data being collected

A **metric** is a named, numeric measurement over time. In this project:

```ts
makeCounterProvider({
  name: 'get_hello_calls',
  help: 'Total number of getHello calls',
})
```

- `name` — the metric's identifier (`get_hello_calls`).
- `help` — a human description (shown in `/metrics`).
- The app **increments** it on every request:

```ts
getHello(): string {
  this.counter.inc();   // +1 every call
  return 'Hello World!';
}
```

### Metric types (from `prom-client`)

| Type | Meaning | Example use |
| --- | --- | --- |
| **Counter** | only goes up (monotonic) | request counts, errors |
| **Gauge** | can go up and down | current queue length, memory |
| **Histogram** | buckets of observed values | request latency distribution |
| **Summary** | quantiles (p50, p95) | latency percentiles |

This project uses a **Counter** — the simplest type, perfect for "how many times did X happen."

---

## 3. The `/metrics` endpoint — how the app exposes data

`PrometheusModule.register({ path: '/metrics' })` (in `app.module.ts`) adds a route that serves metrics in **Prometheus text format**:

```
# HELP get_hello_calls Total number of getHello calls
# TYPE get_hello_calls counter
get_hello_calls 1
```

- `# HELP` / `# TYPE` are metadata lines.
- `get_hello_calls 1` is the actual data point (name + value).
- This is the **contract** between the app and Prometheus — Prometheus reads this text and stores the values.

---

## 4. Scraping — how Prometheus collects data

Prometheus doesn't wait for data; it **polls** the app on a schedule. This is configured in `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s   # how often to scrape every target

scrape_configs:
  - job_name: 'nestjs'
    static_configs:
      - targets: ['host.docker.internal:3000']
    metrics_path: '/metrics'
```

- **`scrape_interval: 15s`** — Prometheus hits `/metrics` every 15 seconds.
- **`job_name: 'nestjs'`** — a label grouping all targets of this job.
- **`targets`** — where to scrape. `host.docker.internal:3000` is the host machine (macOS/Windows); on Linux it's `172.17.0.1:3000`.
- **`metrics_path`** — the endpoint to hit (defaults to `/metrics`).

So every 15s, Prometheus fetches `http://host.docker.internal:3000/metrics` and stores the values.

---

## 5. PromQL — querying the data

Prometheus stores everything as **time series** (metric + labels over time). You query them with **PromQL** (Prometheus Query Language):

```promql
get_hello_calls              # current value
rate(get_hello_calls[5m])    # requests per second over 5 minutes
sum(rate(get_hello_calls[5m]))  # total across all instances
```

- `get_hello_calls` — the raw counter value (always increasing).
- `rate(...[5m])` — the **per-second rate** over a window. This is what you actually want to graph, because a raw counter just climbs forever.
- You can run these in the **Prometheus UI (9090) → Graph** tab, or in Grafana panels.

---

## 6. Labels — slicing data

Metrics can carry **labels** (key/value pairs) to split them into dimensions:

```
get_hello_calls{method="GET", status="200"}
```

Labels let you query subsets: "all requests with status 200", "errors only", etc. PromQL filters on them:

```promql
get_hello_calls{status="500"}   # only 500s
```

This project's counter has no labels (it's a single global counter), but labels are how real apps break metrics down by endpoint, status, instance, etc.

---

## 7. Prometheus UI (9090) — the raw interface

Prometheus ships its own web UI. Its most useful pages:

| Page | Purpose |
| --- | --- |
| **Status → Targets** | is Prometheus successfully scraping? (`up`/`down`) |
| **Graph** | run PromQL queries, see instant results + simple graphs |
| **Status → Configuration** | the loaded `prometheus.yml` |
| **Alerts** | alerting rules (if configured) |

Use 9090 to **verify and debug** — "is my app being scraped? what does the raw data look like?" It's not for pretty dashboards.

---

## 8. Grafana (3030) — dashboards on top

Grafana is a **visualization layer**. It connects to Prometheus as a **data source** and renders metrics as dashboards/panels.

### Data source (auto-provisioned)

`grafana/provisioning/datasources/datasource.yml` tells Grafana where Prometheus is:

```yaml
datasources:
  - name: Prometheus
    type: prometheus
    url: http://prometheus:9090   # the compose service name
    isDefault: true
```

- `url: http://prometheus:9090` — inside the compose network, `prometheus` is the service hostname (not `localhost`).
- This file is **mounted** into the container (`./grafana/provisioning:/etc/grafana/provisioning`), so Grafana auto-connects on startup — no manual setup.

### Panels & dashboards

A **dashboard** is a page of **panels**. Each panel runs a PromQL query and renders it (graph, gauge, table, etc.). For example, a panel with `rate(get_hello_calls[1m])` shows requests per second over time.

---

## 9. The full flow, end to end

```
GET / ──> AppService.getHello() ──> counter.inc()   (metric +1)
                                          │
GET /metrics ──> prom-client registry ──> text exposition
                                          │  scrape every 15s
                                          ▼
                              Prometheus TSDB (stores series)
                                          │  PromQL query
                                          ▼
                              Grafana dashboard (panel)
```

---

## 10. Common questions

**Why does Prometheus pull instead of the app pushing?**
Pulling means Prometheus controls the cadence, and the app doesn't need to know where Prometheus lives. It also makes it easy to add/remove scrape targets without touching the app.

**Why is the counter always increasing?**
A Counter is monotonic — it only goes up. To see "requests per second" you must use `rate()`, which computes the slope over a window.

**Why `host.docker.internal`?**
The app runs on the host (not in a container). Prometheus runs in a container. `host.docker.internal` is the special hostname that resolves from inside a container back to the host machine (macOS/Windows). On Linux it's `172.17.0.1`.

**Why is Grafana on port 3030?**
Grafana's default is 3000, but the NestJS app already uses 3000. The compose maps Grafana's container port 3000 to host port 3030 to avoid the clash.

---

## Quick mental model

```
app exposes metrics ──> Prometheus scrapes & stores ──> Grafana visualizes
   (counter.inc)          (TSDB + PromQL)                 (dashboards)
```