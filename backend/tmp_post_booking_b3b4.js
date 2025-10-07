// tmp_post_booking_b3b4.js - quick booking POST for B3 and B4
import http from 'http';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTRkZDUwZmFkNWQwNzlmZTVhN2M0NyIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzU5ODI5MzI4LCJleHAiOjE3NTk5MTU3Mjh9.zwTSNReSCJIAh-zVTqn4cipYvypUhXmy7H63IWdTeBE';
const eventId = '68e3da63f71adf8c2edf28cf';
const seats = ['B3','B4'];

const postData = JSON.stringify({ seats });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: `/api/events/${eventId}/book`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
    'Authorization': `Bearer ${token}`,
  },
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => (data += chunk));
  res.on('end', () => {
    console.log('status', res.statusCode);
    console.log(data);
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();

// After a short delay, fetch seats to show final state
setTimeout(() => {
  const getOptions = {
    hostname: 'localhost',
    port: 5000,
    path: `/api/events/${eventId}/seats`,
    method: 'GET',
  };
  const g = http.request(getOptions, (r) => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      console.log('seats fetch status', r.statusCode);
      console.log(d);
    });
  });
  g.on('error', e => console.error(e));
  g.end();
}, 700);