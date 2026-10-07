// public/assets/js/supabase-config.js
// Configuração central do cliente Supabase para o PostLink

export const SUPABASE_URL = 'https://xiicwkagcphvejzycntx.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpaWN3a2FnY3BodmVqenljbnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyMjQwOTksImV4cCI6MjEwNjgwMDA5OX0.RyxiEa0aojXvBaJTdIdtk1Sst35-mFDKXb_CTnt7WiA';
export const GOOGLE_CLIENT_ID = '603616107424-7ije3gifqfngm9mc14aa5pof4hdgjsdq.apps.googleusercontent.com';

// Cria ou reaproveita o cliente Supabase global (usando a lib supabase-js carregada via script CDN)
export function getSupabase() {
  if (!window.supabaseClient) {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error('Supabase client SDK não carregado.');
    }
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return window.supabaseClient;
}
