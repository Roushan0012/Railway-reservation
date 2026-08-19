import { createClient } from '@supabase/supabase-js';

const url = 'https://qmjtbovedceegyblbbuj.supabase.co';
const key = 'sb_publishable_r2jPMV2neNniVCZyhqr9dA_9rH0RwlS';

const supabase = createClient(url, key);

async function inspect() {
  console.log('--- Inspecting Supabase Tables ---');
  const tables = ['routes', 'cargo_types', 'slots', 'organizations', 'profiles', 'bookings', 'cancellations'];

  for (const t of tables) {
    const { data, error, count } = await supabase.from(t).select('*', { count: 'exact' });
    if (error) {
      console.log(`Table '${t}': ERROR ->`, error.message);
    } else {
      console.log(`Table '${t}': ${data.length} rows found.`);
    }
  }
}

inspect();
