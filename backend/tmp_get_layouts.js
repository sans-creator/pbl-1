import http from 'http';

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/events/layouts',
  method: 'GET',
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
