export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          plan: string
          max_concurrent_users: number
          trial_ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          plan?: string
          max_concurrent_users?: number
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          plan?: string
          max_concurrent_users?: number
          trial_ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          organization_id: string
          role: string
          full_name: string | null
          avatar_url: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          organization_id: string
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          organization_id?: string
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: string
          stage: number
          created_at: string
          updated_at: string
          created_by: string
          assigned_to: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: string
          stage?: number
          created_at?: string
          updated_at?: string
          created_by: string
          assigned_to?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: string
          stage?: number
          created_at?: string
          updated_at?: string
          created_by?: string
          assigned_to?: string | null
        }
      }
      project_contents: {
        Row: {
          id: string
          project_id: string
          stage_type: string
          content: string
          status: string
          is_ai_generated: boolean
          generation_prompt: string | null
          variant_number: number | null
          is_selected: boolean | null
          created_at: string
          updated_at: string
          created_by: string
          last_edited_by: string | null
        }
        Insert: {
          id?: string
          project_id: string
          stage_type: string
          content: string
          status?: string
          is_ai_generated?: boolean
          generation_prompt?: string | null
          variant_number?: number | null
          is_selected?: boolean | null
          created_at?: string
          updated_at?: string
          created_by: string
          last_edited_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          stage_type?: string
          content?: string
          status?: string
          is_ai_generated?: boolean
          generation_prompt?: string | null
          variant_number?: number | null
          is_selected?: boolean | null
          created_at?: string
          updated_at?: string
          created_by?: string
          last_edited_by?: string | null
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      api_settings: {
        Row: {
          id: string
          openai_api_key: string | null
          claude_api_key: string | null
          deepseek_api_key: string | null
          gemini_api_key: string | null
          default_model: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          openai_api_key?: string | null
          claude_api_key?: string | null
          deepseek_api_key?: string | null
          gemini_api_key?: string | null
          default_model?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          openai_api_key?: string | null
          claude_api_key?: string | null
          deepseek_api_key?: string | null
          gemini_api_key?: string | null
          default_model?: string
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          is_default: boolean
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string
          is_default?: boolean
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          is_default?: boolean
          created_at?: string
          created_by?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
