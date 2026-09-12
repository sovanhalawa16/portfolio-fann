import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// INI BARIS DETEKTIF! Cek apakah dia kebaca di terminal
console.log('🔍 CEK URL:', supabaseUrl)
console.log('🔍 CEK KEY (awal):', supabaseAnonKey ? supabaseAnonKey.substring(0, 15) + '...' : 'TIDAK ADA!')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)