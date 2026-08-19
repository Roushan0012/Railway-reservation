async function testSqlApi() {
  const serviceKey = 'sb_publishable_r2jPMV2neNniVCZyhqr9dA_9rH0RwlS';
  const url = 'https://qmjtbovedceegyblbbuj.supabase.co/rest/v1/rpc';
  
  // Test if we can call standard endpoints
  try {
    const res = await fetch('https://qmjtbovedceegyblbbuj.supabase.co/rest/v1/', {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    console.log('Rest status:', res.status);
    const json = await res.json();
    console.log('Rest definitions available:', Object.keys(json?.definitions || {}));
  } catch (e) {
    console.log('Rest fetch err:', e.message);
  }
}

testSqlApi();
