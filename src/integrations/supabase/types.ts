export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: "admin" | "user";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "admin" | "user";
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "admin" | "user";
          created_at?: string;
        };
        Relationships: [];
      };
      lifts: {
        Row: {
          id: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise?: string;
          weight?: number;
          reps?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      workout_history: {
        Row: {
          id: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          performed_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          performed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise?: string;
          weight?: number;
          reps?: number;
          performed_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      custom_exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      personal_records: {
        Row: {
          id: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          achieved_at: string;
          manual_override: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exercise: string;
          weight: number;
          reps: number;
          achieved_at?: string;
          manual_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          exercise?: string;
          weight?: number;
          reps?: number;
          achieved_at?: string;
          manual_override?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reported_issues: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          status: "open" | "in_progress" | "resolved" | "closed";
          priority: "low" | "medium" | "high";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          status?: "open" | "in_progress" | "resolved" | "closed";
          priority?: "low" | "medium" | "high";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "admin" | "user";
    };
    CompositeTypes: Record<string, never>;
  };
}
