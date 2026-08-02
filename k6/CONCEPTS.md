# k6 Concepts

An educational companion to the `k6` project. The README tells you *how* to run the tests; this file explains *what the concepts mean* and *why they matter*, grounded in the actual code in `test/k6/`.

> Read this alongside `test/k6/common.ts` and the four scenario files (`load-test.ts`, `stress-test.ts`, `spike-test.ts`, `soak-test.ts`).

---

## 1. What k6 is

k6 is a **load-testing tool** written in Go. You write a test as a JavaScript/TypeScript script; k6 executes it with many concurrent **virtual users (VUs)** and reports metrics.

Key mental model: **a VU is not a thread.** k6 runs VUs as lightweight goroutines, so you can simulate thousands of concurrent users on one machine. Each VU repeatedly runs your script's `default` function.

---

## 2. The `default` function — what "one user doing one thing" looks like

```ts
export default function () {
  signinFlow();
  sleep(1); // think time between iterations
  helloFlow();
}
```

- `default` is the **per-iteration** workload. Every VU calls it, over and over, for the duration of the test.
- The `sleep(1)` is **think time** — a realistic pause between actions, so you're not hammering the server with zero-delay requests.
- The scenario files import the actual request logic from `common.ts` (`signinFlow`, `helloFlow`), so the "what a user does" is shared and each scenario only changes *how many users and for how long*.

---

## 3. The `options` block — the test's configuration

```ts
export const options = {
  scenarios: { ... },   // how many VUs, over what time
  thresholds: { ... },  // pass/fail criteria
};
```

There are two ways to size a test:

### Old style: `vus` + `duration`
```ts
vus: 10,
duration: '5s',
```
A flat, constant number of VUs for a fixed time. Simple, but it **spikes instantly** to 10 VUs and gives no ramp-up — not very realistic.

### New style: `scenarios` + `executor` (what we use)
```ts
scenarios: {
  load: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 50 },  // ramp up
      { duration: '1m',  target: 50 },  // hold steady
      { duration: '30s', target: 0 },   // ramp down
    ],
  },
},
```
`scenarios` is the modern, flexible approach. Each scenario has a named **executor** that controls *how* VUs are added/removed over time.

---

## 4. Executors — the "how VUs change" engines

| Executor | Behavior | Used for |
| --- | --- | --- |
| `ramping-vus` | VUs ramp up/down through `stages` | load, stress, spike, soak (all four here) |
| `constant-vus` | Fixed VUs for a fixed duration | simple steady load |
| `constant-arrival-rate` | Fixed **requests/sec** regardless of VUs | throughput testing |
| `ramping-arrival-rate` | Ramped requests/sec | realistic traffic patterns |

We use `ramping-vus` everywhere because all four test types are naturally expressed as "ramp to N users, hold, ramp down."

---

## 5. Stages — the ramp curve

```ts
stages: [
  { duration: '30s', target: 50 },  // go from current VUs to 50 over 30s
  { duration: '1m',  target: 50 },  // stay at 50 for 1 minute
  { duration: '30s', target: 0 },   // drop back to 0 over 30s
],
```
Each entry says: *reach `target` VUs over `duration`*. Consecutive stages form a curve. This is what makes a **load** test (gentle ramp) different from a **spike** test (instant jump to 2,000).

---

## 6. Metrics & thresholds — "did it pass?"

k6 records built-in metrics automatically:

| Metric | Meaning |
| --- | --- |
| `http_req_duration` | time for a request to complete |
| `http_req_failed` | fraction of failed requests |
| `http_reqs` | total request count |

**Thresholds** are pass/fail gates on those metrics:

```ts
thresholds: {
  http_req_duration: ['p(95)<500'],   // 95% of requests under 500ms
  http_req_failed:   ['rate<0.1'],    // <10% may fail
},
```

