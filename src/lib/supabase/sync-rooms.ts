import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { RoomStatus } from "@/types/entities";
import { fetchAssignments } from "@/lib/supabase/queries/assignments";
import { fetchRooms, updateRoom } from "@/lib/supabase/queries/rooms";

type Client = SupabaseClient<Database>;

export async function syncRoomOccupancy(supabase: Client): Promise<void> {
  const [assignments, rooms] = await Promise.all([
    fetchAssignments(supabase),
    fetchRooms(supabase),
  ]);

  await Promise.all(
    rooms.map((room) => {
      const occupancy = assignments.filter((a) => a.roomId === room.id).length;
      let status: RoomStatus = "available";
      if (occupancy >= room.capacity) status = "full";
      else if (occupancy > 0) status = "partial";

      return updateRoom(supabase, room.id, {
        currentOccupancy: occupancy,
        status,
      });
    }),
  );
}
