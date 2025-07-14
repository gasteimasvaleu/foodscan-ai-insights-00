export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
        Relationships: []
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
      nutritionist_ads: {
        Row: {
          city: string
          consultation_price: number | null
          created_at: string
          id: string
          logo_url: string | null
          phone_ddd: string
          phone_number: string
          photo_url: string | null
          specialty: Database["public"]["Enums"]["nutrition_specialty"]
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          consultation_price?: number | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone_ddd: string
          phone_number: string
          photo_url?: string | null
          specialty: Database["public"]["Enums"]["nutrition_specialty"]
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          consultation_price?: number | null
          created_at?: string
          id?: string
          logo_url?: string | null
          phone_ddd?: string
          phone_number?: string
          photo_url?: string | null
          specialty?: Database["public"]["Enums"]["nutrition_specialty"]
          state?: string
          updated_at?: string
          user_id?: string
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
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
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
