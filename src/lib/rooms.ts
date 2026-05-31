import type { Assignment, Room } from "@/types/entities";

export function getRoomOccupancy(roomId: number, assignments: Assignment[]): number {
  return assignments.filter((a) => a.roomId === roomId).length;
}

export function isRoomFull(room: Room, assignments: Assignment[]): boolean {
  const occupancy = getRoomOccupancy(room.id, assignments);
  return occupancy >= room.capacity;
}

export function getAvailableBeds(room: Room, assignments: Assignment[]): number {
  const occupancy = getRoomOccupancy(room.id, assignments);
  return Math.max(0, room.capacity - occupancy);
}

export function syncRoomsWithAssignments(assignments: Assignment[], rooms: Room[]): Room[] {
  return rooms.map((room) => {
    const occupancy = getRoomOccupancy(room.id, assignments);
    let status: Room["status"] = "available";
    if (occupancy >= room.capacity) status = "full";
    else if (occupancy > 0) status = "partial";
    return { ...room, currentOccupancy: occupancy, status };
  });
}

export function getRoomsAvailableForAssignment(rooms: Room[], assignments: Assignment[]): Room[] {
  return rooms.filter((room) => !isRoomFull(room, assignments));
}

/** Rooms a student can pick — includes their current room even when it is full. */
export function getRoomsForStudentAssignment(
  rooms: Room[],
  assignments: Assignment[],
  assignedRoomId: number | null,
): Room[] {
  const available = getRoomsAvailableForAssignment(rooms, assignments);
  if (assignedRoomId === null) return available;

  const currentRoom = rooms.find((room) => room.id === assignedRoomId);
  if (!currentRoom || available.some((room) => room.id === assignedRoomId)) {
    return available;
  }

  return [...available, currentRoom];
}
