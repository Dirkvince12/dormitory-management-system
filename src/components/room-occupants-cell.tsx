"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Assignment, Student } from "@/lib/store";
import { cn } from "@/lib/utils";

export function getOccupantsForRoom(
  roomId: number,
  assignments: Assignment[],
  students: Student[],
): Student[] {
  const studentIds = new Set(
    assignments.filter((a) => a.roomId === roomId).map((a) => a.studentId),
  );
  return students.filter((s) => studentIds.has(s.id));
}

type RoomOccupantsCellProps = {
  roomId: number;
  roomNumber: string;
  assignments: Assignment[];
  students: Student[];
};

export function RoomOccupantsCell({
  roomId,
  roomNumber,
  assignments,
  students,
}: RoomOccupantsCellProps) {
  const occupants = getOccupantsForRoom(roomId, assignments, students);

  if (occupants.length === 0) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const preview = occupants
    .slice(0, 2)
    .map((s) => s.name.split(" ")[0])
    .join(", ");
  const extra = occupants.length > 2 ? ` +${occupants.length - 2}` : "";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto max-w-[11rem] justify-start px-2 py-1.5 text-left font-normal hover:bg-muted"
          data-testid={`view-occupants-${roomId}`}
        >
          <Users className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm">
            {preview}
            {extra}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Room {roomNumber}</p>
          <p className="text-xs text-muted-foreground">
            {occupants.length} occupant{occupants.length === 1 ? "" : "s"}
          </p>
        </div>
        <ul className="max-h-56 overflow-y-auto py-1">
          {occupants.map((student) => (
            <li key={student.id}>
              <Link
                href="/students"
                className={cn(
                  "flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/60",
                )}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{student.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {student.studentId} · {student.email}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
