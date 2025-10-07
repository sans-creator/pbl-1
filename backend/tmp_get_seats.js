import http from 'http';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZTRkZmQxMmI5YjVjNmFiZTFjNGQwMSIsInJvbGUiOiJzdHVkZW50IiwiaWF0IjoxNzU5ODI5OTY5LCJleHAiOjE3NTk5MTYzNjl9.cyW815ZXPgq_nK8SKEb1rFK86UDhFmJqy6lO-puWUbg';
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/events/68e3da63f71adf8c2edf28cf/seats',
  method: 'GET',
  headers: {
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
req.end();
