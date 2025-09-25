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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      building_types: {
        Row: {
          base_cost: number
          base_production: number
          id: string
          name: string
          power_consumption: number
          produces_resource: string | null
        }
        Insert: {
          base_cost?: number
          base_production?: number
          id?: string
          name: string
          power_consumption?: number
          produces_resource?: string | null
        }
        Update: {
          base_cost?: number
          base_production?: number
          id?: string
          name?: string
          power_consumption?: number
          produces_resource?: string | null
        }
        Relationships: []
      }
      buildings: {
        Row: {
          building_type_id: string
          built_at: string
          colony_id: string
          id: string
          level: number
        }
        Insert: {
          building_type_id: string
          built_at?: string
          colony_id: string
          id?: string
          level?: number
        }
        Update: {
          building_type_id?: string
          built_at?: string
          colony_id?: string
          id?: string
          level?: number
        }
        Relationships: [
          {
            foreignKeyName: "buildings_building_type_id_fkey"
            columns: ["building_type_id"]
            isOneToOne: false
            referencedRelation: "building_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buildings_colony_id_fkey"
            columns: ["colony_id"]
            isOneToOne: false
            referencedRelation: "colonies"
            referencedColumns: ["id"]
          },
        ]
      }
      colonies: {
        Row: {
          colonized_at: string
          food_stockpile: number
          fuel_stockpile: number
          id: string
          metal_stockpile: number
          planet_id: string
          player_id: string
          population: number
        }
        Insert: {
          colonized_at?: string
          food_stockpile?: number
          fuel_stockpile?: number
          id?: string
          metal_stockpile?: number
          planet_id: string
          player_id: string
          population?: number
        }
        Update: {
          colonized_at?: string
          food_stockpile?: number
          fuel_stockpile?: number
          id?: string
          metal_stockpile?: number
          planet_id?: string
          player_id?: string
          population?: number
        }
        Relationships: [
          {
            foreignKeyName: "colonies_planet_id_fkey"
            columns: ["planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colonies_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          objective_type: string
          reward_credits: number
          target_planet_id: string | null
          target_value: number | null
          time_limit_hours: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          objective_type: string
          reward_credits?: number
          target_planet_id?: string | null
          target_value?: number | null
          time_limit_hours?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          objective_type?: string
          reward_credits?: number
          target_planet_id?: string | null
          target_value?: number | null
          time_limit_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_target_planet_id_fkey"
            columns: ["target_planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
        ]
      }
      planets: {
        Row: {
          base_temperature: number
          created_at: string
          id: string
          name: string
          planet_type: string
          position_x: number
          position_y: number
          position_z: number
        }
        Insert: {
          base_temperature?: number
          created_at?: string
          id?: string
          name: string
          planet_type?: string
          position_x?: number
          position_y?: number
          position_z?: number
        }
        Update: {
          base_temperature?: number
          created_at?: string
          id?: string
          name?: string
          planet_type?: string
          position_x?: number
          position_y?: number
          position_z?: number
        }
        Relationships: []
      }
      player_missions: {
        Row: {
          completed_at: string | null
          id: string
          mission_id: string
          player_id: string
          started_at: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          mission_id: string
          player_id: string
          started_at?: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          mission_id?: string
          player_id?: string
          started_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_missions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          credits: number
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      research_progress: {
        Row: {
          allocation_percentage: number
          completed_at: string | null
          id: string
          player_id: string
          progress_points: number
          technology_id: string
        }
        Insert: {
          allocation_percentage?: number
          completed_at?: string | null
          id?: string
          player_id: string
          progress_points?: number
          technology_id: string
        }
        Update: {
          allocation_percentage?: number
          completed_at?: string | null
          id?: string
          player_id?: string
          progress_points?: number
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_progress_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "research_progress_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "research_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      research_technologies: {
        Row: {
          description: string | null
          id: string
          name: string
          prerequisite_tech_id: string | null
          research_cost: number
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          prerequisite_tech_id?: string | null
          research_cost: number
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          prerequisite_tech_id?: string | null
          research_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "research_technologies_prerequisite_tech_id_fkey"
            columns: ["prerequisite_tech_id"]
            isOneToOne: false
            referencedRelation: "research_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      ship_types: {
        Row: {
          build_cost: number
          cargo_capacity: number
          fuel_capacity: number
          id: string
          name: string
          passenger_capacity: number
          ship_class: string
        }
        Insert: {
          build_cost?: number
          cargo_capacity?: number
          fuel_capacity?: number
          id?: string
          name: string
          passenger_capacity?: number
          ship_class?: string
        }
        Update: {
          build_cost?: number
          cargo_capacity?: number
          fuel_capacity?: number
          id?: string
          name?: string
          passenger_capacity?: number
          ship_class?: string
        }
        Relationships: []
      }
      ships: {
        Row: {
          arrival_time: string | null
          built_at: string
          cargo_food: number
          cargo_fuel: number
          cargo_metal: number
          destination_planet_id: string | null
          fuel_current: number
          id: string
          location_planet_id: string | null
          name: string
          passengers: number
          player_id: string
          ship_type_id: string
          status: string
        }
        Insert: {
          arrival_time?: string | null
          built_at?: string
          cargo_food?: number
          cargo_fuel?: number
          cargo_metal?: number
          destination_planet_id?: string | null
          fuel_current?: number
          id?: string
          location_planet_id?: string | null
          name: string
          passengers?: number
          player_id: string
          ship_type_id: string
          status?: string
        }
        Update: {
          arrival_time?: string | null
          built_at?: string
          cargo_food?: number
          cargo_fuel?: number
          cargo_metal?: number
          destination_planet_id?: string | null
          fuel_current?: number
          id?: string
          location_planet_id?: string | null
          name?: string
          passengers?: number
          player_id?: string
          ship_type_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ships_destination_planet_id_fkey"
            columns: ["destination_planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ships_location_planet_id_fkey"
            columns: ["location_planet_id"]
            isOneToOne: false
            referencedRelation: "planets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ships_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ships_ship_type_id_fkey"
            columns: ["ship_type_id"]
            isOneToOne: false
            referencedRelation: "ship_types"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
