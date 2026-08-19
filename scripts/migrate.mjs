import fs from 'fs';
import path from 'path';
import pg from 'pg';
const { Client } = pg;

const connectionStrings = [
  'postgresql://postgres.qmjtbovedceegyblbbuj:10062006%40Sarsm@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres',
  'postgresql://postgres.qmjtbovedceegyblbbuj:10062006%40Sarsm@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
  'postgresql://postgres:10062006%40Sarsm@db.qmjtbovedceegyblbbuj.supabase.co:5432/postgres'
];

async function runMigrations() {
  let client;
  let connected = false;

  for (const connStr of connectionStrings) {
    try {
      console.log(`Attempting connection to: ${connStr.replace(/:[^:]*@/, ':***@')}`);
      client = new Client({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000
      });
      await client.connect();
      console.log('Connected successfully!');
      connected = true;
      break;
    } catch (err) {
      console.error('Connection failed:', err.message);
    }
  }

  if (!connected || !client) {
    console.error('Failed to connect to database using any connection string.');
    process.exit(1);
  }

  try {
    const schemaSql = fs.readFileSync(path.join(process.cwd(), 'supabase/schema.sql'), 'utf-8');
    console.log('Applying schema.sql...');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    const seedSql = fs.readFileSync(path.join(process.cwd(), 'supabase/seed.sql'), 'utf-8');
    console.log('Applying seed.sql...');
    await client.query(seedSql);
    console.log('Seed applied successfully.');

    // Quick verification query
    const routesRes = await client.query('SELECT COUNT(*) FROM routes');
    const cargoRes = await client.query('SELECT COUNT(*) FROM cargo_types');
    const slotsRes = await client.query('SELECT COUNT(*) FROM slots');

    console.log(`Verification: ${routesRes.rows[0].count} routes, ${cargoRes.rows[0].count} cargo types, ${slotsRes.rows[0].count} slots found in DB.`);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
