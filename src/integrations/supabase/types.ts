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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      handling_sessions: {
        Row: {
          approved_by: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          handling_id: string
          id: string
          location_id: string | null
          metadata: Json
          notes: string | null
          started_at: string
          status: string | null
        }
        Insert: {
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          handling_id: string
          id?: string
          location_id?: string | null
          metadata?: Json
          notes?: string | null
          started_at?: string
          status?: string | null
        }
        Update: {
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          handling_id?: string
          id?: string
          location_id?: string | null
          metadata?: Json
          notes?: string | null
          started_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "handling_sessions_handling_id_fkey"
            columns: ["handling_id"]
            isOneToOne: false
            referencedRelation: "handlings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handling_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      handlings: {
        Row: {
          box_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          destination: string
          draft_doc: string | null
          id: string
          location_id: string | null
          metadata: Json
          next_session_at: string | null
          nf_key: string | null
          owner_id: string | null
          protocol_id: string | null
          sender: string | null
          started_at: string
          status: string
        }
        Insert: {
          box_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string
          draft_doc?: string | null
          id?: string
          location_id?: string | null
          metadata?: Json
          next_session_at?: string | null
          nf_key?: string | null
          owner_id?: string | null
          protocol_id?: string | null
          sender?: string | null
          started_at?: string
          status?: string
        }
        Update: {
          box_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          destination?: string
          draft_doc?: string | null
          id?: string
          location_id?: string | null
          metadata?: Json
          next_session_at?: string | null
          nf_key?: string | null
          owner_id?: string | null
          protocol_id?: string | null
          sender?: string | null
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "handlings_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handlings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "handlings_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          metadata: Json
          name: string
          type: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name: string
          type?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json
          name?: string
          type?: string | null
        }
        Relationships: []
      }
      movement_files: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string | null
          id: string
          mime_type: string | null
          movement_id: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          movement_id: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          movement_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "movement_files_movement_id_fkey"
            columns: ["movement_id"]
            isOneToOne: false
            referencedRelation: "movements"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_types: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          label: string
          name: string
          requires_photo: boolean
          requires_temperature: boolean
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          name: string
          requires_photo?: boolean
          requires_temperature?: boolean
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          name?: string
          requires_photo?: boolean
          requires_temperature?: boolean
          sort_order?: number
        }
        Relationships: []
      }
      movements: {
        Row: {
          created_at: string
          created_by: string | null
          handling_id: string
          id: string
          location_id: string | null
          metadata: Json
          movement_session_id: string | null
          movement_type_id: string
          notes: string | null
          occurred_at: string
          session_id: string
          temperature_val: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          handling_id: string
          id?: string
          location_id?: string | null
          metadata?: Json
          movement_session_id?: string | null
          movement_type_id: string
          notes?: string | null
          occurred_at?: string
          session_id: string
          temperature_val?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          handling_id?: string
          id?: string
          location_id?: string | null
          metadata?: Json
          movement_session_id?: string | null
          movement_type_id?: string
          notes?: string | null
          occurred_at?: string
          session_id?: string
          temperature_val?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movements_handling_id_fkey"
            columns: ["handling_id"]
            isOneToOne: false
            referencedRelation: "handlings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_movement_type_id_fkey"
            columns: ["movement_type_id"]
            isOneToOne: false
            referencedRelation: "movement_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "handling_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      owners: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          metadata: Json
          name: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          role: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string
        }
        Relationships: []
      }
      protocol_files: {
        Row: {
          caption: string | null
          created_at: string
          file_name: string | null
          id: string
          mime_type: string | null
          protocol_id: string
          storage_path: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          protocol_id: string
          storage_path: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_name?: string | null
          id?: string
          mime_type?: string | null
          protocol_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocol_files_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          cold_storage_days: number | null
          created_at: string
          ice_change_interval_hours: number | null
          ice_model: string | null
          id: string
          instructions: string | null
          max_temp: number | null
          medication: string
          metadata: Json
          min_temp: number | null
          owner_id: string
          updated_at: string
        }
        Insert: {
          cold_storage_days?: number | null
          created_at?: string
          ice_change_interval_hours?: number | null
          ice_model?: string | null
          id?: string
          instructions?: string | null
          max_temp?: number | null
          medication: string
          metadata?: Json
          min_temp?: number | null
          owner_id: string
          updated_at?: string
        }
        Update: {
          cold_storage_days?: number | null
          created_at?: string
          ice_change_interval_hours?: number | null
          ice_model?: string | null
          id?: string
          instructions?: string | null
          max_temp?: number | null
          medication?: string
          metadata?: Json
          min_temp?: number | null
          owner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "protocols_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "owners"
            referencedColumns: ["id"]
          },
        ]
      }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "user" | "driver"
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
      app_role: ["admin", "supervisor", "user", "driver"],
    },
  },
} as const
