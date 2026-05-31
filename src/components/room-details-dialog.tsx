"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RoomThumbnail } from "@/components/room-thumbnail";
import { getOccupantsForRoom } from "@/components/room-occupants-cell";
import { getAvailableBeds } from "@/lib/rooms";
import {
  getBedTypeLabel,
  getRoomCategoryLabel,
  listSelectedAmenities,
} from "@/lib/room-amenities";
import type { Assignment, Room, Student } from "@/lib/store";
import { Building2, Users } from "lucide-react";

function statusClass(status: Room["status"]) {
  switch (status) {
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "partial":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "full":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
  }
}

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

type RoomDetailsDialogProps = {
  room: Room | null;
  assignments: Assignment[];
  students: Student[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function RoomDetailsDialog({
  room,
  assignments,
  students,
  open,
  onOpenChange,
}: RoomDetailsDialogProps) {
  if (!room) return null;

  const occupants = getOccupantsForRoom(room.id, assignments, students);
  const bedsAvailable = getAvailableBeds(room, assignments);
  const occupancyPercent = room.capacity > 0 ? (room.currentOccupancy / room.capacity) * 100 : 0;
  const bedLabel = getBedTypeLabel(room.bedType);
  const categoryLabel = getRoomCategoryLabel(room.category);
  const selectedAmenities = listSelectedAmenities(room.amenities);

  const assignmentByStudentId = new Map(
    assignments.filter((a) => a.roomId === room.id).map((a) => [a.studentId, a]),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="space-y-1 px-6 pt-6 pb-4 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Room {room.roomNumber}
          </DialogTitle>
          <DialogDescription>Room information and current occupants</DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(70vh,32rem)] overflow-y-auto px-6 pb-6 space-y-5">
          <div className="flex justify-center">
            <RoomThumbnail imageUrl={room.imageUrl} roomNumber={room.roomNumber} size="lg" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <DetailItem label="Category" value={categoryLabel ?? "—"} />
            <DetailItem label="Floor" value={room.floor} />
            <DetailItem label="Capacity" value={`${room.capacity} bed${room.capacity === 1 ? "" : "s"}`} />
            <DetailItem
              label="Status"
              value={
                <Badge variant="outline" className={`capitalize border-0 w-fit ${statusClass(room.status)}`}>
                  {room.status}
                </Badge>
              }
            />
            <DetailItem label="Occupied" value={`${room.currentOccupancy} / ${room.capacity}`} />
            <DetailItem
              label="Beds available"
              value={bedsAvailable === 0 ? "None" : `${bedsAvailable} bed${bedsAvailable === 1 ? "" : "s"}`}
            />
            <DetailItem label="Room ID" value={`#${room.id}`} />
            <DetailItem label="Bed configuration" value={bedLabel ?? "—"} />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Amenities
            </p>
            {selectedAmenities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No amenities listed.</p>
            ) : (
              <ul className="flex flex-wrap gap-1.5">
                {selectedAmenities.map((label) => (
                  <li key={label}>
                    <Badge variant="secondary" className="font-normal">
                      {label}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Occupancy</span>
              <span className="font-medium">{Math.round(occupancyPercent)}%</span>
            </div>
            <Progress value={occupancyPercent} className="h-2" />
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold">
                Occupants ({occupants.length})
              </h3>
            </div>

            {occupants.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center">
                No students are assigned to this room.
              </p>
            ) : (
              <ul className="space-y-2">
                {occupants.map((student) => {
                  const assignment = assignmentByStudentId.get(student.id);
                  const assignedDate = assignment?.assignedAt
                    ? new Date(assignment.assignedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : null;

                  return (
                    <li
                      key={student.id}
                      className="rounded-lg border bg-muted/30 px-4 py-3 text-sm"
                    >
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{student.studentId}</p>
                      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground">
                        <div className="flex gap-2">
                          <dt className="shrink-0 font-medium text-foreground/80">Course:</dt>
                          <dd>{student.course}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="shrink-0 font-medium text-foreground/80">Department:</dt>
                          <dd>{student.department}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="shrink-0 font-medium text-foreground/80">Email:</dt>
                          <dd>{student.email}</dd>
                        </div>
                        <div className="flex gap-2">
                          <dt className="shrink-0 font-medium text-foreground/80">Contact:</dt>
                          <dd>{student.contactNumber}</dd>
                        </div>
                        {assignedDate && (
                          <div className="flex gap-2">
                            <dt className="shrink-0 font-medium text-foreground/80">Assigned:</dt>
                            <dd>{assignedDate}</dd>
                          </div>
                        )}
                      </dl>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
