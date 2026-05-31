"use client";

import { useState } from "react";
import { useAppStore, type Assignment, type Room, type Student } from "@/lib/store";
import { getAvailableBeds, getRoomsForStudentAssignment } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, UserMinus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { GENDER_OPTIONS, getGenderLabel, type Gender } from "@/lib/gender";
import { toast } from "sonner";

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const space = trimmed.indexOf(" ");
  if (space === -1) return { firstName: trimmed, lastName: "" };
  return { firstName: trimmed.slice(0, space), lastName: trimmed.slice(space + 1).trim() };
}

function RoomAssignmentCell({
  student,
  rooms,
  assignments,
  assignment,
  onAssign,
  onUnassign,
}: {
  student: Student;
  rooms: Room[];
  assignments: Assignment[];
  assignment: Assignment | undefined;
  onAssign: (roomId: number) => void;
  onUnassign: () => void;
}) {
  const assignedRoomId = student.assignedRoomId ?? assignment?.roomId ?? null;
  const assignedRoom = assignedRoomId
    ? rooms.find((r) => r.id === assignedRoomId)
    : null;
  const selectableRooms = getRoomsForStudentAssignment(
    rooms,
    assignments,
    assignedRoomId,
  );
  const selectValue = assignedRoomId?.toString();

  if (selectableRooms.length === 0 && !assignedRoom) {
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
          {selectableRooms.map((room) => {
            const bedsFree = getAvailableBeds(room, assignments);
            const isCurrentRoom = room.id === assignedRoomId;
            return (
              <SelectItem key={room.id} value={room.id.toString()}>
                Room {room.roomNumber}
                {isCurrentRoom && bedsFree === 0
                  ? " (assigned)"
                  : ` (${bedsFree} bed${bedsFree === 1 ? "" : "s"} free)`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {assignment !== undefined && (
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

function StudentForm({
  student,
  onSubmit,
  onCancel,
}: {
  student?: Student;
  onSubmit: (data: Omit<Student, "id" | "assignedRoomId">) => void;
  onCancel: () => void;
}) {
  const { firstName: defaultFirstName, lastName: defaultLastName } = student?.name
    ? splitFullName(student.name)
    : { firstName: "", lastName: "" };
  const [gender, setGender] = useState<Gender | "">(student?.gender ?? "");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!gender) {
      toast.error("Select a gender (Male or Female).");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const firstName = String(formData.get("firstName") ?? "").trim();
    const lastName = String(formData.get("lastName") ?? "").trim();
    const name = [firstName, lastName].filter(Boolean).join(" ");
    onSubmit({
      name,
      studentId: String(formData.get("studentId")),
      course: String(formData.get("course")),
      department: String(formData.get("department")),
      contactNumber: String(formData.get("contactNumber")),
      email: String(formData.get("email")).trim(),
      gender,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="space-y-5 py-1">
        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Personal information
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="e.g. Juan"
                defaultValue={defaultFirstName}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="e.g. Dela Cruz"
                defaultValue={defaultLastName}
                className="h-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentId">Student ID</Label>
            <Input
              id="studentId"
              name="studentId"
              placeholder="e.g. STU001"
              defaultValue={student?.studentId}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Gender</Label>
            <RadioGroup
              value={gender}
              onValueChange={(v) => setGender(v as Gender)}
              className="grid grid-cols-2 gap-2"
            >
              {GENDER_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`student-gender-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem
                    id={`student-gender-${option.value}`}
                    value={option.value}
                    data-testid={`radio-student-gender-${option.value}`}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Academic & contact
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                name="course"
                placeholder="e.g. Computer Science"
                defaultValue={student?.course}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                placeholder="e.g. Engineering"
                defaultValue={student?.department}
                className="h-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. juan.delacruz@university.edu"
              defaultValue={student?.email}
              className="h-10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact number</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              type="tel"
              placeholder="e.g. 0917 123 4567"
              defaultValue={student?.contactNumber}
              className="h-10"
              required
            />
          </div>
        </div>
      </div>

      <DialogFooter className="-mx-6 -mb-6 mt-5 gap-2 border-t bg-muted/30 px-6 py-4 sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" className="min-w-[5.5rem]">
          {student ? "Save changes" : "Add student"}
        </Button>
      </DialogFooter>
    </form>
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
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const getGenderColor = (gender: Student["gender"]) => {
    switch (gender) {
      case "male":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "female":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "text-muted-foreground";
    }
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
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left">
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the student&apos;s personal details, gender, and academic information.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6">
              <StudentForm
                onSubmit={(data) => {
                  addStudent(data);
                  setIsAddOpen(false);
                }}
                onCancel={() => setIsAddOpen(false)}
              />
            </div>
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
              <TableHead>Email</TableHead>
              <TableHead>Gender</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-14 rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
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
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      {student.gender ? (
                        <Badge
                          variant="outline"
                          className={`border-0 ${getGenderColor(student.gender)}`}
                        >
                          {getGenderLabel(student.gender)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{student.course}</TableCell>
                    <TableCell>
                      <RoomAssignmentCell
                        student={student}
                        rooms={rooms}
                        assignments={assignments}
                        assignment={assignment}
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
                          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
                            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left">
                              <DialogTitle>Edit Student</DialogTitle>
                              <DialogDescription>
                                Update personal details, gender, or academic information.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="px-6">
                              <StudentForm
                                student={student}
                                onSubmit={(data) => {
                                  updateStudent(student.id, data);
                                  setEditingStudent(null);
                                }}
                                onCancel={() => setEditingStudent(null)}
                              />
                            </div>
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
