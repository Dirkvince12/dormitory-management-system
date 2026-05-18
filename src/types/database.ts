export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type RoomStatus = "available" | "full" | "partial";
export type PaymentStatus = "paid" | "pending" | "overdue";

export type Database = {
  public: {
    Tables: {
      students: {
        Row: {
          id: number;
          name: string;
          student_id: string;
          course: string;
          department: string;
          contact_number: string;
          assigned_room_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          student_id: string;
          course: string;
          department: string;
          contact_number: string;
          assigned_room_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          student_id?: string;
          course?: string;
          department?: string;
          contact_number?: string;
          assigned_room_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "students_assigned_room_id_fkey";
            columns: ["assigned_room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      rooms: {
        Row: {
          id: number;
          room_number: string;
          floor: number;
          capacity: number;
          current_occupancy: number;
          status: RoomStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          room_number: string;
          floor: number;
          capacity: number;
          current_occupancy?: number;
          status?: RoomStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          room_number?: string;
          floor?: number;
          capacity?: number;
          current_occupancy?: number;
          status?: RoomStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      assignments: {
        Row: {
          id: number;
          student_id: number;
          room_id: number;
          assigned_at: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          student_id: number;
          room_id: number;
          assigned_at?: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          student_id?: number;
          room_id?: number;
          assigned_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "assignments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "assignments_room_id_fkey";
            columns: ["room_id"];
            isOneToOne: false;
            referencedRelation: "rooms";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: number;
          student_id: number;
          amount: number;
          description: string;
          due_date: string;
          paid_date: string | null;
          status: PaymentStatus;
          period: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          student_id: number;
          amount: number;
          description: string;
          due_date: string;
          paid_date?: string | null;
          status?: PaymentStatus;
          period: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          student_id?: number;
          amount?: number;
          description?: string;
          due_date?: string;
          paid_date?: string | null;
          status?: PaymentStatus;
          period?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      room_status: RoomStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
