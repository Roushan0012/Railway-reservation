import { createClient } from '@supabase/supabase-js';

const url = 'https://qmjtbovedceegyblbbuj.supabase.co';
const key = 'sb_publishable_r2jPMV2neNniVCZyhqr9dA_9rH0RwlS';

const supabase = createClient(url, key);

async function test() {
  console.log('Testing Supabase REST API connection...');
  const { data, error } = await supabase.from('routes').select('*').limit(5);
  console.log('Result:', { data, error });
}

test();