- `p(95)<500` means: the **95th percentile** of request durations must be under 500ms. Percentiles matter more than averages — an average hides slow outliers; `p(95)` catches the slow tail.
- `rate<0.1` means the failure **rate** must stay under 10%.
- If a threshold is crossed, k6 **fails the run** (exit code 99) — that's the signal your app didn't meet the target.

### Custom metrics
```ts
const failureRate = new Rate('failed_requests');
failureRate.add(response.status !== 200);
```
`Rate` is a custom metric that tracks the fraction of `true` values. We could use it, but the built-in `http_req_failed` covers the same ground — prefer built-ins when they exist.

---

## 7. `check` vs `threshold` — two different kinds of assertion

| | `check` | `threshold` |
| Scope | per-request | whole-run aggregate |
| Purpose | "did THIS request behave?" | "did the SYSTEM meet the target?" |
| Fails the run? | No (just reported) | **Yes** |

```ts
check(response, {
  'signin status is 200': (r) => r.status === 200,   // per-request
});
```
```ts
thresholds: {
  http_req_duration: ['p(95)<500'],                    // whole-run
}
```
Rule of thumb: use `check` for **correctness** (status codes, response shape) and `threshold` for **performance** (latency, error rate). Latency as a per-request `check` is usually wrong — you want the aggregate percentile, which is a threshold.

---

## 8. `group` — organizing results

```ts
group('signin endpoint', () => { ... });
```
`group` doesn't change behavior — it **labels** a block so results are reported under a named section. Useful for separating "signin" traffic from "hello" traffic in the output.

---

## 9. Tags — slicing metrics

```ts
http.post(`${BASE_URL}/signin`, user, {
  tags: { endpoint: 'signin' },
});
```
A **tag** is a key/value label attached to a request. Tags let thresholds and reports target a *subset* of traffic:

```ts
'http_req_duration{endpoint:signin}': ['p(95)<400'],
```
This threshold applies only to requests tagged `endpoint:signin`. Tags are how you ask "is the signin endpoint fast, independent of the rest?"

---

## 10. `SharedArray` — loading test data efficiently

```ts
const users = new SharedArray('users', () => {
  return JSON.parse(open('./users.json'));
});
```
- `open()` reads the file **once**.
- `SharedArray` shares that data **read-only across all VUs**, instead of each VU loading its own copy. For large datasets (thousands of rows) this saves a lot of memory.
- `users[Math.floor(Math.random() * users.length)]` picks a random user per iteration, so requests vary.

---

## 11. `__ENV` — configuration without editing code

```ts
export const BASE_URL = __ENV.BASE_URL ?? 'http://host.docker.internal:3000';
```
`__ENV` exposes environment variables passed to k6 (`-e BASE_URL=...`). This lets you point the same script at localhost, staging, or production without editing the file.

---

## 12. The four test types — what each is *for*

| Type | Goal | Shape |
| --- | --- | --- |
| **Load** | Does the app handle *expected* traffic? | ramp to normal VUs, hold, ramp down |
| **Stress** | At what point does it *break*? | ramp up in levels until errors/latency climb |
| **Spike** | How does it handle a *sudden surge*? | warm up, jump to huge VUs, recover |
| **Soak** | Does it *degrade over time* (memory leaks)? | moderate VUs for hours |

They're the same script with different `stages` — which is exactly why splitting them into separate files (each with its own `options`) is the clean structure.

---

## 13. How Docker runs it

```bash
docker compose -f docker-compose.k6.yml run k6 run /scripts/load-test.ts
```
- The `grafana/k6:2.1.0` image contains the k6 binary.
- `./test/k6` is mounted to `/scripts`, so the container sees the scripts.
- Bridge networking + `host.docker.internal` lets the container reach the Nest app on the host.
- k6 runs the script, streams metrics to the terminal, and exits non-zero if any threshold is crossed.

---

## Quick mental model

```
options (scenarios + thresholds)
   └─> VUs run `default` repeatedly
          └─> each iteration: group -> request (tagged) -> check
               └─> metrics accumulate
                    └─> thresholds decide pass/fail
```