export const dynamic = 'force-dynamic';
import AdminClient from "./AdminClient";

async function getSubmissions() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('Admin: SUPABASE_URL =', supabaseUrl);
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('Admin: missing env vars');
    return [];
  }
  
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/submissions?order=created_at.desc`, {
      headers: { 
        'apikey': supabaseKey, 
        'Authorization': `Bearer ${supabaseKey}` 
      },
      cache: 'no-store'
    });
    
    console.log('Admin: response status =', res.status);
    
    if (!res.ok) {
      console.log('Admin: error =', await res.text());
      return [];
    }
    
    const data = await res.json();
    console.log('Admin: got', data.length, 'submissions');
    return data;
  } catch (err: any) {
    console.error('Admin fetch error:', err.message);
    return [];
  }
}

export default async function AdminPage() {
  const submissions = await getSubmissions();
  return <AdminClient submissions={submissions} />;
}
