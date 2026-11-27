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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      affiliate_commissions: {
        Row: {
          affiliate_user_id: string
          commission_amount: number
          commission_percentage: number
          created_at: string
          id: string
          membership_role: string | null
          payment_amount: number
          payment_id: string
          referral_id: string
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_user_id: string
          commission_amount: number
          commission_percentage: number
          created_at?: string
          id?: string
          membership_role?: string | null
          payment_amount: number
          payment_id: string
          referral_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_user_id?: string
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          membership_role?: string | null
          payment_amount?: number
          payment_id?: string
          referral_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_user_id_fkey"
            columns: ["affiliate_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_user_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          payout_method: string
          processed_at: string | null
          processed_by: string | null
          status: string
          transaction_reference: string | null
        }
        Insert: {
          affiliate_user_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_reference?: string | null
        }
        Update: {
          affiliate_user_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_method?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_user_id_fkey"
            columns: ["affiliate_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_payouts_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          paid_payout: number
          payout_bank_details: Json
          payout_upi_id: string | null
          pending_payout: number
          referral_code: string
          total_conversions: number
          total_earnings: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          paid_payout?: number
          payout_bank_details?: Json
          payout_upi_id?: string | null
          pending_payout?: number
          referral_code: string
          total_conversions?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          paid_payout?: number
          payout_bank_details?: Json
          payout_upi_id?: string | null
          pending_payout?: number
          referral_code?: string
          total_conversions?: number
          total_earnings?: number
          total_referrals?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_user_id: string
          created_at: string
          first_payment_id: string | null
          first_subscription_role: string | null
          has_converted: boolean
          id: string
          referral_code: string
          referred_user_id: string
          signup_at: string
        }
        Insert: {
          affiliate_user_id: string
          created_at?: string
          first_payment_id?: string | null
          first_subscription_role?: string | null
          has_converted?: boolean
          id?: string
          referral_code: string
          referred_user_id: string
          signup_at?: string
        }
        Update: {
          affiliate_user_id?: string
          created_at?: string
          first_payment_id?: string | null
          first_subscription_role?: string | null
          has_converted?: boolean
          id?: string
          referral_code?: string
          referred_user_id?: string
          signup_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_user_id_fkey"
            columns: ["affiliate_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_first_payment_id_fkey"
            columns: ["first_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_settings: {
        Row: {
          commission_percentage: number | null
          id: string
          is_active: boolean
          min_payout_amount: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          commission_percentage?: number | null
          id?: string
          is_active?: boolean
          min_payout_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          commission_percentage?: number | null
          id?: string
          is_active?: boolean
          min_payout_amount?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chapters: {
        Row: {
          city: string
          country: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          manager_id: string | null
          metadata: Json
          name: string
          slug: string
          state: string | null
          updated_at: string
        }
        Insert: {
          city: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          metadata?: Json
          name: string
          slug: string
          state?: string | null
          updated_at?: string
        }
        Update: {
          city?: string
          country?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          manager_id?: string | null
          metadata?: Json
          name?: string
          slug?: string
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          city: string | null
          company_size: string | null
          country: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          industry: string | null
          is_verified: boolean
          logo_url: string | null
          metadata: Json
          name: string
          owner_id: string
          registration_number: string | null
          slug: string | null
          state: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          logo_url?: string | null
          metadata?: Json
          name: string
          owner_id: string
          registration_number?: string | null
          slug?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          industry?: string | null
          is_verified?: boolean
          logo_url?: string | null
          metadata?: Json
          name?: string
          owner_id?: string
          registration_number?: string | null
          slug?: string | null
          state?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          message: string | null
          receiver_id: string
          requester_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id: string
          requester_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          receiver_id?: string
          requester_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          certificate_id: string | null
          certification_payment_id: string | null
          certification_status: string
          certified_at: string | null
          completed_at: string | null
          completed_lessons: Json
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          progress_pct: number
          updated_at: string
          user_id: string
        }
        Insert: {
          certificate_id?: string | null
          certification_payment_id?: string | null
          certification_status?: string
          certified_at?: string | null
          completed_at?: string | null
          completed_lessons?: Json
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          certificate_id?: string | null
          certification_payment_id?: string | null
          certification_status?: string
          certified_at?: string | null
          completed_at?: string | null
          completed_lessons?: Json
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          progress_pct?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_certification_payment_id_fkey"
            columns: ["certification_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certification_fee: number
          created_at: string
          curriculum: Json
          description: string | null
          duration: string
          id: string
          instructor: string
          is_published: boolean
          lessons_count: number
          slug: string
          sort_order: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          certification_fee?: number
          created_at?: string
          curriculum?: Json
          description?: string | null
          duration?: string
          id?: string
          instructor: string
          is_published?: boolean
          lessons_count?: number
          slug: string
          sort_order?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          certification_fee?: number
          created_at?: string
          curriculum?: Json
          description?: string | null
          duration?: string
          id?: string
          instructor?: string
          is_published?: boolean
          lessons_count?: number
          slug?: string
          sort_order?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      divisions: {
        Row: {
          color_hex: string | null
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          requires_paid_membership: boolean
          settings: Json
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_paid_membership?: boolean
          settings?: Json
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_paid_membership?: boolean
          settings?: Json
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      event_checkins: {
        Row: {
          created_at: string
          device_info: Json
          event_id: string
          id: string
          scan_location: string | null
          scan_result: string
          scanned_by: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json
          event_id: string
          id?: string
          scan_location?: string | null
          scan_result: string
          scanned_by: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json
          event_id?: string
          id?: string
          scan_location?: string | null
          scan_result?: string
          scanned_by?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_scanned_by_fkey"
            columns: ["scanned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_checkins_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "event_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          amount_paid: number
          attendee_email: string | null
          attendee_name: string | null
          attendee_phone: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          event_id: string
          id: string
          metadata: Json
          payment_id: string | null
          refund_id: string | null
          registration_number: string
          status: Database["public"]["Enums"]["registration_status"]
          ticket_category_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_paid?: number
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          event_id: string
          id?: string
          metadata?: Json
          payment_id?: string | null
          refund_id?: string | null
          registration_number: string
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_category_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_paid?: number
          attendee_email?: string | null
          attendee_name?: string | null
          attendee_phone?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          event_id?: string
          id?: string
          metadata?: Json
          payment_id?: string | null
          refund_id?: string | null
          registration_number?: string
          status?: Database["public"]["Enums"]["registration_status"]
          ticket_category_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_refund_id_fkey"
            columns: ["refund_id"]
            isOneToOne: false
            referencedRelation: "refunds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_ticket_category_id_fkey"
            columns: ["ticket_category_id"]
            isOneToOne: false
            referencedRelation: "event_ticket_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ticket_categories: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string
          currency: string
          description: string | null
          early_bird_ends_at: string | null
          early_bird_price: number | null
          event_id: string
          id: string
          is_active: boolean
          is_free: boolean
          max_quantity: number | null
          metadata: Json
          name: string
          price_amount: number
          sold_count: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          early_bird_ends_at?: string | null
          early_bird_price?: number | null
          event_id: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          max_quantity?: number | null
          metadata?: Json
          name: string
          price_amount?: number
          sold_count?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          early_bird_ends_at?: string | null
          early_bird_price?: number | null
          event_id?: string
          id?: string
          is_active?: boolean
          is_free?: boolean
          max_quantity?: number | null
          metadata?: Json
          name?: string
          price_amount?: number
          sold_count?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_ticket_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_tickets: {
        Row: {
          checked_in_at: string | null
          checked_in_by: string | null
          created_at: string
          event_id: string
          id: string
          metadata: Json
          qr_token: string
          registration_id: string
          status: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id: string
          id?: string
          metadata?: Json
          qr_token: string
          registration_id: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_in_at?: string | null
          checked_in_by?: string | null
          created_at?: string
          event_id?: string
          id?: string
          metadata?: Json
          qr_token?: string
          registration_id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_tickets_checked_in_by_fkey"
            columns: ["checked_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "event_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agenda: Json
          banner_url: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          current_attendees: number
          description: string | null
          division_id: string | null
          eligibility_rules: Json
          ends_at: string
          event_type: string
          gallery: Json
          id: string
          is_free: boolean
          is_online: boolean
          max_attendees: number | null
          metadata: Json
          online_link: string | null
          organiser_id: string | null
          registration_closes_at: string | null
          registration_opens_at: string | null
          short_description: string | null
          slug: string
          speakers: Json
          sponsors: Json
          starts_at: string
          state: string | null
          status: Database["public"]["Enums"]["event_status"]
          tags: string[] | null
          thumbnail_url: string | null
          timezone: string
          title: string
          updated_at: string
          venue_address: string | null
          venue_name: string | null
        }
        Insert: {
          agenda?: Json
          banner_url?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          current_attendees?: number
          description?: string | null
          division_id?: string | null
          eligibility_rules?: Json
          ends_at: string
          event_type: string
          gallery?: Json
          id?: string
          is_free?: boolean
          is_online?: boolean
          max_attendees?: number | null
          metadata?: Json
          online_link?: string | null
          organiser_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          short_description?: string | null
          slug: string
          speakers?: Json
          sponsors?: Json
          starts_at: string
          state?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          timezone?: string
          title: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Update: {
          agenda?: Json
          banner_url?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          current_attendees?: number
          description?: string | null
          division_id?: string | null
          eligibility_rules?: Json
          ends_at?: string
          event_type?: string
          gallery?: Json
          id?: string
          is_free?: boolean
          is_online?: boolean
          max_attendees?: number | null
          metadata?: Json
          online_link?: string | null
          organiser_id?: string | null
          registration_closes_at?: string | null
          registration_opens_at?: string | null
          short_description?: string | null
          slug?: string
          speakers?: Json
          sponsors?: Json
          starts_at?: string
          state?: string | null
          status?: Database["public"]["Enums"]["event_status"]
          tags?: string[] | null
          thumbnail_url?: string | null
          timezone?: string
          title?: string
          updated_at?: string
          venue_address?: string | null
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organiser_id_fkey"
            columns: ["organiser_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      introduction_requests: {
        Row: {
          created_at: string
          id: string
          introducer_id: string
          message: string | null
          requester_id: string
          responded_at: string | null
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          introducer_id: string
          message?: string | null
          requester_id: string
          responded_at?: string | null
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          introducer_id?: string
          message?: string | null
          requester_id?: string
          responded_at?: string | null
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "introduction_requests_introducer_id_fkey"
            columns: ["introducer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introduction_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "introduction_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      member_enquiries: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          read_at: string | null
          receiver_id: string
          replied: boolean
          sender_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          read_at?: string | null
          receiver_id: string
          replied?: boolean
          sender_id: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          read_at?: string | null
          receiver_id?: string
          replied?: boolean
          sender_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_enquiries_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_enquiries_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          division_id: string
          duration_days: number | null
          features: Json
          id: string
          is_active: boolean
          is_default: boolean
          max_members: number | null
          metadata: Json
          name: string
          plan_type: string
          price_amount: number
          slug: string
          sort_order: number
          updated_at: string
          women_price_amount: number | null
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          division_id: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_members?: number | null
          metadata?: Json
          name: string
          plan_type: string
          price_amount?: number
          slug: string
          sort_order?: number
          updated_at?: string
          women_price_amount?: number | null
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          division_id?: string
          duration_days?: number | null
          features?: Json
          id?: string
          is_active?: boolean
          is_default?: boolean
          max_members?: number | null
          metadata?: Json
          name?: string
          plan_type?: string
          price_amount?: number
          slug?: string
          sort_order?: number
          updated_at?: string
          women_price_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "membership_plans_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          enabled: boolean
          id: string
          notification_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          enabled?: boolean
          id?: string
          notification_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          delivery_error: string | null
          delivery_status: string | null
          id: string
          is_read: boolean
          is_sent: boolean
          metadata: Json
          notification_type: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          is_read?: boolean
          is_sent?: boolean
          metadata?: Json
          notification_type: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          delivery_error?: string | null
          delivery_status?: string | null
          id?: string
          is_read?: boolean
          is_sent?: boolean
          metadata?: Json
          notification_type?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          application_deadline: string | null
          budget_max: number | null
          budget_min: number | null
          city: string | null
          company_id: string | null
          compensation_type: string | null
          country: string | null
          created_at: string
          currency: string | null
          current_applications: number
          description: string
          division_id: string | null
          duration: string | null
          education_requirement: string | null
          end_date: string | null
          experience_level: string | null
          id: string
          is_featured: boolean
          is_remote: boolean
          location: string | null
          max_applications: number | null
          metadata: Json
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          positions_available: number | null
          posted_by: string
          required_skills: string[] | null
          slug: string
          start_date: string | null
          state: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          tags: string[] | null
          target_divisions: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          company_id?: string | null
          compensation_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          current_applications?: number
          description: string
          division_id?: string | null
          duration?: string | null
          education_requirement?: string | null
          end_date?: string | null
          experience_level?: string | null
          id?: string
          is_featured?: boolean
          is_remote?: boolean
          location?: string | null
          max_applications?: number | null
          metadata?: Json
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          positions_available?: number | null
          posted_by: string
          required_skills?: string[] | null
          slug: string
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          target_divisions?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string | null
          company_id?: string | null
          compensation_type?: string | null
          country?: string | null
          created_at?: string
          currency?: string | null
          current_applications?: number
          description?: string
          division_id?: string | null
          duration?: string | null
          education_requirement?: string | null
          end_date?: string | null
          experience_level?: string | null
          id?: string
          is_featured?: boolean
          is_remote?: boolean
          location?: string | null
          max_applications?: number | null
          metadata?: Json
          opportunity_type?: Database["public"]["Enums"]["opportunity_type"]
          positions_available?: number | null
          posted_by?: string
          required_skills?: string[] | null
          slug?: string
          start_date?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          target_divisions?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunities_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunity_applications: {
        Row: {
          additional_info: Json
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          metadata: Json
          opportunity_id: string
          portfolio_url: string | null
          resume_url: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          reviewer_notes: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          additional_info?: Json
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_id: string
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          additional_info?: Json
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          opportunity_id?: string
          portfolio_url?: string | null
          resume_url?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          reviewer_notes?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_applications_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_webhooks: {
        Row: {
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          payload: Json
          payment_id: string | null
          processed: boolean
          processed_at: string | null
          provider: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          payload: Json
          payment_id?: string | null
          processed?: boolean
          processed_at?: string | null
          provider?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          payload?: Json
          payment_id?: string | null
          processed?: boolean
          processed_at?: string | null
          provider?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhooks_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          discount_amount: number | null
          failure_reason: string | null
          id: string
          metadata: Json
          net_amount: number | null
          notes: Json
          paid_at: string | null
          provider: string
          provider_order_id: string | null
          provider_payment_id: string | null
          provider_signature: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          receipt_number: string | null
          reference_id: string | null
          reference_type: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tax_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          net_amount?: number | null
          notes?: Json
          paid_at?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          purpose: Database["public"]["Enums"]["payment_purpose"]
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          discount_amount?: number | null
          failure_reason?: string | null
          id?: string
          metadata?: Json
          net_amount?: number | null
          notes?: Json
          paid_at?: string | null
          provider?: string
          provider_order_id?: string | null
          provider_payment_id?: string | null
          provider_signature?: string | null
          purpose?: Database["public"]["Enums"]["payment_purpose"]
          receipt_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tax_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string
          full_name: string | null
          gender: string | null
          headline: string | null
          id: string
          is_active: boolean
          is_email_verified: boolean
          is_phone_verified: boolean
          is_women_discount_eligible: boolean | null
          linkedin_url: string | null
          metadata: Json
          onboarding_completed: boolean
          phone: string | null
          pincode: string | null
          state: string | null
          updated_at: string
          verification_level: Database["public"]["Enums"]["verification_level"]
          visibility: Database["public"]["Enums"]["profile_visibility"]
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          id: string
          is_active?: boolean
          is_email_verified?: boolean
          is_phone_verified?: boolean
          is_women_discount_eligible?: boolean | null
          linkedin_url?: string | null
          metadata?: Json
          onboarding_completed?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          id?: string
          is_active?: boolean
          is_email_verified?: boolean
          is_phone_verified?: boolean
          is_women_discount_eligible?: boolean | null
          linkedin_url?: string | null
          metadata?: Json
          onboarding_completed?: boolean
          phone?: string | null
          pincode?: string | null
          state?: string | null
          updated_at?: string
          verification_level?: Database["public"]["Enums"]["verification_level"]
          visibility?: Database["public"]["Enums"]["profile_visibility"]
          website?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          initiated_by: string | null
          metadata: Json
          payment_id: string
          processed_at: string | null
          provider_refund_id: string | null
          reason: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          initiated_by?: string | null
          metadata?: Json
          payment_id: string
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          initiated_by?: string | null
          metadata?: Json
          payment_id?: string
          processed_at?: string | null
          provider_refund_id?: string | null
          reason?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean
          cancelled_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          membership_id: string
          metadata: Json
          payment_id: string | null
          plan_id: string
          starts_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_renew?: boolean
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id: string
          metadata?: Json
          payment_id?: string | null
          plan_id: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_renew?: boolean
          cancelled_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          membership_id?: string
          metadata?: Json
          payment_id?: string | null
          plan_id?: string
          starts_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "user_division_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_division_memberships: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          division_id: string
          division_profile: Json
          id: string
          joined_at: string
          membership_plan_id: string | null
          metadata: Json
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          division_id: string
          division_profile?: Json
          id?: string
          joined_at?: string
          membership_plan_id?: string | null
          metadata?: Json
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          division_id?: string
          division_profile?: Json
          id?: string
          joined_at?: string
          membership_plan_id?: string | null
          metadata?: Json
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_division_memberships_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_division_memberships_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_division_memberships_membership_plan_id_fkey"
            columns: ["membership_plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_division_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_education: {
        Row: {
          created_at: string
          degree: string | null
          description: string | null
          end_year: number | null
          field_of_study: string | null
          id: string
          institution: string
          is_current: boolean
          start_year: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution: string
          is_current?: boolean
          start_year?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          description?: string | null
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution?: string
          is_current?: boolean
          start_year?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_education_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_event_entitlements: {
        Row: {
          created_at: string
          id: string
          membership_id: string | null
          total_free_passes: number
          updated_at: string
          used_free_passes: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          membership_id?: string | null
          total_free_passes?: number
          updated_at?: string
          used_free_passes?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          membership_id?: string | null
          total_free_passes?: number
          updated_at?: string
          used_free_passes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_entitlements_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "user_division_memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          employment_type: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          start_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          start_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          start_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_experience_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          category: string | null
          created_at: string
          id: string
          interest: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          interest: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          interest?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_portfolio: {
        Row: {
          created_at: string
          description: string | null
          file_url: string | null
          id: string
          image_url: string | null
          project_type: string | null
          sort_order: number
          tags: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          project_type?: string | null
          sort_order?: number
          tags?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_url?: string | null
          id?: string
          image_url?: string | null
          project_type?: string | null
          sort_order?: number
          tags?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_portfolio_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          chapter_id: string | null
          division_id: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          chapter_id?: string | null
          division_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          chapter_id?: string | null
          division_id?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "divisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          proficiency_level: string | null
          skill_name: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          proficiency_level?: string | null
          skill_name: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          proficiency_level?: string | null
          skill_name?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_social_links: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          platform: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          platform: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          platform?: string
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          is_verified: boolean
          mime_type: string | null
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          is_verified?: boolean
          mime_type?: string | null
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          is_verified?: boolean
          mime_type?: string | null
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "verification_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          rejection_reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["verification_request_status"]
          submitted_data: Json
          updated_at: string
          user_id: string
          verification_type: Database["public"]["Enums"]["verification_level"]
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submitted_data?: Json
          updated_at?: string
          user_id: string
          verification_type: Database["public"]["Enums"]["verification_level"]
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["verification_request_status"]
          submitted_data?: Json
          updated_at?: string
          user_id?: string
          verification_type?: Database["public"]["Enums"]["verification_level"]
        }
        Relationships: [
          {
            foreignKeyName: "verification_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_subscription: {
        Args: { _payment_id: string; _subscription_id: string }
        Returns: boolean
      }
      admin_update_user: {
        Args: { _is_active?: boolean; _notes?: string; _target_user_id: string }
        Returns: boolean
      }
      apply_to_opportunity: {
        Args: {
          _additional_info?: Json
          _cover_letter?: string
          _opportunity_id: string
          _portfolio_url?: string
          _resume_url?: string
        }
        Returns: string
      }
      assign_role: {
        Args: {
          _division_id?: string
          _role: Database["public"]["Enums"]["admin_role"]
          _target_user_id: string
        }
        Returns: string
      }
      auth_has_role: {
        Args: { _role: Database["public"]["Enums"]["admin_role"] }
        Returns: boolean
      }
      complete_payment: {
        Args: {
          _payment_id: string
          _provider_payment_id: string
          _provider_signature: string
        }
        Returns: boolean
      }
      create_membership_subscription:
        | {
            Args: { _division_slug: string; _plan_slug: string }
            Returns: {
              amount: number
              currency: string
              membership_id: string
              plan_name: string
              subscription_id: string
            }[]
          }
        | {
            Args: {
              _apply_women_discount?: boolean
              _division_slug: string
              _plan_slug: string
            }
            Returns: {
              amount: number
              currency: string
              membership_id: string
              plan_name: string
              subscription_id: string
            }[]
          }
      create_notification: {
        Args: {
          _body: string
          _channel?: Database["public"]["Enums"]["notification_channel"]
          _notification_type: string
          _reference_id?: string
          _reference_type?: string
          _title: string
          _user_id: string
        }
        Returns: string
      }
      create_payment_order: {
        Args: {
          _amount: number
          _discount_amount?: number
          _notes?: Json
          _provider_order_id: string
          _purpose: Database["public"]["Enums"]["payment_purpose"]
          _reference_id: string
          _reference_type: string
          _tax_amount?: number
          _user_id: string
        }
        Returns: string
      }
      enroll_in_course: {
        Args: { _course_id: string }
        Returns: {
          certificate_id: string | null
          certification_payment_id: string | null
          certification_status: string
          certified_at: string | null
          completed_at: string | null
          completed_lessons: Json
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          progress_pct: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "course_enrollments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      expire_overdue_subscriptions: { Args: never; Returns: number }
      generate_registration_number: {
        Args: { _event_id: string }
        Returns: string
      }
      get_or_create_affiliate_profile: {
        Args: { _user_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          paid_payout: number
          payout_bank_details: Json
          payout_upi_id: string | null
          pending_payout: number
          referral_code: string
          total_conversions: number
          total_earnings: number
          total_referrals: number
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "affiliate_profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_platform_stats: {
        Args: never
        Returns: {
          active_opportunities: number
          active_users: number
          division_stats: Json
          total_events: number
          total_opportunities: number
          total_payments: number
          total_revenue: number
          total_users: number
          upcoming_events: number
        }[]
      }
      get_role_level: {
        Args: { _role: Database["public"]["Enums"]["admin_role"] }
        Returns: number
      }
      get_unread_notification_count: { Args: never; Returns: number }
      get_user_event_discount: {
        Args: { _category_id: string; _event_id: string; _user_id: string }
        Returns: {
          discount_percent: number
          final_price: number
          free_passes_remaining: number
          is_free_pass_available: boolean
          membership_tier: string
          original_price: number
        }[]
      }
      get_user_max_role_level: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["admin_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      issue_event_ticket: {
        Args: { _registration_id: string }
        Returns: string
      }
      join_division: {
        Args: {
          _division_profile?: Json
          _division_slug: string
          _plan_slug?: string
        }
        Returns: string
      }
      mark_notifications_read: {
        Args: { _notification_ids: string[] }
        Returns: number
      }
      process_affiliate_commission: {
        Args: { _payment_id: string }
        Returns: boolean
      }
      record_referral: {
        Args: { _referral_code: string; _referred_user_id: string }
        Returns: boolean
      }
      register_for_event_with_benefit: {
        Args: {
          _attendee_email?: string
          _attendee_name?: string
          _attendee_phone?: string
          _event_id: string
          _redeem_free_pass?: boolean
          _ticket_category_id: string
        }
        Returns: {
          amount: number
          currency: string
          discount_amount: number
          is_confirmed: boolean
          qr_token: string
          registration_id: string
          ticket_id: string
          ticket_number: string
        }[]
      }
      register_for_free_event: {
        Args: {
          _attendee_email?: string
          _attendee_name?: string
          _attendee_phone?: string
          _event_id: string
          _ticket_category_id: string
        }
        Returns: {
          qr_token: string
          registration_id: string
          ticket_id: string
          ticket_number: string
        }[]
      }
      register_for_paid_event: {
        Args: {
          _attendee_email?: string
          _attendee_name?: string
          _attendee_phone?: string
          _event_id: string
          _ticket_category_id: string
        }
        Returns: {
          amount: number
          currency: string
          registration_id: string
        }[]
      }
      respond_to_connection: {
        Args: { _accept: boolean; _connection_id: string }
        Returns: boolean
      }
      review_verification: {
        Args: {
          _new_status: Database["public"]["Enums"]["verification_request_status"]
          _rejection_reason?: string
          _request_id: string
          _review_notes?: string
        }
        Returns: boolean
      }
      revoke_role: {
        Args: {
          _division_id?: string
          _role: Database["public"]["Enums"]["admin_role"]
          _target_user_id: string
        }
        Returns: boolean
      }
      search_members: {
        Args: {
          _city?: string
          _division_slug?: string
          _limit?: number
          _offset?: number
          _query?: string
          _skills?: string[]
        }
        Returns: {
          avatar_url: string
          city: string
          display_name: string
          divisions: string[]
          full_name: string
          headline: string
          top_skills: string[]
          user_id: string
          verification_level: Database["public"]["Enums"]["verification_level"]
        }[]
      }
      search_opportunities: {
        Args: {
          _city?: string
          _division_slug?: string
          _is_remote?: boolean
          _limit?: number
          _offset?: number
          _query?: string
          _skills?: string[]
          _type?: Database["public"]["Enums"]["opportunity_type"]
        }
        Returns: {
          application_deadline: string
          budget_max: number
          budget_min: number
          city: string
          company_name: string
          compensation_type: string
          created_at: string
          is_remote: boolean
          opportunity_id: string
          opportunity_type: Database["public"]["Enums"]["opportunity_type"]
          posted_by_name: string
          slug: string
          title: string
        }[]
      }
      send_connection_request: {
        Args: { _message?: string; _receiver_id: string }
        Returns: string
      }
      submit_verification_request: {
        Args: {
          _data?: Json
          _notes?: string
          _verification_type: Database["public"]["Enums"]["verification_level"]
        }
        Returns: string
      }
      validate_event_ticket: {
        Args: { _qr_token: string }
        Returns: {
          attendee_name: string
          checked_in_at: string
          event_title: string
          is_valid: boolean
          scan_result: string
          ticket_id: string
          ticket_number: string
          ticket_status: Database["public"]["Enums"]["ticket_status"]
        }[]
      }
    }
    Enums: {
      admin_role:
        | "super_admin"
        | "admin"
        | "chapter_manager"
        | "event_organiser"
        | "moderator"
        | "support_staff"
        | "member"
      application_status:
        | "submitted"
        | "under_review"
        | "shortlisted"
        | "accepted"
        | "rejected"
        | "withdrawn"
      connection_status: "pending" | "accepted" | "rejected" | "blocked"
      event_status:
        | "draft"
        | "published"
        | "registration_open"
        | "registration_closed"
        | "ongoing"
        | "completed"
        | "cancelled"
        | "postponed"
      membership_status:
        | "active"
        | "expired"
        | "suspended"
        | "cancelled"
        | "pending_approval"
      notification_channel: "in_app" | "email" | "sms" | "whatsapp" | "push"
      opportunity_status:
        | "draft"
        | "published"
        | "closed"
        | "filled"
        | "expired"
      opportunity_type:
        | "job"
        | "internship"
        | "freelance_project"
        | "business_requirement"
        | "buyer_supplier"
        | "startup_opportunity"
        | "cofounder_search"
        | "creator_campaign"
        | "mentorship"
        | "collaboration"
      payment_purpose:
        | "membership_subscription"
        | "event_ticket"
        | "service_purchase"
        | "course_certification"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "partially_refunded"
      profile_visibility:
        | "public"
        | "members_only"
        | "connections_only"
        | "private"
      registration_status:
        | "confirmed"
        | "pending_payment"
        | "cancelled"
        | "refunded"
        | "waitlisted"
      subscription_status:
        | "active"
        | "expired"
        | "cancelled"
        | "payment_pending"
        | "trial"
      ticket_status: "valid" | "used" | "cancelled" | "expired" | "refunded"
      verification_level:
        | "unverified"
        | "contact_verified"
        | "identity_verified"
        | "professionally_verified"
        | "business_verified"
        | "special_credentials"
      verification_request_status:
        | "submitted"
        | "under_review"
        | "approved"
        | "rejected"
        | "resubmission_required"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      admin_role: [
        "super_admin",
        "admin",
        "chapter_manager",
        "event_organiser",
        "moderator",
        "support_staff",
        "member",
      ],
      application_status: [
        "submitted",
        "under_review",
        "shortlisted",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      connection_status: ["pending", "accepted", "rejected", "blocked"],
      event_status: [
        "draft",
        "published",
        "registration_open",
        "registration_closed",
        "ongoing",
        "completed",
        "cancelled",
        "postponed",
      ],
      membership_status: [
        "active",
        "expired",
        "suspended",
        "cancelled",
        "pending_approval",
      ],
      notification_channel: ["in_app", "email", "sms", "whatsapp", "push"],
      opportunity_status: ["draft", "published", "closed", "filled", "expired"],
      opportunity_type: [
        "job",
        "internship",
        "freelance_project",
        "business_requirement",
        "buyer_supplier",
        "startup_opportunity",
        "cofounder_search",
        "creator_campaign",
        "mentorship",
        "collaboration",
      ],
      payment_purpose: [
        "membership_subscription",
        "event_ticket",
        "service_purchase",
        "course_certification",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partially_refunded",
      ],
      profile_visibility: [
        "public",
        "members_only",
        "connections_only",
        "private",
      ],
      registration_status: [
        "confirmed",
        "pending_payment",
        "cancelled",
        "refunded",
        "waitlisted",
      ],
      subscription_status: [
        "active",
        "expired",
        "cancelled",
        "payment_pending",
        "trial",
      ],
      ticket_status: ["valid", "used", "cancelled", "expired", "refunded"],
      verification_level: [
        "unverified",
        "contact_verified",
        "identity_verified",
        "professionally_verified",
        "business_verified",
        "special_credentials",
      ],
      verification_request_status: [
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "resubmission_required",
      ],
    },
  },
} as const
