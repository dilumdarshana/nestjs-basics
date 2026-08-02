import { sleep } from 'k6';
// k6 requires the full filename for local imports (no extension resolution),
// hence './common.ts'. The editor may flag the `.ts` extension (needs
// allowImportingTsExtensions) — that's a cosmetic IDE warning only; these
// files are excluded from the Nest build and run fine under k6.
import { signinFlow, helloFlow } from './common.ts';

// LOAD TEST — the default scenario. Ramp up to a steady number of VUs, hold,
// then ramp down. This is the "normal expected traffic" baseline.
// Run: pnpm --filter k6 k6:test:load
export const options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 50 }, // ramp up
        { duration: '1m', target: 50 }, // hold steady
        { duration: '30s', target: 0 }, // ramp down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of all requests under 500ms
    'http_req_duration{endpoint:signin}': ['p(95)<400'],
    'http_req_duration{endpoint:hello}': ['p(95)<200'],
    http_req_failed: ['rate<0.1'], // <10% of requests may fail
  },
};

export default function () {
  signinFlow();
  sleep(1); // think time between iterations
  helloFlow();
}
