import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://utwhjqgpkktjgqfgxotg.supabase.co";
const supabaseKey = "sb_publishable_KmnL_x8A4eHHHr--shWsYA_I2sGZIhk";

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles } = await supabase.from("profiles").select("*").limit(1);
  console.log("Profiles:", profiles);
  const { data: students } = await supabase.from("students").select("*").limit(1);
  console.log("Students:", students);
}

run();
