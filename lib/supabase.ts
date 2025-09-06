import { createBrowserClient } from '@supabase/ssr';

import { type SupabaseClient } from '@supabase/supabase-js';

export const createClient = (): SupabaseClient<Database> => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          organization_id: string;
          user_id: string;
          stage: number;
          status: string;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          organization_id: string;
          user_id: string;
          stage?: number;
          status?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          organization_id?: string;
          user_id?: string;
          stage?: number;
          status?: string;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      project_data: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          content: string;
          data_type: 'text' | 'pdf' | 'url';
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          content: string;
          data_type: 'text' | 'pdf' | 'url';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          content?: string;
          data_type?: 'text' | 'pdf' | 'url';
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_content: {
        Row: {
          id: string;
          project_id: string;
          stage: number;
          content: string;
          version: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          stage: number;
          content: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          stage?: number;
          content?: string;
          version?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};