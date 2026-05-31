import {
  emptyRoomAmenities,
  type RoomAmenities,
  type RoomBedType,
  type RoomCategory,
} from "@/lib/room-amenities";
import type { Json, Tables } from "@/types/database";
import type { Gender } from "@/lib/gender";
import type { Assignment, Payment, Room, Student } from "@/types/entities";

function parseRoomAmenities(value: Json | null | undefined): RoomAmenities {
  const amenities = emptyRoomAmenities();
  if (!value || typeof value !== "object" || Array.isArray(value)) return amenities;

  for (const key of Object.keys(amenities) as (keyof RoomAmenities)[]) {
    const entry = (value as Record<string, unknown>)[key];
    if (typeof entry === "boolean") amenities[key] = entry;
  }

  return amenities;
}

export function mapStudentRow(row: Tables<"students">): Student {
  return {
    id: row.id,
    name: row.name,
    studentId: row.student_id,
    course: row.course,
    department: row.department,
    contactNumber: row.contact_number,
    email: row.email,
    gender: row.gender as Gender | null,
    assignedRoomId: row.assigned_room_id,
  };
}

export function mapRoomRow(row: Tables<"rooms">): Room {
  return {
    id: row.id,
    roomNumber: row.room_number,
    floor: row.floor,
    capacity: row.capacity,
    currentOccupancy: row.current_occupancy,
    status: row.status,
    imageUrl: row.image_url,
    bedType: row.bed_type as RoomBedType | null,
    amenities: parseRoomAmenities(row.amenities),
    category: row.category as RoomCategory | null,
  };
}

export function mapAssignmentRow(row: Tables<"assignments">): Assignment {
  return {
    id: row.id,
    studentId: row.student_id,
    roomId: row.room_id,
    assignedAt: row.assigned_at,
  };
}

export function mapPaymentRow(row: Tables<"payments">): Payment {
  return {
    id: row.id,
    studentId: row.student_id,
    amount: Number(row.amount),
    description: row.description,
    dueDate: row.due_date,
    paidDate: row.paid_date,
    status: row.status,
    period: row.period,
  };
}

export function studentToInsert(student: Omit<Student, "id" | "assignedRoomId">) {
  return {
    name: student.name,
    student_id: student.studentId,
    course: student.course,
    department: student.department,
    contact_number: student.contactNumber,
    email: student.email,
    gender: student.gender,
    assigned_room_id: null as number | null,
  };
}

export function roomToInsert(room: Omit<Room, "id" | "currentOccupancy" | "status">) {
  return {
    room_number: room.roomNumber,
    floor: room.floor,
    capacity: room.capacity,
    current_occupancy: 0,
    status: "available" as const,
    image_url: room.imageUrl,
    bed_type: room.bedType,
    amenities: room.amenities as Json,
    category: room.category,
  };
}

export function paymentToInsert(payment: Omit<Payment, "id">) {
  return {
    student_id: payment.studentId,
    amount: payment.amount,
    description: payment.description,
    due_date: payment.dueDate,
    paid_date: payment.paidDate,
    status: payment.status,
    period: payment.period,
  };
}
