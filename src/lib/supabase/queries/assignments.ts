import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Assignment } from "@/types/entities";
import { throwSupabaseError } from "@/lib/supabase/errors";
import { mapAssignmentRow } from "@/lib/supabase/mappers";

type Client = SupabaseClient<Database>;

export async function fetchAssignments(supabase: Client): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .order("assigned_at", { ascending: false });

  if (error) throwSupabaseError(error);
  return (data ?? []).map(mapAssignmentRow);
}

export async function insertAssignment(
  supabase: Client,
  assignment: Omit<Assignment, "id">,
): Promise<Assignment> {
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      student_id: assignment.studentId,
      room_id: assignment.roomId,
      assigned_at: assignment.assignedAt,
    })
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapAssignmentRow(data);
}

export async function updateAssignment(
  supabase: Client,
  id: number,
  updates: Partial<Pick<Assignment, "roomId" | "assignedAt">>,
): Promise<Assignment> {
  const { data, error } = await supabase
    .from("assignments")
    .update({
      ...(updates.roomId !== undefined && { room_id: updates.roomId }),
      ...(updates.assignedAt !== undefined && { assigned_at: updates.assignedAt }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapAssignmentRow(data);
}

export async function deleteAssignment(supabase: Client, id: number): Promise<void> {
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throwSupabaseError(error);
}
