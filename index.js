console.log('Happy developing ✨')
async function testSupabase() {
  const { data, error } = await supabase.from("your_table").select("*").limit(1);

  if (error) {
    console.error("❌ Supabase connection failed:", error.message);
  } else {
    console.log("✅ Supabase connected! Sample data:", data);
  }
}

testSupabase();

