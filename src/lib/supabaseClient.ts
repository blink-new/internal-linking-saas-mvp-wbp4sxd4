import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables check:', {
    VITE_SUPABASE_URL: supabaseUrl ? 'Present' : 'Missing',
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present' : 'Missing',
    allEnvVars: Object.keys(import.meta.env),
    envValues: {
      VITE_SUPABASE_URL: supabaseUrl,
      VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? '[REDACTED]' : 'undefined'
    }
  })
  throw new Error(`Missing Supabase environment variables: ${!supabaseUrl ? 'VITE_SUPABASE_URL ' : ''}${!supabaseAnonKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`)
}

console.log('✅ Supabase client initialized successfully')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          site_url: string
          cornerstone_sheet?: string
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          site_url: string
          cornerstone_sheet?: string
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          site_url?: string
          cornerstone_sheet?: string
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          project_id: string
          title: string
          article_doc: string
          status: 'queued' | 'processing' | 'done' | 'error'
          anchors_added: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          article_doc: string
          status?: 'queued' | 'processing' | 'done' | 'error'
          anchors_added?: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          article_doc?: string
          status?: 'queued' | 'processing' | 'done' | 'error'
          anchors_added?: number
          before_html?: string
          after_html?: string
          error_message?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}