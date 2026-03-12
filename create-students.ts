import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://utwhjqgpkktjgqfgxotg.supabase.co";
const supabaseKey = "sb_publishable_KmnL_x8A4eHHHr--shWsYA_I2sGZIhk";
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const domain = "galgotiasuniversity.edu.in";
  
  const { data: college } = await supabase
    .from("colleges")
    .select("id, name")
    .eq("domain", domain)
    .single();

  if (!college) return;
  
  // Create 20 students
  console.log("\nCreating 20 students...");
  const studentsList = [];
  const branchNames = ["Computer Science Engineering", "Electronics & Communication Engineering", "Mechanical Engineering", "Civil Engineering", "Business Analytics"];
  
  for (let i = 1; i <= 20; i++) {
    const email = `student${i}@${domain}`;
    const password = `StudentPass@${i}`;
    const name = `Test Student ${i}`;
    const branchName = branchNames[i % branchNames.length];
    
    // Sign up
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          college_id: college.id
        }
      }
    });
    
    if (authError) {
      if (authError.message.includes("rate limit")) {
         console.error("RATE LIMIT DETECTED!");
         break; // Stop if rate limited
      }
      console.log(`Student ${i} error:`, authError.message);
      studentsList.push({ email, password, branch: branchName });
      continue;
    }
    
    const userId = authData?.user?.id;
    if (userId) {
      // Update profile
      await supabase.from("profiles").update({
        full_name: name,
        college_id: college.id,
        branch: branchName,
        year_of_study: "2nd Year",
        skills: ["React", "TypeScript", "Python"],
        bio: `Hi, I am student ${i} from ${branchName}.`,
        gender: i % 2 === 0 ? "female" : "male"
      }).eq("user_id", userId);
      
      studentsList.push({ email, password, branch: branchName });
      console.log(`Successfully created: ${email}`);
    }
  }
  
  console.log("\n=== GALGOTIAS STUDENTS GENERATED ===");
  studentsList.forEach(s => {
    console.log(`Email: ${s.email} | Password: ${s.password} | Branch: ${s.branch}`);
  });
}

run();
