import type { Tables } from "@/types/database";
import type { Assignment, Payment, Room, Student } from "@/types/entities";

export function mapStudentRow(row: Tables<"students">): Student {
  return {
    id: row.id,
    name: row.name,
    studentId: row.student_id,
    course: row.course,
    department: row.department,
    contactNumber: row.contact_number,
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
