"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { getAvailableBeds, getRoomsAvailableForAssignment } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function Assignments() {
  const { students, rooms, assignments, isLoading, assignStudentToRoom, removeAssignment } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const handleAssign = () => {
    if (selectedStudent && selectedRoom) {
      assignStudentToRoom(Number(selectedStudent), Number(selectedRoom));
      setIsAddOpen(false);
      setSelectedStudent("");
      setSelectedRoom("");
    }
  };

  const unassignedStudents = students.filter(s => s.assignedRoomId === null);
  const availableRooms = getRoomsAvailableForAssignment(rooms, assignments);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground">Manage student room allocations.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-assignment">
              <Plus className="w-4 h-4 mr-2" /> New Assignment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Room</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="student">Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select unassigned student" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassignedStudents.length === 0 && (
                      <SelectItem value="none" disabled>No unassigned students</SelectItem>
                    )}
                    {unassignedStudents.map(student => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({student.studentId} · {student.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="room">Room</Label>
                <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                  <SelectTrigger id="room">
                    <SelectValue placeholder="Select available room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.length === 0 && (
                      <SelectItem value="none" disabled>No available rooms</SelectItem>
                    )}
                    {availableRooms.map(room => {
                      const bedsFree = getAvailableBeds(room, assignments);
                      return (
                        <SelectItem key={room.id} value={room.id.toString()}>
                          Room {room.roomNumber} ({bedsFree} bed{bedsFree === 1 ? "" : "s"} free)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAssign} disabled={!selectedStudent || !selectedRoom}>Assign</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <EmptyState title="No assignments" description="Assign students to rooms to see them here." />
                </TableCell>
              </TableRow>
            ) : (
              assignments.map(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                const room = rooms.find(r => r.id === assignment.roomId);
                
                if (!student || !room) return null;

                return (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">{student.studentId}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium font-mono">{room.roomNumber}</div>
                      <div className="text-xs text-muted-foreground">Floor {room.floor}</div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(assignment.assignedAt), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <UserMinus className="w-4 h-4 mr-2" /> Unassign
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Assignment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove {student.name} from Room {room.roomNumber}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeAssignment(assignment.id)} className="bg-destructive text-destructive-foreground">
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
