import { sleep } from 'k6';
import { signinFlow, helloFlow } from './common.ts';

// SOAK TEST — sustained load over a long period to catch memory leaks,
// connection exhaustion, or slow degradation. 200 VUs for 4 hours.
// Run: pnpm --filter k6 k6:test:soak
export const options = {
  scenarios: {
    soak: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 200 }, // warm up
        { duration: '4h', target: 200 }, // sustained load (watch memory)
        { duration: '1m', target: 0 }, // cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], // should stay fast the whole time
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  signinFlow();
  sleep(1);
  helloFlow();
}
