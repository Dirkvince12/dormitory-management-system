"use client";

import { useState } from "react";
import { useAppStore, type Room, type Student } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

function RoomAssignmentCell({
  student,
  rooms,
  assignmentId,
  onAssign,
  onUnassign,
}: {
  student: Student;
  rooms: Room[];
  assignmentId: number | undefined;
  onAssign: (roomId: number) => void;
  onUnassign: () => void;
}) {
  const assignedRoom = student.assignedRoomId
    ? rooms.find((r) => r.id === student.assignedRoomId)
    : null;
  const availableRooms = rooms.filter(
    (r) => r.id === student.assignedRoomId || r.status !== "full",
  );
  const selectValue = student.assignedRoomId ? student.assignedRoomId.toString() : undefined;

  if (availableRooms.length === 0 && !assignedRoom) {
    return (
      <Badge variant="outline" className="text-muted-foreground font-normal">
        No rooms available
      </Badge>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      <Select
        value={selectValue}
        onValueChange={(value) => {
          if (value) onAssign(Number(value));
        }}
      >
        <SelectTrigger className="h-8 w-[min(100%,11rem)] text-xs" data-testid={`assign-room-${student.id}`}>
          <SelectValue
            placeholder={assignedRoom ? `Room ${assignedRoom.roomNumber}` : "Assign room…"}
          />
        </SelectTrigger>
        <SelectContent>
          {availableRooms.map((room) => (
            <SelectItem key={room.id} value={room.id.toString()}>
              Room {room.roomNumber} ({room.capacity - room.currentOccupancy} bed
              {room.capacity - room.currentOccupancy === 1 ? "" : "s"} free)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {assignmentId !== undefined && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-destructive"
          onClick={onUnassign}
          data-testid={`unassign-room-${student.id}`}
        >
          <UserMinus className="h-3.5 w-3.5" />
          <span className="sr-only">Unassign from room</span>
        </Button>
      )}
    </div>
  );
}

export default function Students() {
  const {
    students,
    rooms,
    assignments,
    isLoading,
    addStudent,
    updateStudent,
    deleteStudent,
    assignStudentToRoom,
    removeAssignment,
  } = useAppStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId.toLowerCase().includes(search.toLowerCase())
  );

  const StudentForm = ({ student, onSubmit, onCancel }: { student?: Student, onSubmit: (data: any) => void, onCancel: () => void }) => {
    return (
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSubmit({
          name: formData.get('name'),
          studentId: formData.get('studentId'),
          course: formData.get('course'),
          department: formData.get('department'),
          contactNumber: formData.get('contactNumber'),
        });
      }}>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" name="name" defaultValue={student?.name} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentId" className="text-right">Student ID</Label>
            <Input id="studentId" name="studentId" defaultValue={student?.studentId} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">Course</Label>
            <Input id="course" name="course" defaultValue={student?.course} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="department" className="text-right">Department</Label>
            <Input id="department" name="department" defaultValue={student?.department} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right">Contact</Label>
            <Input id="contactNumber" name="contactNumber" defaultValue={student?.contactNumber} className="col-span-3" required />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">Manage all students in the dormitory.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-student">
              <Plus className="w-4 h-4 mr-2" /> Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <StudentForm 
              onSubmit={(data) => {
                addStudent(data);
                setIsAddOpen(false);
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center">
                  <EmptyState title="No students found" description="Try adjusting your search or add a new student." />
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => {
                const assignment = assignments.find((a) => a.studentId === student.id);

                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.studentId}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.course}</TableCell>
                    <TableCell>
                      <RoomAssignmentCell
                        student={student}
                        rooms={rooms}
                        assignmentId={assignment?.id}
                        onAssign={(roomId) => assignStudentToRoom(student.id, roomId)}
                        onUnassign={() => {
                          if (assignment) removeAssignment(assignment.id);
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editingStudent?.id === student.id} onOpenChange={(open) => !open && setEditingStudent(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Student</DialogTitle>
                            </DialogHeader>
                            <StudentForm 
                              student={student}
                              onSubmit={(data) => {
                                updateStudent(student.id, data);
                                setEditingStudent(null);
                              }}
                              onCancel={() => setEditingStudent(null)}
                            />
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the student and remove any room assignments they have.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteStudent(student.id)} className="bg-destructive text-destructive-foreground">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
