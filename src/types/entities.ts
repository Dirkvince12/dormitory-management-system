export type RoomStatus = "available" | "full" | "partial";
export type PaymentStatus = "paid" | "pending" | "overdue";

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
  status: RoomStatus;
  imageUrl: string | null;
};

export type Assignment = {
  id: number;
  studentId: number;
  roomId: number;
  assignedAt: string;
};

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
