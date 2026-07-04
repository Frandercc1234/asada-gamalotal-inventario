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
      categorias: {
        Row: {
          activo: boolean
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          descripcion?: string | null
          id?: never
          nombre?: string
        }
        Relationships: []
      }
      movimientos: {
        Row: {
          cantidad: number
          created_at: string
          id: number
          motivo: string | null
          producto_id: number
          stock_resultante: number
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
          usuario_id: string
        }
        Insert: {
          cantidad: number
          created_at?: string
          id?: never
          motivo?: string | null
          producto_id: number
          stock_resultante: number
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
          usuario_id: string
        }
        Update: {
          cantidad?: number
          created_at?: string
          id?: never
          motivo?: string | null
          producto_id?: number
          stock_resultante?: number
          tipo?: Database["public"]["Enums"]["tipo_movimiento"]
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimientos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "v_alertas_stock"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimientos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      productos: {
        Row: {
          activo: boolean
          categoria_id: number | null
          codigo: string
          created_at: string
          descripcion: string | null
          id: number
          imagen_url: string | null
          nombre: string
          precio: number
          proveedor_id: number | null
          stock_actual: number
          stock_minimo: number
          unidad: string
          updated_at: string
        }
        Insert: {
          activo?: boolean
          categoria_id?: number | null
          codigo: string
          created_at?: string
          descripcion?: string | null
          id?: never
          imagen_url?: string | null
          nombre: string
          precio?: number
          proveedor_id?: number | null
          stock_actual?: number
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean
          categoria_id?: number | null
          codigo?: string
          created_at?: string
          descripcion?: string | null
          id?: never
          imagen_url?: string | null
          nombre?: string
          precio?: number
          proveedor_id?: number | null
          stock_actual?: number
          stock_minimo?: number
          unidad?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "productos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productos_proveedor_id_fkey"
            columns: ["proveedor_id"]
            isOneToOne: false
            referencedRelation: "proveedores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          rol: Database["public"]["Enums"]["rol_usuario"]
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id: string
          nombre: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
        }
        Relationships: []
      }
      proveedores: {
        Row: {
          activo: boolean
          contacto: string | null
          created_at: string
          email: string | null
          id: number
          nombre: string
          telefono: string | null
        }
        Insert: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: never
          nombre: string
          telefono?: string | null
        }
        Update: {
          activo?: boolean
          contacto?: string | null
          created_at?: string
          email?: string | null
          id?: never
          nombre?: string
          telefono?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_alertas_stock: {
        Row: {
          codigo: string | null
          id: number | null
          nombre: string | null
          stock_actual: number | null
          stock_minimo: number | null
        }
        Insert: {
          codigo?: string | null
          id?: number | null
          nombre?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
        }
        Update: {
          codigo?: string | null
          id?: number | null
          nombre?: string | null
          stock_actual?: number | null
          stock_minimo?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      mi_rol: {
        Args: never
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
      registrar_movimiento: {
        Args: {
          p_cantidad: number
          p_motivo: string
          p_producto_id: number
          p_tipo: Database["public"]["Enums"]["tipo_movimiento"]
        }
        Returns: {
          cantidad: number
          created_at: string
          id: number
          motivo: string | null
          producto_id: number
          stock_resultante: number
          tipo: Database["public"]["Enums"]["tipo_movimiento"]
          usuario_id: string
        }
        SetofOptions: {
          from: "*"
          to: "movimientos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      rol_usuario: "admin" | "operador"
      tipo_movimiento: "entrada" | "salida"
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
      rol_usuario: ["admin", "operador"],
      tipo_movimiento: ["entrada", "salida"],
    },
  },
} as const

// Alias de dominio (uso interno de la app)
export type Producto = Tables<"productos">
export type Categoria = Tables<"categorias">
export type Proveedor = Tables<"proveedores">
export type Movimiento = Tables<"movimientos">
export type Profile = Tables<"profiles">
export type AlertaStock = Tables<"v_alertas_stock">
export type RolUsuario = Database["public"]["Enums"]["rol_usuario"]
export type TipoMovimiento = Database["public"]["Enums"]["tipo_movimiento"]
