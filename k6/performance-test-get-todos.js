import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    duration: '10s',
    vus: 10,
    summaryTrendStats: ["med", "p(99)"],
};

export default function () {
    const url = 'http://localhost:7777/todos';
    const res = http.get(url);

    // Check the response status
    check(res, {
        'is status 200': (r) => r.status === 200,
    });
}
