import http from 'k6/http';
import { check, group } from 'k6';
import { SharedArray } from 'k6/data';

// Shared helpers for all k6 test scenarios. Each scenario file imports the
// request flows from here and defines its own `options` (executor + stages)
// plus a `default` function that calls these flows.

// Target app URL. Overridable via `-e BASE_URL=...` so tests can point at a
// deployed instance instead of localhost. Defaults to host.docker.internal
// (resolved to the host via the `host-gateway` mapping in docker-compose.k6.yml)
// so the k6 container can reach the Nest app on the host machine.
export const BASE_URL = __ENV.BASE_URL ?? 'http://host.docker.internal:3000';

// Load test users from a file. SharedArray loads the data ONCE per process
// and shares it read-only across all VUs (memory-efficient for big datasets).
export const users = new SharedArray('users', () => {
  return JSON.parse(open('./users.json'));
});

// POST /signin with a random user. Tagged `endpoint:signin` so thresholds
// can target it specifically. Returns the response for callers to assert on.
export function signinFlow() {
  return group('signin endpoint', () => {
    const user = users[Math.floor(Math.random() * users.length)];

    const response = http.post(`${BASE_URL}/signin`, user, {
      tags: { endpoint: 'signin' },
    });

    check(response, {
      'signin status is 200': (r) => r.status === 200,
    });

    return response;
  });
}

// GET / — the hello endpoint. Tagged `endpoint:hello`.
export function helloFlow() {
  return group('hello endpoint', () => {
    const response = http.get(`${BASE_URL}/`, {
      tags: { endpoint: 'hello' },
    });

    check(response, {
      'hello status is 200': (r) => r.status === 200,
    });

    return response;
  });
}
