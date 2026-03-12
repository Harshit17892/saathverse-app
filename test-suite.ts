import { createClient } from '@supabase/supabase-js';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Manual .env parsing
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envContent.split('\n').forEach((line: string) => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) {
    env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const logFile = path.join(process.cwd(), 'test-report.txt');
const log = (msg: string) => {
  console.log(msg);
  fs.appendFileSync(logFile, msg + '\n');
};

async function runTests() {
  if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
  log("🚀 Starting SaathVerse Test Suite...");
  log(`Timestamp: ${new Date().toISOString()}`);

  // Test 1: Connection
  const { data: colData, error: colError } = await supabase.from('colleges').select('count', { count: 'exact', head: true });
  if (colError) {
    log("❌ Connection Test Failed: " + colError.message);
  } else {
    log(`✅ Connection Test Passed: Found ${colData?.[0]?.count || 0} colleges`);
  }

  // Test 2: Check for profiles with NULL college_id (BUG 2+3 detection)
  const { data: nullCollData, error: nullCollError } = await supabase
    .from('profiles')
    .select('user_id')
    .is('college_id', null);

  if (nullCollError) {
    log("❌ Profile check failed: " + nullCollError.message);
  } else if (nullCollData && nullCollData.length > 0) {
    log(`⚠️ BUG DETECTED: Found ${nullCollData.length} profiles with NULL college_id.`);
    log("👉 Suggestion: Run FIX 6 in the provided SQL script to backfill these.");
  } else {
    log("✅ All profiles have college_id assigned.");
  }

  // Test 3: Check for empty branch/year in profiles (BUG 2 detection)
  const { data: emptyData, error: emptyError } = await supabase
    .from('profiles')
    .select('user_id')
    .or('branch.is.null,year_of_study.is.null');

  if (emptyError) {
    log("❌ Branch/Year check failed: " + emptyError.message);
  } else if (emptyData && emptyData.length > 0) {
    log(`⚠️ BUG DETECTED: Found ${emptyData.length} profiles with missing branch/year info.`);
  } else {
    log("✅ All profiles have branch and year info.");
  }

  // Test 4: Startup ideas check (BUG 4 detection)
  const { data: startupData, error: startupError } = await supabase
    .from('startup_ideas')
    .select('id')
    .limit(1);
  if (startupError) {
    log("⚠️ Startup Ideas lookup issue (might be RLS): " + startupError.message);
  } else {
    log("✅ Startup Ideas table accessible.");
  }

  // Test 5: Check for Storage Buckets (BUG 5 detection)
  // This usually requires a service role key to list buckets, 
  // but we can try an upload or just check public URL accessibility if we had a sample.
  // Instead, let's just log that buckets need manual creation if uploads fail in UI.
  log("ℹ️ Manual Check: Ensure 'avatars', 'carousel-images', and 'club-banners' buckets exist in Supabase Storage.");

  log("\n🏁 Test Suite Complete. Report saved to test-report.txt");
}

runTests();
