export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string | null
          badge_color: string | null
          badge_icon: string | null
          college_id: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          student_id: string
          title: string
        }
        Insert: {
          achievement_type?: string | null
          badge_color?: string | null
          badge_icon?: string | null
          college_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          student_id: string
          title: string
        }
        Update: {
          achievement_type?: string | null
          badge_color?: string | null
          badge_icon?: string | null
          college_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          student_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      alumni: {
        Row: {
          achievements: string[] | null
          avatar: string | null
          batch: string | null
          college_id: string | null
          company: string | null
          created_at: string
          department: string | null
          featured: boolean | null
          id: string
          linkedin: string | null
          location: string | null
          name: string
          role: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string[] | null
          avatar?: string | null
          batch?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          featured?: boolean | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name: string
          role?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string[] | null
          avatar?: string | null
          batch?: string | null
          college_id?: string | null
          company?: string | null
          created_at?: string
          department?: string | null
          featured?: boolean | null
          id?: string
          linkedin?: string | null
          location?: string | null
          name?: string
          role?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alumni_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          branch_id: string | null
          college_id: string | null
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          priority: string | null
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          college_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          college_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          priority?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_featured_students: {
        Row: {
          achievement: string | null
          branch_id: string
          college_id: string | null
          created_at: string
          id: string
          sort_order: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          achievement?: string | null
          branch_id: string
          college_id?: string | null
          created_at?: string
          id?: string
          sort_order?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          achievement?: string | null
          branch_id?: string
          college_id?: string | null
          created_at?: string
          id?: string
          sort_order?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_featured_students_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_featured_students_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_featured_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_match_requests: {
        Row: {
          branch_id: string | null
          college_id: string
          created_at: string
          id: string
          needed: string
          posted_by: string
          posted_by_name: string | null
          scope: string
          status: string
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          branch_id?: string | null
          college_id: string
          created_at?: string
          id?: string
          needed: string
          posted_by?: string
          posted_by_name?: string | null
          scope?: string
          status?: string
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          branch_id?: string | null
          college_id?: string
          created_at?: string
          id?: string
          needed?: string
          posted_by?: string
          posted_by_name?: string | null
          scope?: string
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_match_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_match_requests_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_opportunities: {
        Row: {
          branch_id: string | null
          college_id: string
          created_at: string
          created_by: string | null
          cta_label: string
          deadline: string | null
          id: string
          is_active: boolean
          link: string | null
          mode: string
          opportunity_type: string
          source: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          college_id: string
          created_at?: string
          created_by?: string | null
          cta_label?: string
          deadline?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          mode?: string
          opportunity_type?: string
          source?: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          college_id?: string
          created_at?: string
          created_by?: string | null
          cta_label?: string
          deadline?: string | null
          id?: string
          is_active?: boolean
          link?: string | null
          mode?: string
          opportunity_type?: string
          source?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_opportunities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_opportunities_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          college_id: string | null
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          student_count: number | null
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          student_count?: number | null
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          student_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      carousel_slides: {
        Row: {
          college_id: string | null
          created_at: string
          description: string | null
          gradient: string | null
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "carousel_slides_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_limits: {
        Row: {
          bonus_messages: number
          created_at: string
          id: string
          last_reset_at: string
          messages_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bonus_messages?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          messages_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bonus_messages?: number
          created_at?: string
          id?: string
          last_reset_at?: string
          messages_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_event_registrations: {
        Row: {
          club_id: string
          college_id: string | null
          event_id: string
          id: string
          paid: boolean
          payment_mode: Database["public"]["Enums"]["payment_mode"]
          registered_at: string
          student_name: string
          user_id: string
        }
        Insert: {
          club_id: string
          college_id?: string | null
          event_id: string
          id?: string
          paid?: boolean
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          registered_at?: string
          student_name: string
          user_id: string
        }
        Update: {
          club_id?: string
          college_id?: string | null
          event_id?: string
          id?: string
          paid?: boolean
          payment_mode?: Database["public"]["Enums"]["payment_mode"]
          registered_at?: string
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_event_registrations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_event_registrations_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "club_events"
            referencedColumns: ["id"]
          },
        ]
      }
      club_events: {
        Row: {
          banner_gradient: string | null
          club_id: string
          college_id: string | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          is_active: boolean
          is_free: boolean
          location: string | null
          name: string
          price: number | null
          registered_count: number
          time: string | null
          total_spots: number
          updated_at: string
        }
        Insert: {
          banner_gradient?: string | null
          club_id: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          location?: string | null
          name: string
          price?: number | null
          registered_count?: number
          time?: string | null
          total_spots?: number
          updated_at?: string
        }
        Update: {
          banner_gradient?: string | null
          club_id?: string
          college_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_free?: boolean
          location?: string | null
          name?: string
          price?: number | null
          registered_count?: number
          time?: string | null
          total_spots?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      club_join_requests: {
        Row: {
          club_id: string
          college_id: string | null
          created_at: string
          id: string
          message: string | null
          status: Database["public"]["Enums"]["join_request_status"]
          student_name: string
          student_roll: string | null
          user_id: string
        }
        Insert: {
          club_id: string
          college_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          student_name: string
          student_roll?: string | null
          user_id: string
        }
        Update: {
          club_id?: string
          college_id?: string | null
          created_at?: string
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["join_request_status"]
          student_name?: string
          student_roll?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_join_requests_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_join_requests_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      club_members: {
        Row: {
          added_by: string | null
          avatar_initials: string | null
          club_id: string
          college_id: string | null
          id: string
          is_active: boolean
          joined_at: string
          name: string
          role: string
          user_id: string
        }
        Insert: {
          added_by?: string | null
          avatar_initials?: string | null
          club_id: string
          college_id?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          name: string
          role?: string
          user_id: string
        }
        Update: {
          added_by?: string | null
          avatar_initials?: string | null
          club_id?: string
          college_id?: string | null
          id?: string
          is_active?: boolean
          joined_at?: string
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_members_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          advisor: string | null
          banner_gradient: string | null
          category: string | null
          college_id: string | null
          created_at: string
          description: string | null
          focus_tags: string[] | null
          founded: number | null
          id: string
          instagram: string | null
          is_active: boolean | null
          linkedin: string | null
          logo_letter: string | null
          members: number | null
          name: string
          next_event: string | null
          next_event_price: number | null
          slug: string
          tagline: string | null
          updated_at: string
        }
        Insert: {
          advisor?: string | null
          banner_gradient?: string | null
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          focus_tags?: string[] | null
          founded?: number | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          linkedin?: string | null
          logo_letter?: string | null
          members?: number | null
          name: string
          next_event?: string | null
          next_event_price?: number | null
          slug: string
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          advisor?: string | null
          banner_gradient?: string | null
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          focus_tags?: string[] | null
          founded?: number | null
          id?: string
          instagram?: string | null
          is_active?: boolean | null
          linkedin?: string | null
          logo_letter?: string | null
          members?: number | null
          name?: string
          next_event?: string | null
          next_event_price?: number | null
          slug?: string
          tagline?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clubs_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      colleges: {
        Row: {
          city: string | null
          created_at: string
          domain: string
          id: string
          logo_url: string | null
          name: string
          state: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          domain: string
          id?: string
          logo_url?: string | null
          name: string
          state?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          domain?: string
          id?: string
          logo_url?: string | null
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      connections: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          receiver_id: string
          sender_id: string
          status: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      discover_carousel: {
        Row: {
          category: string | null
          college_id: string | null
          created_at: string
          description: string | null
          gradient: string | null
          hyperlink: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "discover_carousel_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendee_count: number | null
          branch_id: string | null
          college_id: string | null
          created_at: string
          date: string | null
          description: string | null
          end_date: string | null
          event_type: string | null
          gradient: string | null
          hyperlink: string | null
          id: string
          icon: string | null
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          location: string | null
          sort_order: number | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attendee_count?: number | null
          branch_id?: string | null
          college_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          icon?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          sort_order?: number | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attendee_count?: number | null
          branch_id?: string | null
          college_id?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          end_date?: string | null
          event_type?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          icon?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          location?: string | null
          sort_order?: number | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      form_settings: {
        Row: {
          college_id: string | null
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_settings_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_carousel: {
        Row: {
          category: string | null
          college_id: string | null
          created_at: string
          hyperlink: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_carousel_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_team_members: {
        Row: {
          created_at: string
          id: string
          message: string | null
          role: string
          status: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          role?: string
          status?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          role?: string
          status?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "hackathon_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathon_teams: {
        Row: {
          college_id: string | null
          created_at: string
          created_by: string
          description: string | null
          gradient: string | null
          hackathon_id: string | null
          id: string
          looking_for: string[] | null
          max_size: number
          name: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          gradient?: string | null
          hackathon_id?: string | null
          id?: string
          looking_for?: string[] | null
          max_size?: number
          name: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          gradient?: string | null
          hackathon_id?: string | null
          id?: string
          looking_for?: string[] | null
          max_size?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathon_teams_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hackathon_teams_hackathon_id_fkey"
            columns: ["hackathon_id"]
            isOneToOne: false
            referencedRelation: "hackathons"
            referencedColumns: ["id"]
          },
        ]
      }
      hackathons: {
        Row: {
          college_id: string | null
          created_at: string
          date: string | null
          end_date: string | null
          gradient: string | null
          icon: string | null
          id: string
          link: string | null
          location: string | null
          max_participants: number | null
          participants: number | null
          prize: string | null
          status: string | null
          tagline: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          gradient?: string | null
          icon?: string | null
          id?: string
          link?: string | null
          location?: string | null
          max_participants?: number | null
          participants?: number | null
          prize?: string | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          created_at?: string
          date?: string | null
          end_date?: string | null
          gradient?: string | null
          icon?: string | null
          id?: string
          link?: string | null
          location?: string | null
          max_participants?: number | null
          participants?: number | null
          prize?: string | null
          status?: string | null
          tagline?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hackathons_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      ieee_carousel: {
        Row: {
          category: string | null
          college_id: string | null
          created_at: string
          hyperlink: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ieee_carousel_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      ieee_conferences: {
        Row: {
          college_id: string | null
          conference_type: string | null
          created_at: string
          date: string | null
          description: string | null
          end_date: string | null
          hyperlink: string | null
          id: string
          is_active: boolean | null
          location: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          college_id?: string | null
          conference_type?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          end_date?: string | null
          hyperlink?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          college_id?: string | null
          conference_type?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          end_date?: string | null
          hyperlink?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ieee_conferences_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      ieee_members: {
        Row: {
          avatar: string | null
          bio: string | null
          college_id: string | null
          created_at: string
          department: string | null
          id: string
          ieee_id: string | null
          is_officer: boolean | null
          linkedin: string | null
          name: string
          research_papers: number | null
          role: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          college_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          ieee_id?: string | null
          is_officer?: boolean | null
          linkedin?: string | null
          name: string
          research_papers?: number | null
          role?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          college_id?: string | null
          created_at?: string
          department?: string | null
          id?: string
          ieee_id?: string | null
          is_officer?: boolean | null
          linkedin?: string | null
          name?: string
          research_papers?: number | null
          role?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ieee_members_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          college_id: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          college_id?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          college_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_admin_invites: {
        Row: {
          college_id: string
          created_at: string
          email: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          updated_at: string
        }
        Insert: {
          college_id: string
          created_at?: string
          email: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          college_id?: string
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_admin_invites_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          branch: string | null
          college_id: string | null
          company: string | null
          company_type: string | null
          created_at: string
          full_name: string | null
          gender: string | null
          github_url: string | null
          hackathon_interest: boolean | null
          hide_photo: boolean | null
          id: string
          is_alumni: boolean | null
          linkedin_url: string | null
          passout_year: number | null
          photo_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          year_of_study: string | null
        }
        Insert: {
          bio?: string | null
          branch?: string | null
          college_id?: string | null
          company?: string | null
          company_type?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          github_url?: string | null
          hackathon_interest?: boolean | null
          hide_photo?: boolean | null
          id?: string
          is_alumni?: boolean | null
          linkedin_url?: string | null
          passout_year?: number | null
          photo_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          year_of_study?: string | null
        }
        Update: {
          bio?: string | null
          branch?: string | null
          college_id?: string | null
          company?: string | null
          company_type?: string | null
          created_at?: string
          full_name?: string | null
          gender?: string | null
          github_url?: string | null
          hackathon_interest?: boolean | null
          hide_photo?: boolean | null
          id?: string
          is_alumni?: boolean | null
          linkedin_url?: string | null
          passout_year?: number | null
          photo_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          year_of_study?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          github_link: string | null
          id: string
          image_url: string | null
          live_link: string | null
          tech_stack: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_link?: string | null
          id?: string
          image_url?: string | null
          live_link?: string | null
          tech_stack?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_link?: string | null
          id?: string
          image_url?: string | null
          live_link?: string | null
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          coupon_code: string | null
          id: string
          redeemed_at: string
          reward_id: string
          user_id: string
          xp_spent: number
        }
        Insert: {
          coupon_code?: string | null
          id?: string
          redeemed_at?: string
          reward_id: string
          user_id: string
          xp_spent: number
        }
        Update: {
          coupon_code?: string | null
          id?: string
          redeemed_at?: string
          reward_id?: string
          user_id?: string
          xp_spent?: number
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string
          college_id: string | null
          coupon_code: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          remaining_quantity: number | null
          title: string
          total_quantity: number | null
          xp_cost: number
        }
        Insert: {
          category?: string
          college_id?: string | null
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          remaining_quantity?: number | null
          title: string
          total_quantity?: number | null
          xp_cost: number
        }
        Update: {
          category?: string
          college_id?: string | null
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          remaining_quantity?: number | null
          title?: string
          total_quantity?: number | null
          xp_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "rewards_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      spotlight_carousel: {
        Row: {
          carousel_enabled: boolean | null
          category: string | null
          college_id: string | null
          created_at: string
          description: string | null
          gradient: string | null
          hyperlink: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          carousel_enabled?: boolean | null
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          carousel_enabled?: boolean | null
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          gradient?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spotlight_carousel_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_carousel: {
        Row: {
          category: string | null
          college_id: string | null
          created_at: string
          description: string | null
          hyperlink: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_text: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          college_id?: string | null
          created_at?: string
          description?: string | null
          hyperlink?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_text?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_carousel_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_ideas: {
        Row: {
          ai_clarity: number | null
          ai_difficulty: string | null
          ai_feasibility: number | null
          ai_innovation: string | null
          ai_market: number | null
          ai_risks: string[] | null
          ai_score: number | null
          ai_strengths: string[] | null
          category: string
          college_id: string | null
          created_at: string
          description: string
          id: string
          looking_for: string[] | null
          looking_for_mentor: boolean | null
          name: string
          stage: string
          tags: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_clarity?: number | null
          ai_difficulty?: string | null
          ai_feasibility?: number | null
          ai_innovation?: string | null
          ai_market?: number | null
          ai_risks?: string[] | null
          ai_score?: number | null
          ai_strengths?: string[] | null
          category?: string
          college_id?: string | null
          created_at?: string
          description?: string
          id?: string
          looking_for?: string[] | null
          looking_for_mentor?: boolean | null
          name: string
          stage?: string
          tags?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_clarity?: number | null
          ai_difficulty?: string | null
          ai_feasibility?: number | null
          ai_innovation?: string | null
          ai_market?: number | null
          ai_risks?: string[] | null
          ai_score?: number | null
          ai_strengths?: string[] | null
          category?: string
          college_id?: string | null
          created_at?: string
          description?: string
          id?: string
          looking_for?: string[] | null
          looking_for_mentor?: boolean | null
          name?: string
          stage?: string
          tags?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_ideas_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_members: {
        Row: {
          created_at: string
          id: string
          message: string | null
          role: string
          startup_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          role?: string
          startup_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          role?: string
          startup_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_members_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      startup_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          startup_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          startup_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          startup_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_messages_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startup_ideas"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          bio: string | null
          branch_id: string | null
          college_id: string | null
          created_at: string
          email: string | null
          graduation_year: number | null
          id: string
          is_bot: boolean | null
          is_topper: boolean | null
          name: string
          skills: string[] | null
          social_links: Json | null
          status: string | null
          updated_at: string
          xp_points: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          branch_id?: string | null
          college_id?: string | null
          created_at?: string
          email?: string | null
          graduation_year?: number | null
          id?: string
          is_bot?: boolean | null
          is_topper?: boolean | null
          name: string
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          xp_points?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          branch_id?: string | null
          college_id?: string | null
          created_at?: string
          email?: string | null
          graduation_year?: number | null
          id?: string
          is_bot?: boolean | null
          is_topper?: boolean | null
          name?: string
          skills?: string[] | null
          social_links?: Json | null
          status?: string | null
          updated_at?: string
          xp_points?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "students_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          college_id: string | null
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          total_logins: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          college_id?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          total_logins?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          college_id?: string | null
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          total_logins?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_gamification_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          college_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          college_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          college_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      xp_transactions: {
        Row: {
          action: string
          amount: number
          created_at: string
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          _action: string
          _amount: number
          _description?: string
          _user_id: string
        }
        Returns: undefined
      }
      calculate_level: { Args: { xp_amount: number }; Returns: number }
      get_user_college_id: { Args: { _user_id: string }; Returns: string }
      has_college_role: {
        Args: {
          _college_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_startup_member: {
        Args: { _startup_id: string; _user_id: string }
        Returns: boolean
      }
      update_login_streak: {
        Args: { _user_id: string }
        Returns: {
          current_streak: number
          xp_earned: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "college_admin" | "core_team"
      join_request_status: "pending" | "approved" | "rejected"
      payment_mode: "online" | "at_venue" | "free"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "college_admin", "core_team"],
      join_request_status: ["pending", "approved", "rejected"],
      payment_mode: ["online", "at_venue", "free"],
    },
  },
} as const
