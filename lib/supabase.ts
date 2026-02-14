import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          onboarding_completed?: boolean
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          date: string
          messages: any
          context_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          messages: any
          context_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          messages?: any
          context_summary?: string | null
          created_at?: string
        }
      }
      narratives: {
        Row: {
          id: string
          user_id: string
          conversation_id: string
          date: string
          title: string
          story_text: string
          emotion_scores: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id: string
          date: string
          title: string
          story_text: string
          emotion_scores: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string
          date?: string
          title?: string
          story_text?: string
          emotion_scores?: any
          created_at?: string
        }
      }
      value_tags: {
        Row: {
          id: string
          user_id: string
          tag_name: string
          first_appeared: string
          frequency: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tag_name: string
          first_appeared: string
          frequency?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tag_name?: string
          first_appeared?: string
          frequency?: number
          created_at?: string
        }
      }
      narrative_tags: {
        Row: {
          narrative_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          narrative_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          narrative_id?: string
          tag_id?: string
          created_at?: string
        }
      }
    }
  }
}
