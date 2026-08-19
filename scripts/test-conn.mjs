import dns from 'dns';
import pg from 'pg';
const { Client } = pg;

dns.lookup('aws-0-ap-northeast-1.pooler.supabase.com', (err, address, family) => {
  console.log('DNS pooler lookup:', { err, address, family });
});

async function testConn(connStr, label) {
  console.log(`Testing ${label}...`);
  const client = new Client({
    connectionString: connStr,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    console.log(`SUCCESS: ${label}`);
    await client.end();
  } catch (e) {
    console.log(`FAILED ${label}:`, e.message);
  }
}

async function run() {
  await testConn('postgresql://postgres.qmjtbovedceegyblbbuj:10062006%40Sarsm@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres', 'Pooler 6543');
  await testConn('postgresql://postgres.qmjtbovedceegyblbbuj:10062006%40Sarsm@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres', 'Pooler 5432');
}

run();
