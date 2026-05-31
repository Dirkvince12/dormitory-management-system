import { emptyRoomAmenities } from "@/lib/room-amenities";
import type { Assignment, Payment, Room, Student } from "@/types/entities";

const defaultAmenities = emptyRoomAmenities();

/** Fixed reference dates (app dummy data). */
const daysFrom = (base: string, offset: number) => {
  const date = new Date(base);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().split("T")[0];
};

const BASE = "2026-05-18";

export const seedRooms: Room[] = [
  { id: 1, roomNumber: "101", floor: 1, capacity: 2, currentOccupancy: 2, status: "full", imageUrl: null, category: "male", bedType: "single_double_deck", amenities: { ...defaultAmenities, airConditioner: true, studyTable: true, chair: true, cabinet: true } },
  { id: 2, roomNumber: "102", floor: 1, capacity: 3, currentOccupancy: 1, status: "partial", imageUrl: null, category: "male", bedType: "two_beds", amenities: { ...defaultAmenities, electricFan: true, studyTable: true, chair: true } },
  { id: 3, roomNumber: "103", floor: 1, capacity: 2, currentOccupancy: 1, status: "partial", imageUrl: null, category: "female", bedType: "single_double_deck", amenities: { ...defaultAmenities, electricFan: true, cabinet: true } },
  { id: 4, roomNumber: "201", floor: 2, capacity: 4, currentOccupancy: 2, status: "partial", imageUrl: null, category: "female", bedType: "two_double_deck", amenities: { ...defaultAmenities, airConditioner: true, refrigerator: true, privateComfortRoom: true } },
  { id: 5, roomNumber: "202", floor: 2, capacity: 2, currentOccupancy: 1, status: "partial", imageUrl: null, category: "male", bedType: "two_beds", amenities: { ...defaultAmenities, studyTable: true, chair: true } },
  { id: 6, roomNumber: "203", floor: 2, capacity: 2, currentOccupancy: 0, status: "available", imageUrl: null, category: "female", bedType: "single_double_deck", amenities: defaultAmenities },
  { id: 7, roomNumber: "301", floor: 3, capacity: 6, currentOccupancy: 0, status: "available", imageUrl: null, category: "male", bedType: "two_double_deck", amenities: defaultAmenities },
  { id: 8, roomNumber: "302", floor: 3, capacity: 2, currentOccupancy: 0, status: "available", imageUrl: null, category: "female", bedType: "single_bed", amenities: defaultAmenities },
];

export const seedStudents: Student[] = [
  { id: 1, name: "Alice Johnson", studentId: "STU001", course: "Computer Science", department: "Engineering", contactNumber: "555-0101", email: "alice.johnson@university.edu", gender: "female", assignedRoomId: 1 },
  { id: 2, name: "Bob Smith", studentId: "STU002", course: "Mathematics", department: "Science", contactNumber: "555-0102", email: "bob.smith@university.edu", gender: "male", assignedRoomId: 1 },
  { id: 3, name: "Charlie Davis", studentId: "STU003", course: "Physics", department: "Science", contactNumber: "555-0103", email: "charlie.davis@university.edu", gender: "male", assignedRoomId: null },
  { id: 4, name: "Diana Evans", studentId: "STU004", course: "Literature", department: "Arts", contactNumber: "555-0104", email: "diana.evans@university.edu", gender: "female", assignedRoomId: 2 },
  { id: 5, name: "Ethan Foster", studentId: "STU005", course: "History", department: "Arts", contactNumber: "555-0105", email: "ethan.foster@university.edu", gender: "male", assignedRoomId: null },
  { id: 6, name: "Fiona Green", studentId: "STU006", course: "Biology", department: "Science", contactNumber: "555-0106", email: "fiona.green@university.edu", gender: "female", assignedRoomId: 3 },
  { id: 7, name: "George Harris", studentId: "STU007", course: "Chemistry", department: "Science", contactNumber: "555-0107", email: "george.harris@university.edu", gender: "male", assignedRoomId: 4 },
  { id: 8, name: "Hannah Ivey", studentId: "STU008", course: "Business", department: "Business", contactNumber: "555-0108", email: "hannah.ivey@university.edu", gender: "female", assignedRoomId: 4 },
  { id: 9, name: "Ian Jones", studentId: "STU009", course: "Economics", department: "Business", contactNumber: "555-0109", email: "ian.jones@university.edu", gender: "male", assignedRoomId: null },
  { id: 10, name: "Julia King", studentId: "STU010", course: "Psychology", department: "Social Science", contactNumber: "555-0110", email: "julia.king@university.edu", gender: "female", assignedRoomId: 5 },
];

export const seedAssignments: Assignment[] = [
  { id: 1, studentId: 1, roomId: 1, assignedAt: "2026-05-15T08:00:00.000Z" },
  { id: 2, studentId: 2, roomId: 1, assignedAt: "2026-05-15T10:00:00.000Z" },
  { id: 3, studentId: 4, roomId: 2, assignedAt: "2026-05-16T08:00:00.000Z" },
  { id: 4, studentId: 6, roomId: 3, assignedAt: "2026-05-16T12:00:00.000Z" },
  { id: 5, studentId: 7, roomId: 4, assignedAt: "2026-05-17T08:00:00.000Z" },
  { id: 6, studentId: 8, roomId: 4, assignedAt: "2026-05-17T10:00:00.000Z" },
  { id: 7, studentId: 10, roomId: 5, assignedAt: "2026-05-17T14:00:00.000Z" },
];

export const seedPayments: Payment[] = [
  { id: 1, studentId: 1, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: daysFrom(BASE, -28), status: "paid", period: "Jan 2026" },
  { id: 2, studentId: 2, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: daysFrom(BASE, -25), status: "paid", period: "Jan 2026" },
  { id: 3, studentId: 4, amount: 3800, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: null, status: "overdue", period: "Jan 2026" },
  { id: 4, studentId: 6, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: daysFrom(BASE, -20), status: "paid", period: "Jan 2026" },
  { id: 5, studentId: 7, amount: 4200, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: null, status: "overdue", period: "Jan 2026" },
  { id: 6, studentId: 8, amount: 4200, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: daysFrom(BASE, -15), status: "paid", period: "Jan 2026" },
  { id: 7, studentId: 10, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, -30), paidDate: daysFrom(BASE, -10), status: "paid", period: "Jan 2026" },
  { id: 8, studentId: 1, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, 5), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 9, studentId: 2, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, 5), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 10, studentId: 4, amount: 3800, description: "Dormitory Fee", dueDate: daysFrom(BASE, 5), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 11, studentId: 6, amount: 4500, description: "Dormitory Fee", dueDate: daysFrom(BASE, 5), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 12, studentId: 7, amount: 4200, description: "Dormitory Fee", dueDate: daysFrom(BASE, 5), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 13, studentId: 1, amount: 500, description: "Maintenance Fee", dueDate: daysFrom(BASE, -15), paidDate: daysFrom(BASE, -12), status: "paid", period: "Jan 2026" },
  { id: 14, studentId: 3, amount: 200, description: "Registration Fee", dueDate: daysFrom(BASE, 10), paidDate: null, status: "pending", period: "Feb 2026" },
  { id: 15, studentId: 5, amount: 200, description: "Registration Fee", dueDate: daysFrom(BASE, -5), paidDate: null, status: "overdue", period: "Jan 2026" },
];
