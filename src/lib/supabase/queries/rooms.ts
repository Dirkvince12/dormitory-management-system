import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Room } from "@/types/entities";
import { throwSupabaseError } from "@/lib/supabase/errors";
import { mapRoomRow, roomToInsert } from "@/lib/supabase/mappers";

type Client = SupabaseClient<Database>;

export async function fetchRooms(supabase: Client): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("*")
    .order("room_number");

  if (error) throwSupabaseError(error);
  return (data ?? []).map(mapRoomRow);
}

export async function insertRoom(
  supabase: Client,
  room: Omit<Room, "id" | "currentOccupancy" | "status">,
): Promise<Room> {
  const { data, error } = await supabase
    .from("rooms")
    .insert(roomToInsert(room))
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapRoomRow(data);
}

export async function updateRoom(
  supabase: Client,
  id: number,
  updates: Partial<Room>,
): Promise<Room> {
  const { data, error } = await supabase
    .from("rooms")
    .update({
      ...(updates.roomNumber !== undefined && { room_number: updates.roomNumber }),
      ...(updates.floor !== undefined && { floor: updates.floor }),
      ...(updates.capacity !== undefined && { capacity: updates.capacity }),
      ...(updates.currentOccupancy !== undefined && { current_occupancy: updates.currentOccupancy }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.imageUrl !== undefined && { image_url: updates.imageUrl }),
      ...(updates.bedType !== undefined && { bed_type: updates.bedType }),
      ...(updates.amenities !== undefined && { amenities: updates.amenities }),
      ...(updates.category !== undefined && { category: updates.category }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throwSupabaseError(error);
  return mapRoomRow(data);
}

export async function deleteRoom(supabase: Client, id: number): Promise<void> {
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throwSupabaseError(error);
}
