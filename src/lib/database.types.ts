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
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          start_time: string
          end_time: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          start_time: string
          end_time: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_time?: string
          end_time?: string
          created_by?: string
          created_at?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          status?: string
          created_at?: string
        }
      }
      agenda_items: {
        Row: {
          id: string
          meeting_id: string
          title: string
          description: string | null
          duration_minutes: number | null
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          title: string
          description?: string | null
          duration_minutes?: number | null
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          title?: string
          description?: string | null
          duration_minutes?: number | null
          order?: number
          created_at?: string
        }
      }
    }
  }
}