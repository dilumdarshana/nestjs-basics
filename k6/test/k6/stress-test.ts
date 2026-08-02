import { sleep } from 'k6';
import { signinFlow, helloFlow } from './common.ts';

// STRESS TEST — push beyond expected capacity to find the breaking point.
// Ramp up in levels (100 -> 200 -> 500 VUs), holding each level, then cool
// down. Watch for the point where latency/errors start climbing.
// Run: pnpm --filter k6 k6:test:stress
export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 }, // level 1
        { duration: '2m', target: 100 },
        { duration: '1m', target: 200 }, // level 2
        { duration: '2m', target: 200 },
        { duration: '1m', target: 500 }, // level 3
        { duration: '2m', target: 500 },
        { duration: '1m', target: 0 }, // cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // looser budget under stress
    http_req_failed: ['rate<0.2'], // allow more failures while finding the limit
  },
};

export default function () {
  signinFlow();
  sleep(1);
  helloFlow();
}
