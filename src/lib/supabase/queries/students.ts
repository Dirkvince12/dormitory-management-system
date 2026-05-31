import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Student } from "@/types/entities";
import { throwSupabaseError } from "@/lib/supabase/errors";
import { mapStudentRow, studentToInsert } from "@/lib/supabase/mappers";

type Client = SupabaseClient<Database>;

export async function fetchStudents(supabase: Client): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("name");

  if (error) throwSupabaseError(error);
  return (data ?? []).map(mapStudentRow);
}

export async function insertStudent(
  supabase: Client,
  student: Omit<Student, "id" | "assignedRoomId">,
): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .insert(studentToInsert(student))
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapStudentRow(data);
}

export async function updateStudent(
  supabase: Client,
  id: number,
  updates: Partial<Student>,
): Promise<Student> {
  const { data, error } = await supabase
    .from("students")
    .update({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.studentId !== undefined && { student_id: updates.studentId }),
      ...(updates.course !== undefined && { course: updates.course }),
      ...(updates.department !== undefined && { department: updates.department }),
      ...(updates.contactNumber !== undefined && { contact_number: updates.contactNumber }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.gender !== undefined && { gender: updates.gender }),
      ...(updates.assignedRoomId !== undefined && { assigned_room_id: updates.assignedRoomId }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapStudentRow(data);
}

export async function deleteStudent(supabase: Client, id: number): Promise<void> {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throwSupabaseError(error);
}
