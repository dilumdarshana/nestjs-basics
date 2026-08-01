import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate } from 'k6/metrics';

// this can be use to load large set of test data
import { SharedArray } from 'k6/data';

// load test users from a file
const users = new SharedArray('users', () => {
  return JSON.parse(open('./users.json'));
});

// one of the K6 matrix
const failureRate = new Rate('failed_requests');

const BASE_URL = 'http://localhost:3000';

export const options = {
  vus: 10, // Number of virtual users
  duration: '5s', // Test duration
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    'http_req_duration{endpoint:signin}': ['p(95)<1'], // focus on specific API
    'http_req_duration{endpoint:hello}': ['p(95)<200'],
    failed_requests: ['rate<0.1'], // Less than 10% of requests should fail
  },
  // stress the app gradually
  // stages: [
  //   // level 1
  //   { duration: '1m', target: 100 },
  //   { duration: '2m', target: 100 },
  //   // level 2
  //   { duration: '1m', target: 200 },
  //   { duration: '2m', target: 200 },
  //   // level 3
  //   { duration: '1m', target: 500 },
  //   { duration: '2m', target: 500 },
  //   // cool down
  //   { duration: '1m', target: 0 },
  // ],

  // spike test
  // stages: [
  //   // warm up
  //   { duration: '30s', target: 100 },
  //   // spike
  //   { duration: '1m', target: 2_000 },
  //   { duration: '10s', target: 2_000 },
  //   { duration: '1m', target: 100 },
  //   // cool down
  //   { duration: '30s', target: 0 },
  // ],

  // soak test
  // stages: [
  //   // warm up
  //   { duration: '1m', target: 200 },
  //   // load over long time
  //   { duration: '4h', target: 200 }, // run long time to identify memory leaks
  //   // cool down
  //   { duration: '1m', target: 0 }
  // ],
};

export default function () {
  group('signin endpoint', () => {
    // take a random user
    const user = users[Math.floor(Math.random() * users.length)];

    const response = http.post(`${BASE_URL}/signin`, user, {
      tags: { endpoint: 'users' },
    });

    // fill the matrix
    failureRate.add(response.status !== 200); // this count as failure

    check(response, {
      'signin status is 200': (r) => r.status === 200,
      'sigin response time < 400ms': (r) => r.timings.duration < 1,
    });

    sleep(1);
  });

  group('hello endpoint', () => {
    const response = http.get(`${BASE_URL}/`, {
      tags: { endpoint: 'hello' },
    });

    check(response, {
      'hello status is 200': (r) => r.status === 200,
      'hello response time < 200ms': (r) => r.timings.duration < 200,
    });
  });
}
