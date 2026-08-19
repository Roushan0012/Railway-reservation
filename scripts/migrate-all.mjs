import pg from 'pg';
import fs from 'fs';
import path from 'path';
const { Client } = pg;

const targets = [
  {
    name: 'Direct IPv6 db.qmjtbovedceegyblbbuj.supabase.co:5432',
    config: {
      host: 'db.qmjtbovedceegyblbbuj.supabase.co',
      port: 5432,
      user: 'postgres',
      password: '10062006@Sarsm',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'Direct IPv6 [2406:da14:1772:ea01:7156:9fc2:ba99:3520]:5432',
    config: {
      host: '2406:da14:1772:ea01:7156:9fc2:ba99:3520',
      port: 5432,
      user: 'postgres',
      password: '10062006@Sarsm',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'Pooler IP 52.68.3.1:6543',
    config: {
      host: '52.68.3.1',
      port: 6543,
      user: 'postgres.qmjtbovedceegyblbbuj',
      password: '10062006@Sarsm',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'Pooler IP 54.64.190.72:6543',
    config: {
      host: '54.64.190.72',
      port: 6543,
      user: 'postgres.qmjtbovedceegyblbbuj',
      password: '10062006@Sarsm',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  },
  {
    name: 'Pooler IP 52.68.3.1:5432',
    config: {
      host: '52.68.3.1',
      port: 5432,
      user: 'postgres.qmjtbovedceegyblbbuj',
      password: '10062006@Sarsm',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
    }
  }
];

async function run() {
  for (const t of targets) {
    console.log(`\nTrying ${t.name}...`);
    const client = new Client(t.config);
    try {
      await client.connect();
      console.log(`>>> SUCCESS CONNECTED VIA: ${t.name}! <<<`);
      
      const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase/schema.sql'), 'utf-8');
      console.log('Executing schema.sql...');
      await client.query(schemaSql);
      console.log('>>> schema.sql executed successfully! <<<');

      const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase/seed.sql'), 'utf-8');
      console.log('Executing seed.sql...');
      await client.query(seedSql);
      console.log('>>> seed.sql executed successfully! <<<');

      const check = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
      console.log('Tables created in Supabase public schema:');
      console.log(check.rows.map(r => r.table_name));

      await client.end();
      process.exit(0);
    } catch (e) {
      console.log(`Failed ${t.name}:`, e.message);
      try { await client.end(); } catch {}
    }
  }
  console.log('\nAll connection methods attempted.');
}

run();
