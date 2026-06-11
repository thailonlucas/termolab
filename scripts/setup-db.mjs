#!/usr/bin/env node
/**
 * Runs supabase/migrations/001_schema.sql against the Supabase project.
 *
 * Requires SUPABASE_ACCESS_TOKEN in .env (Management API PAT).
 * Generate one at: https://supabase.com/dashboard/account/tokens
 *
 * Usage: node scripts/setup-db.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env manually (no external deps needed)
function loadEnv() {
  try {
    const env = readFileSync(resolve(root, '.env'), 'utf8');
    for (const line of env.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // .env not found — rely on environment variables already set
  }
}

loadEnv();

const supabaseUrl  = process.env.VITE_SUPABASE_URL;
const accessToken  = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl) {
  console.error('ERROR: VITE_SUPABASE_URL is not set in .env');
  process.exit(1);
}

// Extract project ref from URL: https://<ref>.supabase.co
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

const sqlPath = resolve(root, 'supabase', 'migrations', '001_schema.sql');
const sql = readFileSync(sqlPath, 'utf8');

if (!accessToken) {
  console.log('\n--- SUPABASE_ACCESS_TOKEN not found ---\n');
  console.log('To run this automatically:');
  console.log('  1. Go to https://supabase.com/dashboard/account/tokens');
  console.log('  2. Generate a new token');
  console.log('  3. Add SUPABASE_ACCESS_TOKEN=<token> to your .env');
  console.log('  4. Run: node scripts/setup-db.mjs\n');
  console.log('--- MANUAL ALTERNATIVE ---\n');
  console.log('  1. Open https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  console.log('  2. Paste the contents of supabase/migrations/001_schema.sql');
  console.log('  3. Click Run\n');
  process.exit(0);
}

console.log(`Running migration on project: ${projectRef}`);

const response = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  }
);

const body = await response.text();

if (!response.ok) {
  console.error(`\nAPI error ${response.status}:`);
  try {
    const json = JSON.parse(body);
    console.error(JSON.stringify(json, null, 2));
  } catch {
    console.error(body);
  }
  console.log('\nTry running the SQL manually instead:');
  console.log('  https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
  process.exit(1);
}

console.log('\nMigration applied successfully.');
console.log('\nTables created:');
const tables = [
  'locations', 'owners', 'protocols', 'protocol_files',
  'movement_types', 'profiles', 'handlings',
  'handling_sessions', 'session_statuses',
  'movements', 'movement_files', 'movement_statuses',
];
tables.forEach(t => console.log(`  ✓ ${t}`));
console.log('\nStorage buckets:');
console.log('  ✓ handling-photos');
console.log('  ✓ protocol-files');
console.log('\nViews:');
console.log('  ✓ sessions_current_status');
console.log('  ✓ movements_current_status');
