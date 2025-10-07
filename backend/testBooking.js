(async ()=>{
  try{
    const base = 'http://localhost:5000';
  const email = `test${Date.now()}@muj.manipal.edu`;
    const password = 'Password123!';
    console.log('registering', email);
    let r = await fetch(base + '/api/auth/register', {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({name:'Test User', email, password})
    });
    console.log('register status', r.status);
    console.log('register body', await r.text());

    r = await fetch(base + '/api/auth/login', {
      method: 'POST', headers: {'content-type':'application/json'},
      body: JSON.stringify({email, password})
    });
    console.log('login status', r.status);
    const login = await r.json().catch(async ()=>{ const t=await r.text(); console.log('login raw',t); return null });
    console.log('login body', login);
    const token = login?.token;
    if(!token){ console.error('No token, aborting'); return }

    const eventId = '68e3da63f71adf8c2edf28cf';
    console.log('booking event', eventId, 'seat A1');
    r = await fetch(base + `/api/events/${eventId}/book`, {
      method: 'POST', headers: {'content-type':'application/json','authorization':'Bearer ' + token},
      body: JSON.stringify({seats:['A1']})
    });
    console.log('book status', r.status);
    console.log('book body', await r.text());
  }catch(e){ console.error('ERR', e); }
})();