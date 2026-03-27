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
      community_posts: {
        Row: {
          after_photo_url: string | null
          before_photo_url: string | null
          comments_count: number
          created_at: string
          description: string
          id: string
          likes_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          comments_count?: number
          created_at?: string
          description: string
          id?: string
          likes_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          after_photo_url?: string | null
          before_photo_url?: string | null
          comments_count?: number
          created_at?: string
          description?: string
          id?: string
          likes_count?: number
          updated_at?: string
          user_id?: string
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
      meal_records: {
        Row: {
          calories: number
          carbohydrates: number
          created_at: string
          fats: number
          food_name: string
          id: string
          meal_time: string
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
          meal_time: string
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
          meal_time?: string
          portion?: string
          proteins?: number
          user_id?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          basal_metabolic_rate: number | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          basal_metabolic_rate?: number | null
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          basal_metabolic_rate?: number | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          payment_provider: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          payment_provider?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          payment_provider?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
      expire_overdue_subscriptions: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
