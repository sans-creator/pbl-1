// bulk_smoke_test.js - fetch all events, find first free seat and attempt booking
import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTRkZDUwZmFkNWQwNzlmZTVhN2M0NyIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzU5ODI5MzI4LCJleHAiOjE3NTk5MTU3Mjh9.zwTSNReSCJIAh-zVTqn4cipYvypUhXmy7H63IWdTeBE';

function get(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: 5000, path, method: 'GET' };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.end();
  });
}

function post(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: 'localhost', port: 5000, path, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'Authorization': `Bearer ${token}` }
    };
    const req = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  try {
    const eventsRes = await get('/api/events');
    const events = JSON.parse(eventsRes.body || '[]');
    const results = [];
    for (const ev of events) {
      const seats = ev.seats || [];
      const free = seats.find(s => !s.isBooked);
      if (!free) {
        results.push({ event: ev._id, status: 'no-free-seat' });
        continue;
      }
      const seatNum = free.seatNumber;
      const res = await post(`/api/events/${ev._id}/book`, { seats: [seatNum] });
      results.push({ event: ev._id, seat: seatNum, status: res.status, body: res.body });
    }
    console.log('Bulk smoke-test results:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
