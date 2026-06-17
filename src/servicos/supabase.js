import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pyzmekxxfufkdivbjung.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5em1la3h4ZnVma2RpdmJqdW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjY1MzksImV4cCI6MjA5NzMwMjUzOX0.DdoRgNiV3Km642bazf9X1lq2_JeYuLz_uB_gD9WxGno'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)