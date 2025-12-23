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
      restaurants: {
        Row: {
          id: string
          name: string
          cuisine: string
          image: string | null
          rating: number
          distance: string
          price_range: string
          badges: Json
          dietary: Json
          location_lat: number | null
          location_lng: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cuisine: string
          image?: string | null
          rating: number
          distance: string
          price_range: string
          badges?: Json
          dietary?: Json
          location_lat?: number | null
          location_lng?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cuisine?: string
          image?: string | null
          rating?: number
          distance?: string
          price_range?: string
          badges?: Json
          dietary?: Json
          location_lat?: number | null
          location_lng?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string | null
          restaurant_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_avatar?: string | null
          restaurant_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string | null
          restaurant_id?: string
          created_at?: string
        }
      }
      vote_activities: {
        Row: {
          id: string
          user_id: string
          user_name: string
          user_avatar: string | null
          action: string
          restaurant_id: string
          restaurant_name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_name: string
          user_avatar?: string | null
          action: string
          restaurant_id: string
          restaurant_name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_name?: string
          user_avatar?: string | null
          action?: string
          restaurant_id?: string
          restaurant_name?: string
          created_at?: string
        }
      }
      dinner_sessions: {
        Row: {
          id: string
          title: string
          status: 'active' | 'finalized' | 'cancelled'
          winner_restaurant_id: string | null
          finalized_at: string | null
          booking_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          status?: 'active' | 'finalized' | 'cancelled'
          winner_restaurant_id?: string | null
          finalized_at?: string | null
          booking_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          status?: 'active' | 'finalized' | 'cancelled'
          winner_restaurant_id?: string | null
          finalized_at?: string | null
          booking_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
