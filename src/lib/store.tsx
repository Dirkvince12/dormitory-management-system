"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";

export type Student = {
  id: number;
  name: string;
  studentId: string;
  course: string;
  department: string;
  contactNumber: string;
  assignedRoomId: number | null;
};

export type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  currentOccupancy: number;
  status: "available" | "full" | "partial";
};

export type Assignment = {
  id: number;
  studentId: number;
  roomId: number;
  assignedAt: string;
};

export type PaymentStatus = "paid" | "pending" | "overdue";

export type Payment = {
  id: number;
  studentId: number;
  amount: number;
  description: string;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  period: string;
};

type AppState = {
  students: Student[];
  rooms: Room[];
  assignments: Assignment[];
  payments: Payment[];
  isLoading: boolean;
};

type AppContextType = AppState & {
  addStudent: (student: Omit<Student, "id" | "assignedRoomId">) => void;
  updateStudent: (id: number, student: Partial<Student>) => void;
  deleteStudent: (id: number) => void;
  addRoom: (room: Omit<Room, "id" | "currentOccupancy" | "status">) => void;
  updateRoom: (id: number, room: Partial<Room>) => void;
  deleteRoom: (id: number) => void;
  assignStudentToRoom: (studentId: number, roomId: number) => void;
  removeAssignment: (assignmentId: number) => void;
  addPayment: (payment: Omit<Payment, "id">) => void;
  updatePayment: (id: number, updates: Partial<Payment>) => void;
  deletePayment: (id: number) => void;
  markPaymentPaid: (id: number) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialStudents: Student[] = [
  { id: 1, name: "Alice Johnson", studentId: "STU001", course: "Computer Science", department: "Engineering", contactNumber: "555-0101", assignedRoomId: 1 },
  { id: 2, name: "Bob Smith", studentId: "STU002", course: "Mathematics", department: "Science", contactNumber: "555-0102", assignedRoomId: 1 },
  { id: 3, name: "Charlie Davis", studentId: "STU003", course: "Physics", department: "Science", contactNumber: "555-0103", assignedRoomId: null },
  { id: 4, name: "Diana Evans", studentId: "STU004", course: "Literature", department: "Arts", contactNumber: "555-0104", assignedRoomId: 2 },
  { id: 5, name: "Ethan Foster", studentId: "STU005", course: "History", department: "Arts", contactNumber: "555-0105", assignedRoomId: null },
  { id: 6, name: "Fiona Green", studentId: "STU006", course: "Biology", department: "Science", contactNumber: "555-0106", assignedRoomId: 3 },
  { id: 7, name: "George Harris", studentId: "STU007", course: "Chemistry", department: "Science", contactNumber: "555-0107", assignedRoomId: 4 },
  { id: 8, name: "Hannah Ivey", studentId: "STU008", course: "Business", department: "Business", contactNumber: "555-0108", assignedRoomId: 4 },
  { id: 9, name: "Ian Jones", studentId: "STU009", course: "Economics", department: "Business", contactNumber: "555-0109", assignedRoomId: null },
  { id: 10, name: "Julia King", studentId: "STU010", course: "Psychology", department: "Social Science", contactNumber: "555-0110", assignedRoomId: 5 },
];

const initialRooms: Room[] = [
  { id: 1, roomNumber: "101", floor: 1, capacity: 2, currentOccupancy: 2, status: "full" },
  { id: 2, roomNumber: "102", floor: 1, capacity: 3, currentOccupancy: 1, status: "partial" },
  { id: 3, roomNumber: "103", floor: 1, capacity: 2, currentOccupancy: 1, status: "partial" },
  { id: 4, roomNumber: "201", floor: 2, capacity: 4, currentOccupancy: 2, status: "partial" },
  { id: 5, roomNumber: "202", floor: 2, capacity: 2, currentOccupancy: 1, status: "partial" },
  { id: 6, roomNumber: "203", floor: 2, capacity: 2, currentOccupancy: 0, status: "available" },
  { id: 7, roomNumber: "301", floor: 3, capacity: 6, currentOccupancy: 0, status: "available" },
  { id: 8, roomNumber: "302", floor: 3, capacity: 2, currentOccupancy: 0, status: "available" },
];

const initialAssignments: Assignment[] = [
  { id: 1, studentId: 1, roomId: 1, assignedAt: new Date(Date.now() - 10000000).toISOString() },
  { id: 2, studentId: 2, roomId: 1, assignedAt: new Date(Date.now() - 9000000).toISOString() },
  { id: 3, studentId: 4, roomId: 2, assignedAt: new Date(Date.now() - 8000000).toISOString() },
  { id: 4, studentId: 6, roomId: 3, assignedAt: new Date(Date.now() - 7000000).toISOString() },
  { id: 5, studentId: 7, roomId: 4, assignedAt: new Date(Date.now() - 6000000).toISOString() },
  { id: 6, studentId: 8, roomId: 4, assignedAt: new Date(Date.now() - 5000000).toISOString() },
  { id: 7, studentId: 10, roomId: 5, assignedAt: new Date(Date.now() - 4000000).toISOString() },
];

const d = (offsetDays: number) => new Date(Date.now() + offsetDays * 86400000).toISOString().split("T")[0];

const initialPayments: Payment[] = [
  { id: 1,  studentId: 1,  amount: 4500, description: "Dormitory Fee",    dueDate: d(-30), paidDate: d(-28), status: "paid",    period: "Jan 2026" },
  { id: 2,  studentId: 2,  amount: 4500, description: "Dormitory Fee",    dueDate: d(-30), paidDate: d(-25), status: "paid",    period: "Jan 2026" },
  { id: 3,  studentId: 4,  amount: 3800, description: "Dormitory Fee",    dueDate: d(-30), paidDate: null,   status: "overdue", period: "Jan 2026" },
  { id: 4,  studentId: 6,  amount: 4500, description: "Dormitory Fee",    dueDate: d(-30), paidDate: d(-20), status: "paid",    period: "Jan 2026" },
  { id: 5,  studentId: 7,  amount: 4200, description: "Dormitory Fee",    dueDate: d(-30), paidDate: null,   status: "overdue", period: "Jan 2026" },
  { id: 6,  studentId: 8,  amount: 4200, description: "Dormitory Fee",    dueDate: d(-30), paidDate: d(-15), status: "paid",    period: "Jan 2026" },
  { id: 7,  studentId: 10, amount: 4500, description: "Dormitory Fee",    dueDate: d(-30), paidDate: d(-10), status: "paid",    period: "Jan 2026" },
  { id: 8,  studentId: 1,  amount: 4500, description: "Dormitory Fee",    dueDate: d(5),   paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 9,  studentId: 2,  amount: 4500, description: "Dormitory Fee",    dueDate: d(5),   paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 10, studentId: 4,  amount: 3800, description: "Dormitory Fee",    dueDate: d(5),   paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 11, studentId: 6,  amount: 4500, description: "Dormitory Fee",    dueDate: d(5),   paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 12, studentId: 7,  amount: 4200, description: "Dormitory Fee",    dueDate: d(5),   paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 13, studentId: 1,  amount: 500,  description: "Maintenance Fee",  dueDate: d(-15), paidDate: d(-12), status: "paid",    period: "Jan 2026" },
  { id: 14, studentId: 3,  amount: 200,  description: "Registration Fee", dueDate: d(10),  paidDate: null,   status: "pending", period: "Feb 2026" },
  { id: 15, studentId: 5,  amount: 200,  description: "Registration Fee", dueDate: d(-5),  paidDate: null,   status: "overdue", period: "Jan 2026" },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const recalculateRoomOccupancy = (currentAssignments: Assignment[], currentRooms: Room[]) => {
    return currentRooms.map(room => {
      const occupancy = currentAssignments.filter(a => a.roomId === room.id).length;
      let status: Room["status"] = "available";
      if (occupancy === room.capacity) status = "full";
      else if (occupancy > 0) status = "partial";
      return { ...room, currentOccupancy: occupancy, status };
    });
  };

  const addStudent = (student: Omit<Student, "id" | "assignedRoomId">) => {
    const newStudent = { ...student, id: Date.now(), assignedRoomId: null };
    setStudents(prev => [...prev, newStudent]);
    toast.success("Student added successfully");
  };

  const updateStudent = (id: number, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    toast.success("Student updated successfully");
  };

  const deleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    setAssignments(prev => {
      const newAssignments = prev.filter(a => a.studentId !== id);
      setRooms(rooms => recalculateRoomOccupancy(newAssignments, rooms));
      return newAssignments;
    });
    toast.success("Student deleted successfully");
  };

  const addRoom = (room: Omit<Room, "id" | "currentOccupancy" | "status">) => {
    const newRoom: Room = { ...room, id: Date.now(), currentOccupancy: 0, status: "available" };
    setRooms(prev => [...prev, newRoom]);
    toast.success("Room added successfully");
  };

  const updateRoom = (id: number, updates: Partial<Room>) => {
    setRooms(prev => {
      const newRooms = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      return recalculateRoomOccupancy(assignments, newRooms);
    });
    toast.success("Room updated successfully");
  };

  const deleteRoom = (id: number) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    setAssignments(prev => {
      const newAssignments = prev.filter(a => a.roomId !== id);
      setStudents(students => students.map(s => s.assignedRoomId === id ? { ...s, assignedRoomId: null } : s));
      return newAssignments;
    });
    toast.success("Room deleted successfully");
  };

  const assignStudentToRoom = (studentId: number, roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) {
      toast.error("Room not found");
      return;
    }
    
    const currentOccupancy = assignments.filter(a => a.roomId === roomId).length;
    if (currentOccupancy >= room.capacity) {
      toast.error(`Room ${room.roomNumber} is already full`);
      return;
    }

    const existingAssignment = assignments.find(a => a.studentId === studentId);
    let newAssignments = [...assignments];
    
    if (existingAssignment) {
      newAssignments = newAssignments.map(a => 
        a.id === existingAssignment.id ? { ...a, roomId } : a
      );
    } else {
      newAssignments.push({
        id: Date.now(),
        studentId,
        roomId,
        assignedAt: new Date().toISOString()
      });
    }

    setAssignments(newAssignments);
    setRooms(prev => recalculateRoomOccupancy(newAssignments, prev));
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, assignedRoomId: roomId } : s));
    toast.success("Student assigned successfully");
  };

  const removeAssignment = (assignmentId: number) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;

    const newAssignments = assignments.filter(a => a.id !== assignmentId);
    setAssignments(newAssignments);
    setRooms(prev => recalculateRoomOccupancy(newAssignments, prev));
    setStudents(prev => prev.map(s => s.id === assignment.studentId ? { ...s, assignedRoomId: null } : s));
    toast.success("Assignment removed successfully");
  };

  const addPayment = (payment: Omit<Payment, "id">) => {
    setPayments(prev => [...prev, { ...payment, id: Date.now() }]);
    toast.success("Payment record added");
  };

  const updatePayment = (id: number, updates: Partial<Payment>) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    toast.success("Payment updated");
  };

  const deletePayment = (id: number) => {
    setPayments(prev => prev.filter(p => p.id !== id));
    toast.success("Payment record deleted");
  };

  const markPaymentPaid = (id: number) => {
    setPayments(prev => prev.map(p =>
      p.id === id ? { ...p, status: "paid", paidDate: new Date().toISOString().split("T")[0] } : p
    ));
    toast.success("Payment marked as paid");
  };

  return (
    <AppContext.Provider value={{
      students, rooms, assignments, payments, isLoading,
      addStudent, updateStudent, deleteStudent,
      addRoom, updateRoom, deleteRoom,
      assignStudentToRoom, removeAssignment,
      addPayment, updatePayment, deletePayment, markPaymentPaid,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppStore must be used within an AppProvider");
  }
  return context;
}
