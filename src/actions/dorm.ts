"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerReady, resolveDataSourceMode, type DataSourceMode } from "@/lib/supabase/env";
import {
  deleteAssignment,
  fetchAssignments,
  insertAssignment,
  updateAssignment,
} from "@/lib/supabase/queries/assignments";
import {
  deletePayment,
  fetchPayments,
  insertPayment,
  updatePayment,
} from "@/lib/supabase/queries/payments";
import {
  deleteRoom,
  fetchRooms,
  insertRoom,
  updateRoom,
} from "@/lib/supabase/queries/rooms";
import {
  deleteStudent,
  fetchStudents,
  insertStudent,
  updateStudent,
} from "@/lib/supabase/queries/students";
import { syncRoomOccupancy } from "@/lib/supabase/sync-rooms";
import { uploadRoomImage } from "@/lib/supabase/storage/room-images";
import { validateRoomImageFile } from "@/lib/room-image";
import type { Assignment, Payment, Room, Student } from "@/types/entities";
import {
  advancePaymentToNextMonth,
  buildActiveBillFromPayment,
  buildPaymentHistoryRecord,
} from "@/lib/recurring-payments";

export type DormData = {
  students: Student[];
  rooms: Room[];
  assignments: Assignment[];
  payments: Payment[];
};

export async function getDataSourceMode(): Promise<DataSourceMode> {
  return resolveDataSourceMode();
}

function getClient() {
  if (!isSupabaseServerReady()) {
    throw new Error("Supabase is not fully configured. Add all keys to .env.");
  }
  return createAdminClient();
}

export async function loadDormData(): Promise<DormData | null> {
  if (!isSupabaseServerReady()) return null;

  const supabase = getClient();
  const [students, rooms, assignments, payments] = await Promise.all([
    fetchStudents(supabase),
    fetchRooms(supabase),
    fetchAssignments(supabase),
    fetchPayments(supabase),
  ]);

  return { students, rooms, assignments, payments };
}

export async function addStudentAction(
  student: Omit<Student, "id" | "assignedRoomId">,
): Promise<DormData> {
  const supabase = getClient();
  await insertStudent(supabase, student);
  return (await loadDormData())!;
}

export async function updateStudentAction(
  id: number,
  updates: Partial<Student>,
): Promise<DormData> {
  const supabase = getClient();
  await updateStudent(supabase, id, updates);
  return (await loadDormData())!;
}

export async function deleteStudentAction(id: number): Promise<DormData> {
  const supabase = getClient();
  await deleteStudent(supabase, id);
  await syncRoomOccupancy(supabase);
  return (await loadDormData())!;
}

export async function uploadRoomImageAction(formData: FormData): Promise<string> {
  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No image file provided.");
  }

  const validationError = validateRoomImageFile(file);
  if (validationError) throw new Error(validationError);

  const supabase = getClient();
  return uploadRoomImage(supabase, file);
}

export async function addRoomAction(
  room: Omit<Room, "id" | "currentOccupancy" | "status">,
): Promise<DormData> {
  const supabase = getClient();
  await insertRoom(supabase, room);
  return (await loadDormData())!;
}

export async function updateRoomAction(id: number, updates: Partial<Room>): Promise<DormData> {
  const supabase = getClient();
  await updateRoom(supabase, id, updates);
  await syncRoomOccupancy(supabase);
  return (await loadDormData())!;
}

export async function deleteRoomAction(id: number): Promise<DormData> {
  const supabase = getClient();
  await deleteRoom(supabase, id);
  await syncRoomOccupancy(supabase);
  return (await loadDormData())!;
}

export async function assignStudentToRoomAction(
  studentId: number,
  roomId: number,
): Promise<DormData> {
  const supabase = getClient();
  const [rooms, assignments] = await Promise.all([
    fetchRooms(supabase),
    fetchAssignments(supabase),
  ]);

  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Room not found");

  const occupancy = assignments.filter((a) => a.roomId === roomId).length;
  if (occupancy >= room.capacity) {
    throw new Error(`Room ${room.roomNumber} is already full`);
  }

  const existing = assignments.find((a) => a.studentId === studentId);
  if (existing) {
    await updateAssignment(supabase, existing.id, { roomId });
  } else {
    await insertAssignment(supabase, {
      studentId,
      roomId,
      assignedAt: new Date().toISOString(),
    });
  }

  await updateStudent(supabase, studentId, { assignedRoomId: roomId });
  await syncRoomOccupancy(supabase);
  return (await loadDormData())!;
}

export async function removeAssignmentAction(assignmentId: number): Promise<DormData> {
  const supabase = getClient();
  const assignments = await fetchAssignments(supabase);
  const assignment = assignments.find((a) => a.id === assignmentId);
  if (!assignment) throw new Error("Assignment not found");

  await deleteAssignment(supabase, assignmentId);
  await updateStudent(supabase, assignment.studentId, { assignedRoomId: null });
  await syncRoomOccupancy(supabase);
  return (await loadDormData())!;
}

export async function addPaymentAction(payment: Omit<Payment, "id">): Promise<DormData> {
  const supabase = getClient();

  if (payment.status === "paid") {
    const snapshot = { ...payment, id: 0 } as Payment;
    await insertPayment(supabase, buildPaymentHistoryRecord(snapshot));
    await insertPayment(supabase, buildActiveBillFromPayment(snapshot));
  } else {
    await insertPayment(supabase, payment);
  }

  return (await loadDormData())!;
}

export async function updatePaymentAction(
  id: number,
  updates: Partial<Payment>,
): Promise<DormData> {
  const supabase = getClient();
  await updatePayment(supabase, id, updates);
  return (await loadDormData())!;
}

export async function deletePaymentAction(id: number): Promise<DormData> {
  const supabase = getClient();
  await deletePayment(supabase, id);
  return (await loadDormData())!;
}

export async function markPaymentPaidAction(id: number): Promise<DormData> {
  const supabase = getClient();
  const payments = await fetchPayments(supabase);
  const payment = payments.find((p) => p.id === id);
  if (!payment) throw new Error("Payment not found");

  await insertPayment(supabase, buildPaymentHistoryRecord(payment));
  await updatePayment(supabase, id, advancePaymentToNextMonth(payment));

  return (await loadDormData())!;
}
