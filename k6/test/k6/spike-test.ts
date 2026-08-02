import { sleep } from 'k6';
import { signinFlow, helloFlow } from './common.ts';

// SPIKE TEST — sudden, extreme burst of traffic to test how the app handles
// an unexpected surge (e.g. a flash sale or viral event). Warm up, spike to
// 2,000 VUs, hold briefly, then recover.
// Run: pnpm --filter k6 k6:test:spike
export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 }, // warm up
        { duration: '1m', target: 2_000 }, // spike
        { duration: '10s', target: 2_000 }, // hold at peak
        { duration: '1m', target: 100 }, // recover
        { duration: '30s', target: 0 }, // cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'], // generous budget during the spike
    http_req_failed: ['rate<0.3'], // some failures expected at 2k VUs
  },
};

export default function () {
  signinFlow();
  sleep(1);
  helloFlow();
}
