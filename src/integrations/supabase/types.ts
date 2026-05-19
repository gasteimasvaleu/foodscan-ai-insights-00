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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      affiliate_products: {
        Row: {
          affiliate_url: string
          category: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          name: string
          price: number | null
          storage_path: string
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          affiliate_url: string
          category: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          name: string
          price?: number | null
          storage_path: string
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_url?: string
          category?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          price?: number | null
          storage_path?: string
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      baby_checklist: {
        Row: {
          checked_at: string
          id: string
          item_key: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          id?: string
          item_key: string
          user_id: string
        }
        Update: {
          checked_at?: string
          id?: string
          item_key?: string
          user_id?: string
        }
        Relationships: []
      }
      baby_diapers: {
        Row: {
          changed_at: string
          created_at: string
          id: string
          kind: string
          notes: string | null
          user_id: string
        }
        Insert: {
          changed_at?: string
          created_at?: string
          id?: string
          kind: string
          notes?: string | null
          user_id: string
        }
        Update: {
          changed_at?: string
          created_at?: string
          id?: string
          kind?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      baby_favorite_names: {
        Row: {
          created_at: string
          gender: string | null
          id: string
          meaning: string | null
          name: string
          origin: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          gender?: string | null
          id?: string
          meaning?: string | null
          name: string
          origin?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          gender?: string | null
          id?: string
          meaning?: string | null
          name?: string
          origin?: string | null
          user_id?: string
        }
        Relationships: []
      }
      baby_feedings: {
        Row: {
          amount_ml: number | null
          created_at: string
          duration_min: number | null
          fed_at: string
          id: string
          kind: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount_ml?: number | null
          created_at?: string
          duration_min?: number | null
          fed_at?: string
          id?: string
          kind: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount_ml?: number | null
          created_at?: string
          duration_min?: number | null
          fed_at?: string
          id?: string
          kind?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      baby_growth: {
        Row: {
          created_at: string
          head_cm: number | null
          height_cm: number | null
          id: string
          notes: string | null
          recorded_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          head_cm?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          head_cm?: number | null
          height_cm?: number | null
          id?: string
          notes?: string | null
          recorded_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      baby_profile: {
        Row: {
          birth_date: string
          created_at: string
          name: string
          sex: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date: string
          created_at?: string
          name: string
          sex?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string
          created_at?: string
          name?: string
          sex?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      baby_sleep: {
        Row: {
          created_at: string
          ended_at: string
          id: string
          kind: string
          log_date: string
          notes: string | null
          quality: number | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at: string
          id?: string
          kind?: string
          log_date?: string
          notes?: string | null
          quality?: number | null
          started_at: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string
          id?: string
          kind?: string
          log_date?: string
          notes?: string | null
          quality?: number | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          code: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: string
          is_active: boolean
          name: string
          tier: string
        }
        Insert: {
          category?: string
          code: string
          condition_type: string
          condition_value: number
          created_at?: string
          description: string
          icon?: string
          id?: string
          is_active?: boolean
          name: string
          tier?: string
        }
        Update: {
          category?: string
          code?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          name?: string
          tier?: string
        }
        Relationships: []
      }
      calorie_adjustments: {
        Row: {
          adjustment_amount: number
          created_at: string
          date: string
          exercise_record_id: string
          id: string
          user_id: string
        }
        Insert: {
          adjustment_amount: number
          created_at?: string
          date?: string
          exercise_record_id: string
          id?: string
          user_id: string
        }
        Update: {
          adjustment_amount?: number
          created_at?: string
          date?: string
          exercise_record_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_exercise_record"
            columns: ["exercise_record_id"]
            isOneToOne: false
            referencedRelation: "exercise_records"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_completed_days: {
        Row: {
          completed_at: string
          day_number: number
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          day_number: number
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          day_number?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_daily_checklist: {
        Row: {
          created_at: string
          day_number: number
          drank_water: boolean
          followed_menu: boolean
          id: string
          mood: string | null
          notes: string | null
          slept_well: boolean
          symptoms: string[]
          updated_at: string
          user_id: string
          walked: boolean
        }
        Insert: {
          created_at?: string
          day_number: number
          drank_water?: boolean
          followed_menu?: boolean
          id?: string
          mood?: string | null
          notes?: string | null
          slept_well?: boolean
          symptoms?: string[]
          updated_at?: string
          user_id: string
          walked?: boolean
        }
        Update: {
          created_at?: string
          day_number?: number
          drank_water?: boolean
          followed_menu?: boolean
          id?: string
          mood?: string | null
          notes?: string | null
          slept_well?: boolean
          symptoms?: string[]
          updated_at?: string
          user_id?: string
          walked?: boolean
        }
        Relationships: []
      }
      challenge_progress: {
        Row: {
          created_at: string
          current_day: number
          id: string
          is_completed: boolean
          start_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          id?: string
          is_completed?: boolean
          start_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_day?: number
          id?: string
          is_completed?: boolean
          start_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_progress_photos: {
        Row: {
          created_at: string
          day_number: number
          id: string
          notes: string | null
          photo_type: string
          photo_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          notes?: string | null
          photo_type: string
          photo_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          notes?: string | null
          photo_type?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_user_profile: {
        Row: {
          age: number | null
          body_photo_url: string | null
          created_at: string
          face_photo_url: string | null
          gender: string | null
          id: string
          initial_weight: number | null
          motivation: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          body_photo_url?: string | null
          created_at?: string
          face_photo_url?: string | null
          gender?: string | null
          id: string
          initial_weight?: number | null
          motivation?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          body_photo_url?: string | null
          created_at?: string
          face_photo_url?: string | null
          gender?: string | null
          id?: string
          initial_weight?: number | null
          motivation?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      challenge_weight_logs: {
        Row: {
          created_at: string
          day_number: number
          id: string
          logged_at: string
          user_id: string
          weight: number
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          logged_at?: string
          user_id: string
          weight: number
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          logged_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      chat_banned_words: {
        Row: {
          created_at: string
          id: string
          severity: string
          word: string
        }
        Insert: {
          created_at?: string
          id?: string
          severity?: string
          word: string
        }
        Update: {
          created_at?: string
          id?: string
          severity?: string
          word?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          deleted_reason: string | null
          id: string
          is_deleted: boolean
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_reason?: string | null
          id?: string
          is_deleted?: boolean
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_reason?: string | null
          id?: string
          is_deleted?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_reports: {
        Row: {
          created_at: string
          id: string
          message_id: string
          reason: string | null
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          reason?: string | null
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          reason?: string | null
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          comments_count: number
          created_at: string
          description: string
          id: string
          likes_count: number
          media_type: string
          updated_at: string
          user_id: string
          video_duration_seconds: number | null
          video_poster_url: string | null
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          comments_count?: number
          created_at?: string
          description: string
          id?: string
          likes_count?: number
          media_type?: string
          updated_at?: string
          user_id: string
          video_duration_seconds?: number | null
          video_poster_url?: string | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          comments_count?: number
          created_at?: string
          description?: string
          id?: string
          likes_count?: number
          media_type?: string
          updated_at?: string
          user_id?: string
          video_duration_seconds?: number | null
          video_poster_url?: string | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          image_url: string
          media_type: string
          storage_path: string | null
          user_id: string
          video_duration_seconds: number | null
          video_poster_url: string | null
          video_storage_path: string | null
          video_url: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url: string
          media_type?: string
          storage_path?: string | null
          user_id: string
          video_duration_seconds?: number | null
          video_poster_url?: string | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string
          media_type?: string
          storage_path?: string | null
          user_id?: string
          video_duration_seconds?: number | null
          video_poster_url?: string | null
          video_storage_path?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "community_stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "community_stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_goals: {
        Row: {
          calories: number
          carbohydrates: number
          created_at: string
          diet_objective: string
          fats: number
          id: string
          proteins: number
          user_id: string | null
        }
        Insert: {
          calories: number
          carbohydrates: number
          created_at?: string
          diet_objective: string
          fats: number
          id?: string
          proteins: number
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbohydrates?: number
          created_at?: string
          diet_objective?: string
          fats?: number
          id?: string
          proteins?: number
          user_id?: string | null
        }
        Relationships: []
      }
      daily_usage_limits: {
        Row: {
          count: number
          created_at: string
          feature: string
          id: string
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          feature: string
          id?: string
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          feature?: string
          id?: string
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      dm_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_conversations_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_conversations_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          read_at: string | null
          sender_id: string
          storage_path: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          sender_id: string
          storage_path?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          read_at?: string | null
          sender_id?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dm_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_records: {
        Row: {
          activity_type: string
          age: number
          calories_burned: number
          created_at: string
          date: string
          duration_minutes: number
          id: string
          intensity: string
          updated_at: string
          user_id: string
          weight: number
        }
        Insert: {
          activity_type: string
          age: number
          calories_burned: number
          created_at?: string
          date?: string
          duration_minutes: number
          id?: string
          intensity: string
          updated_at?: string
          user_id: string
          weight: number
        }
        Update: {
          activity_type?: string
          age?: number
          calories_burned?: number
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          intensity?: string
          updated_at?: string
          user_id?: string
          weight?: number
        }
        Relationships: []
      }
      fasting_records: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          protocol: string
          started_at: string
          target_hours: number
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          protocol?: string
          started_at?: string
          target_hours?: number
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          protocol?: string
          started_at?: string
          target_hours?: number
          user_id?: string
        }
        Relationships: []
      }
      favorite_meals: {
        Row: {
          calories: number
          carbohydrates: number
          created_at: string
          fats: number
          food_name: string
          id: string
          image_url: string | null
          last_used_at: string | null
          meal_type: string | null
          portion: string
          proteins: number
          updated_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          calories: number
          carbohydrates?: number
          created_at?: string
          fats?: number
          food_name: string
          id?: string
          image_url?: string | null
          last_used_at?: string | null
          meal_type?: string | null
          portion: string
          proteins?: number
          updated_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          calories?: number
          carbohydrates?: number
          created_at?: string
          fats?: number
          food_name?: string
          id?: string
          image_url?: string | null
          last_used_at?: string | null
          meal_type?: string | null
          portion?: string
          proteins?: number
          updated_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      food_catalog: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          common_portion_g: number
          common_portion_label: string
          community_suggestion_id: string | null
          created_at: string
          fats_per_100g: number
          id: string
          is_active: boolean
          name: string
          proteins_per_100g: number
          source: string
          updated_at: string
        }
        Insert: {
          calories_per_100g: number
          carbs_per_100g?: number
          category: string
          common_portion_g?: number
          common_portion_label?: string
          community_suggestion_id?: string | null
          created_at?: string
          fats_per_100g?: number
          id?: string
          is_active?: boolean
          name: string
          proteins_per_100g?: number
          source?: string
          updated_at?: string
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          common_portion_g?: number
          common_portion_label?: string
          community_suggestion_id?: string | null
          created_at?: string
          fats_per_100g?: number
          id?: string
          is_active?: boolean
          name?: string
          proteins_per_100g?: number
          source?: string
          updated_at?: string
        }
        Relationships: []
      }
      food_catalog_suggestion_submissions: {
        Row: {
          created_at: string
          id: string
          suggestion_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          suggestion_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          suggestion_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_catalog_suggestion_submissions_suggestion_id_fkey"
            columns: ["suggestion_id"]
            isOneToOne: false
            referencedRelation: "food_catalog_suggestions"
            referencedColumns: ["id"]
          },
        ]
      }
      food_catalog_suggestions: {
        Row: {
          calories_per_100g: number
          carbs_per_100g: number
          category: string
          created_at: string
          display_name: string
          distinct_users_count: number
          fats_per_100g: number
          id: string
          last_seen_at: string
          name_normalized: string
          promoted_food_id: string | null
          proteins_per_100g: number
          status: string
          submissions_count: number
          updated_at: string
        }
        Insert: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          created_at?: string
          display_name: string
          distinct_users_count?: number
          fats_per_100g?: number
          id?: string
          last_seen_at?: string
          name_normalized: string
          promoted_food_id?: string | null
          proteins_per_100g?: number
          status?: string
          submissions_count?: number
          updated_at?: string
        }
        Update: {
          calories_per_100g?: number
          carbs_per_100g?: number
          category?: string
          created_at?: string
          display_name?: string
          distinct_users_count?: number
          fats_per_100g?: number
          id?: string
          last_seen_at?: string
          name_normalized?: string
          promoted_food_id?: string | null
          proteins_per_100g?: number
          status?: string
          submissions_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      generated_posts: {
        Row: {
          audience: string | null
          caption: string | null
          created_at: string
          cta: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          post_type: string
          theme: string
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          audience?: string | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          post_type: string
          theme: string
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          audience?: string | null
          caption?: string | null
          created_at?: string
          cta?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          post_type?: string
          theme?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_banners: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          storage_path: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          storage_path: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          storage_path?: string
        }
        Relationships: []
      }
      hydration_records: {
        Row: {
          beverage_key: string
          beverage_name: string
          calories: number
          consumed_at: string
          consumption_date: string
          created_at: string
          hydration_factor: number
          hydration_impact_ml: number
          id: string
          user_id: string
          volume_ml: number
        }
        Insert: {
          beverage_key: string
          beverage_name: string
          calories?: number
          consumed_at?: string
          consumption_date?: string
          created_at?: string
          hydration_factor: number
          hydration_impact_ml: number
          id?: string
          user_id: string
          volume_ml: number
        }
        Update: {
          beverage_key?: string
          beverage_name?: string
          calories?: number
          consumed_at?: string
          consumption_date?: string
          created_at?: string
          hydration_factor?: number
          hydration_impact_ml?: number
          id?: string
          user_id?: string
          volume_ml?: number
        }
        Relationships: []
      }
      meal_records: {
        Row: {
          calories: number
          carbohydrates: number
          created_at: string
          fats: number
          food_name: string
          id: string
          image_url: string | null
          meal_time: string
          meal_type: string | null
          portion: string
          proteins: number
          user_id: string | null
        }
        Insert: {
          calories: number
          carbohydrates: number
          created_at?: string
          fats: number
          food_name: string
          id?: string
          image_url?: string | null
          meal_time: string
          meal_type?: string | null
          portion: string
          proteins: number
          user_id?: string | null
        }
        Update: {
          calories?: number
          carbohydrates?: number
          created_at?: string
          fats?: number
          food_name?: string
          id?: string
          image_url?: string | null
          meal_time?: string
          meal_type?: string | null
          portion?: string
          proteins?: number
          user_id?: string | null
        }
        Relationships: []
      }
      menstrual_cycles: {
        Row: {
          created_at: string
          cycle_length_days: number
          cycle_start_date: string
          flow: string | null
          id: string
          mood: string | null
          notes: string | null
          period_length_days: number
          symptoms: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          cycle_length_days?: number
          cycle_start_date: string
          flow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          period_length_days?: number
          symptoms?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          cycle_length_days?: number
          cycle_start_date?: string
          flow?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          period_length_days?: number
          symptoms?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications_sent: {
        Row: {
          created_at: string | null
          id: string
          message: string
          recipients_count: number | null
          sent_at: string | null
          sent_by: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          recipients_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          recipients_count?: number | null
          sent_at?: string | null
          sent_by?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      nutritionist_ads: {
        Row: {
          city: string
          consultation_price: number | null
          created_at: string
          email: string
          id: string
          logo_url: string | null
          name: string
          phone_ddd: string
          phone_number: string
          photo_url: string | null
          specialties: string[] | null
          specialty: Database["public"]["Enums"]["nutrition_specialty"]
          state: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          city: string
          consultation_price?: number | null
          created_at?: string
          email: string
          id?: string
          logo_url?: string | null
          name: string
          phone_ddd: string
          phone_number: string
          photo_url?: string | null
          specialties?: string[] | null
          specialty: Database["public"]["Enums"]["nutrition_specialty"]
          state: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          city?: string
          consultation_price?: number | null
          created_at?: string
          email?: string
          id?: string
          logo_url?: string | null
          name?: string
          phone_ddd?: string
          phone_number?: string
          photo_url?: string | null
          specialties?: string[] | null
          specialty?: Database["public"]["Enums"]["nutrition_specialty"]
          state?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      physical_assessments: {
        Row: {
          after_photo_url: string | null
          assessment_date: string
          before_photo_url: string | null
          body_fat_percentage: number | null
          created_at: string | null
          fat_mass: number | null
          height: number | null
          id: string
          lean_mass: number | null
          neck: number | null
          notes: string | null
          updated_at: string | null
          user_id: string
          waist: number | null
          weight: number | null
        }
        Insert: {
          after_photo_url?: string | null
          assessment_date?: string
          before_photo_url?: string | null
          body_fat_percentage?: number | null
          created_at?: string | null
          fat_mass?: number | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          neck?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          waist?: number | null
          weight?: number | null
        }
        Update: {
          after_photo_url?: string | null
          assessment_date?: string
          before_photo_url?: string | null
          body_fat_percentage?: number | null
          created_at?: string | null
          fat_mass?: number | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          neck?: number | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_ideas_weekly: {
        Row: {
          created_at: string
          id: string
          ideas: Json
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          ideas?: Json
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          ideas?: Json
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_ideas_weekly_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      preconception_checklist: {
        Row: {
          checked_at: string
          id: string
          item_key: string
          user_id: string
        }
        Insert: {
          checked_at?: string
          id?: string
          item_key: string
          user_id: string
        }
        Update: {
          checked_at?: string
          id?: string
          item_key?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          basal_metabolic_rate: number | null
          bio: string | null
          city: string | null
          cover_url: string | null
          created_at: string
          email_public: string | null
          hydration_goal_ml: number
          id: string
          motivational_category: string | null
          name: string
          phone: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          basal_metabolic_rate?: number | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email_public?: string | null
          hydration_goal_ml?: number
          id: string
          motivational_category?: string | null
          name: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          basal_metabolic_rate?: number | null
          bio?: string | null
          city?: string | null
          cover_url?: string | null
          created_at?: string
          email_public?: string | null
          hydration_goal_ml?: number
          id?: string
          motivational_category?: string | null
          name?: string
          phone?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provador_generations: {
        Row: {
          created_at: string
          id: string
          outfit_image_url: string | null
          result_url: string
          user_id: string
          user_image_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          outfit_image_url?: string | null
          result_url: string
          user_id: string
          user_image_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          outfit_image_url?: string | null
          result_url?: string
          user_id?: string
          user_image_url?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_attempt_answers: {
        Row: {
          attempt_id: string
          chosen_index: number
          created_at: string
          id: string
          is_correct: boolean
          points_awarded: number
          question_id: string
          time_ms: number
        }
        Insert: {
          attempt_id: string
          chosen_index: number
          created_at?: string
          id?: string
          is_correct: boolean
          points_awarded?: number
          question_id: string
          time_ms?: number
        }
        Update: {
          attempt_id?: string
          chosen_index?: number
          created_at?: string
          id?: string
          is_correct?: boolean
          points_awarded?: number
          question_id?: string
          time_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "quiz_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions_public"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_attempts: {
        Row: {
          correct_count: number
          finished_at: string | null
          id: string
          is_perfect: boolean
          pro_bonus_applied: boolean
          quiz_id: string
          score: number
          started_at: string
          total_questions: number
          total_time_ms: number
          user_id: string
        }
        Insert: {
          correct_count?: number
          finished_at?: string | null
          id?: string
          is_perfect?: boolean
          pro_bonus_applied?: boolean
          quiz_id: string
          score?: number
          started_at?: string
          total_questions?: number
          total_time_ms?: number
          user_id: string
        }
        Update: {
          correct_count?: number
          finished_at?: string | null
          id?: string
          is_perfect?: boolean
          pro_bonus_applied?: boolean
          quiz_id?: string
          score?: number
          started_at?: string
          total_questions?: number
          total_time_ms?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_index: number
          created_at: string
          explanation: string | null
          id: string
          options: Json
          position: number
          prompt: string
          quiz_id: string
        }
        Insert: {
          correct_index: number
          created_at?: string
          explanation?: string | null
          id?: string
          options: Json
          position?: number
          prompt: string
          quiz_id: string
        }
        Update: {
          correct_index?: number
          created_at?: string
          explanation?: string | null
          id?: string
          options?: Json
          position?: number
          prompt?: string
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          id: string
          published_at: string | null
          status: string
          theme: string
          time_per_question_seconds: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          published_at?: string | null
          status?: string
          theme?: string
          time_per_question_seconds?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          id?: string
          published_at?: string | null
          status?: string
          theme?: string
          time_per_question_seconds?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          nome: string
          recipe_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          nome: string
          recipe_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          nome?: string
          recipe_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      registration_tokens: {
        Row: {
          created_at: string
          created_user_id: string | null
          email: string
          expires_at: string
          id: string
          is_used: boolean
          name: string
          plan_months: number
          plan_type: string
          subscription_end: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          created_user_id?: string | null
          email: string
          expires_at: string
          id?: string
          is_used?: boolean
          name: string
          plan_months: number
          plan_type: string
          subscription_end: string
          token?: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          created_user_id?: string | null
          email?: string
          expires_at?: string
          id?: string
          is_used?: boolean
          name?: string
          plan_months?: number
          plan_type?: string
          subscription_end?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_whatsapp_sent_at: string | null
          reminder_date: string
          reminder_time: string
          reminder_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_whatsapp_sent_at?: string | null
          reminder_date: string
          reminder_time: string
          reminder_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_whatsapp_sent_at?: string | null
          reminder_date?: string
          reminder_time?: string
          reminder_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      shopping_list_items: {
        Row: {
          category: string
          created_at: string
          display_order: number
          id: string
          is_purchased: boolean
          list_id: string
          name: string
          quantity: number
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_purchased?: boolean
          list_id: string
          name: string
          quantity?: number
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_purchased?: boolean
          list_id?: string
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string
          id: string
          is_archived: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_archived?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_records: {
        Row: {
          bedtime: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          quality_rating: number
          sleep_date: string
          tags: string[] | null
          user_id: string
          wake_time: string
        }
        Insert: {
          bedtime: string
          created_at?: string
          duration_minutes: number
          id?: string
          notes?: string | null
          quality_rating?: number
          sleep_date?: string
          tags?: string[] | null
          user_id: string
          wake_time: string
        }
        Update: {
          bedtime?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          quality_rating?: number
          sleep_date?: string
          tags?: string[] | null
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          payment_provider: string | null
          product_source: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_status: string | null
          subscription_tier: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          payment_provider?: string | null
          product_source?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          payment_provider?: string | null
          product_source?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_custom_diets: {
        Row: {
          created_at: string | null
          day_of_week: string
          description: string | null
          foods: Json | null
          id: string
          is_active: boolean | null
          meal_name: string
          meal_type: string
          total_calories: number | null
          total_carbs: number | null
          total_fats: number | null
          total_proteins: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          description?: string | null
          foods?: Json | null
          id?: string
          is_active?: boolean | null
          meal_name: string
          meal_type: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          description?: string | null
          foods?: Json | null
          id?: string
          is_active?: boolean | null
          meal_name?: string
          meal_type?: string
          total_calories?: number | null
          total_carbs?: number | null
          total_fats?: number | null
          total_proteins?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_menu_plans: {
        Row: {
          created_at: string
          id: string
          menu_data: Json
          preferences_snapshot: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_data: Json
          preferences_snapshot: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_data?: Json
          preferences_snapshot?: Json
          user_id?: string
        }
        Relationships: []
      }
      user_menu_preferences: {
        Row: {
          created_at: string
          favorite_ingredients: string
          id: string
          max_calories: number
          specific_requirements: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_ingredients: string
          id?: string
          max_calories?: number
          specific_requirements?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_ingredients?: string
          id?: string
          max_calories?: number
          specific_requirements?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_objectives: {
        Row: {
          created_at: string
          custom_keywords: string[] | null
          id: string
          is_active: boolean
          objective_key: string
          target_unit: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_keywords?: string[] | null
          id?: string
          is_active?: boolean
          objective_key: string
          target_unit?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_keywords?: string[] | null
          id?: string
          is_active?: boolean
          objective_key?: string
          target_unit?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_recipes: {
        Row: {
          calories_per_serving: number
          carbs_per_serving: number
          created_at: string
          description: string | null
          fats_per_serving: number
          id: string
          image_url: string | null
          ingredients: Json
          last_used_at: string | null
          name: string
          proteins_per_serving: number
          servings: number
          updated_at: string
          use_count: number
          user_id: string
        }
        Insert: {
          calories_per_serving?: number
          carbs_per_serving?: number
          created_at?: string
          description?: string | null
          fats_per_serving?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          last_used_at?: string | null
          name: string
          proteins_per_serving?: number
          servings?: number
          updated_at?: string
          use_count?: number
          user_id: string
        }
        Update: {
          calories_per_serving?: number
          carbs_per_serving?: number
          created_at?: string
          description?: string | null
          fats_per_serving?: number
          id?: string
          image_url?: string | null
          ingredients?: Json
          last_used_at?: string | null
          name?: string
          proteins_per_serving?: number
          servings?: number
          updated_at?: string
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          last_activity_date: string | null
          longest_streak: number
          streak_freezes: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          streak_freezes?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_activity_date?: string | null
          longest_streak?: number
          streak_freezes?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_bans: {
        Row: {
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          reason: string | null
          user_id: string
          venue_id: string
        }
        Insert: {
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id: string
          venue_id: string
        }
        Update: {
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          reason?: string | null
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_bans_banned_by_fkey"
            columns: ["banned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_bans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_bans_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_interactions: {
        Row: {
          created_at: string
          dm_conversation_id: string | null
          emoji: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string
          type: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          dm_conversation_id?: string | null
          emoji?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string
          type: string
          venue_id: string
        }
        Update: {
          created_at?: string
          dm_conversation_id?: string | null
          emoji?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string
          type?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_interactions_dm_conversation_id_fkey"
            columns: ["dm_conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_interactions_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_interactions_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_interactions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_memberships: {
        Row: {
          display_alias: string | null
          display_mode: string
          id: string
          joined_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          display_alias?: string | null
          display_mode?: string
          id?: string
          joined_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          display_alias?: string | null
          display_mode?: string
          id?: string
          joined_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_memberships_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_mystery_tip: boolean
          mystery_hint: string | null
          user_id: string
          venue_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_mystery_tip?: boolean
          mystery_hint?: string | null
          user_id: string
          venue_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_mystery_tip?: boolean
          mystery_hint?: string | null
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_messages_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_presence: {
        Row: {
          last_seen: string
          user_id: string
          venue_id: string
        }
        Insert: {
          last_seen?: string
          user_id: string
          venue_id: string
        }
        Update: {
          last_seen?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_presence_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_presence_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_reports: {
        Row: {
          created_at: string
          id: string
          message_id: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          status: string
          venue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason: string
          reported_user_id: string
          reporter_id: string
          status?: string
          venue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string | null
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          status?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_reports_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "venue_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_reports_reported_user_id_fkey"
            columns: ["reported_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venue_reports_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string | null
          category: string
          city: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          owner_id: string
          photo_url: string | null
          rules: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          category: string
          city: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          owner_id: string
          photo_url?: string | null
          rules?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: string
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          owner_id?: string
          photo_url?: string | null
          rules?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_summaries: {
        Row: {
          calories: number
          carbohydrates: number
          created_at: string | null
          date: string
          fats: number
          id: string
          proteins: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbohydrates?: number
          created_at?: string | null
          date: string
          fats?: number
          id?: string
          proteins?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbohydrates?: number
          created_at?: string | null
          date?: string
          fats?: number
          id?: string
          proteins?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          created_at: string | null
          direction: string
          error_message: string | null
          id: string
          media_url: string | null
          message_type: string
          metadata: Json | null
          phone_number: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          direction: string
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_type: string
          metadata?: Json | null
          phone_number: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          direction?: string
          error_message?: string | null
          id?: string
          media_url?: string | null
          message_type?: string
          metadata?: Json | null
          phone_number?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      whatsapp_subscriptions: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      workout_content: {
        Row: {
          activity_type: string
          calories: number | null
          content_type: string
          created_at: string
          description: string
          duration: number | null
          id: string
          is_active: boolean
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          activity_type: string
          calories?: number | null
          content_type: string
          created_at?: string
          description: string
          duration?: number | null
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          activity_type?: string
          calories?: number | null
          content_type?: string
          created_at?: string
          description?: string
          duration?: number | null
          id?: string
          is_active?: boolean
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          day_of_week: string
          exercises: Json
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          exercises?: Json
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          exercises?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      quiz_questions_public: {
        Row: {
          id: string | null
          options: Json | null
          position: number | null
          prompt: string | null
          quiz_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_access_venue: {
        Args: { _user_id: string; _venue_id: string }
        Returns: boolean
      }
      check_and_unlock_badges: {
        Args: { _user_id: string }
        Returns: undefined
      }
      expire_overdue_subscriptions: { Args: never; Returns: undefined }
      get_or_create_dm_conversation: {
        Args: { _other_user: string }
        Returns: string
      }
      get_quiz_play_questions: {
        Args: { _quiz_id: string }
        Returns: {
          options: Json
          prompt: string
          question_id: string
          question_position: number
          quiz_id: string
        }[]
      }
      get_quiz_ranking: {
        Args: { period?: string }
        Returns: {
          attempts_count: number
          avatar_url: string
          is_pro: boolean
          name: string
          total_score: number
          user_id: string
        }[]
      }
      get_venue_online_count: { Args: { _venue_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_venue_banned: {
        Args: { _user_id: string; _venue_id: string }
        Returns: boolean
      }
      is_venue_member: {
        Args: { _user_id: string; _venue_id: string }
        Returns: boolean
      }
      normalize_food_name: { Args: { _name: string }; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      nutrition_specialty:
        | "nutricao_clinica"
        | "nutricao_esportiva"
        | "nutricao_funcional"
        | "nutricao_estetica"
        | "nutricao_materno_infantil"
        | "nutricao_hospitalar"
        | "nutricao_coletiva"
        | "nutricao_saude_publica"
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
      app_role: ["admin", "moderator", "user"],
      nutrition_specialty: [
        "nutricao_clinica",
        "nutricao_esportiva",
        "nutricao_funcional",
        "nutricao_estetica",
        "nutricao_materno_infantil",
        "nutricao_hospitalar",
        "nutricao_coletiva",
        "nutricao_saude_publica",
      ],
    },
  },
} as const
