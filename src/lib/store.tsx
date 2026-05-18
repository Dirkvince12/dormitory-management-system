"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "sonner";
import {
  addPaymentAction,
  addRoomAction,
  addStudentAction,
  assignStudentToRoomAction,
  deletePaymentAction,
  deleteRoomAction,
  deleteStudentAction,
  getDataSourceMode,
  loadDormData,
  markPaymentPaidAction,
  removeAssignmentAction,
  updatePaymentAction,
  updateRoomAction,
  updateStudentAction,
  type DormData,
} from "@/actions/dorm";
import type { DataSourceMode } from "@/lib/supabase/env";
import type {
  Assignment,
  Payment,
  PaymentStatus,
  Room,
  Student,
} from "@/types/entities";
import {
  seedAssignments,
  seedPayments,
  seedRooms,
  seedStudents,
} from "@/lib/seed-data";
export type { Assignment, Payment, PaymentStatus, Room, Student };

type AppState = {
  students: Student[];
  rooms: Room[];
  assignments: Assignment[];
  payments: Payment[];
  isLoading: boolean;
  dataSourceMode: DataSourceMode;
};

type AppContextType = AppState & {
  addStudent: (student: Omit<Student, "id" | "assignedRoomId">) => Promise<void>;
  updateStudent: (id: number, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
  addRoom: (room: Omit<Room, "id" | "currentOccupancy" | "status">) => Promise<void>;
  updateRoom: (id: number, room: Partial<Room>) => Promise<void>;
  deleteRoom: (id: number) => Promise<void>;
  assignStudentToRoom: (studentId: number, roomId: number) => Promise<void>;
  removeAssignment: (assignmentId: number) => Promise<void>;
  addPayment: (payment: Omit<Payment, "id">) => Promise<void>;
  updatePayment: (id: number, updates: Partial<Payment>) => Promise<void>;
  deletePayment: (id: number) => Promise<void>;
  markPaymentPaid: (id: number) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const localSeed: DormData = {
  students: seedStudents,
  rooms: seedRooms,
  assignments: seedAssignments,
  payments: seedPayments,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSourceMode, setDataSourceMode] = useState<DataSourceMode>("demo");
  const useDatabase = dataSourceMode === "database";

  const applyData = useCallback((data: DormData) => {
    setStudents(data.students);
    setRooms(data.rooms);
    setAssignments(data.assignments);
    setPayments(data.payments);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const mode = await getDataSourceMode();
        if (cancelled) return;

        setDataSourceMode(mode);

        if (mode === "demo") {
          applyData(localSeed);
          return;
        }

        if (mode === "misconfigured") {
          applyData(localSeed);
          toast.warning(
            "Supabase is partially configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local and Vercel, then redeploy.",
            { duration: 8000 },
          );
          return;
        }

        const data = await loadDormData();
        if (!cancelled && data) applyData(data);
      } catch {
        if (!cancelled) {
          toast.error("Could not load data from Supabase. Check .env.local and run the schema migration.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [applyData]);

  const runWithDb = useCallback(
    async (
      localUpdate: () => void,
      serverAction: () => Promise<DormData>,
      successMessage: string,
    ) => {
      if (!useDatabase) {
        localUpdate();
        toast.success(successMessage);
        return;
      }

      try {
        const data = await serverAction();
        applyData(data);
        toast.success(successMessage);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong";
        toast.error(message);
        throw err;
      }
    },
    [applyData, useDatabase],
  );

  const recalculateRoomOccupancy = (currentAssignments: Assignment[], currentRooms: Room[]) => {
    return currentRooms.map((room) => {
      const occupancy = currentAssignments.filter((a) => a.roomId === room.id).length;
      let status: Room["status"] = "available";
      if (occupancy >= room.capacity) status = "full";
      else if (occupancy > 0) status = "partial";
      return { ...room, currentOccupancy: occupancy, status };
    });
  };

  const addStudent = async (student: Omit<Student, "id" | "assignedRoomId">) => {
    await runWithDb(
      () => {
        setStudents((prev) => [...prev, { ...student, id: Date.now(), assignedRoomId: null }]);
      },
      () => addStudentAction(student),
      "Student added successfully",
    );
  };

  const updateStudent = async (id: number, updates: Partial<Student>) => {
    await runWithDb(
      () => {
        setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
      },
      () => updateStudentAction(id, updates),
      "Student updated successfully",
    );
  };

  const deleteStudent = async (id: number) => {
    await runWithDb(
      () => {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        setAssignments((prev) => {
          const newAssignments = prev.filter((a) => a.studentId !== id);
          setRooms((rooms) => recalculateRoomOccupancy(newAssignments, rooms));
          return newAssignments;
        });
        setPayments((prev) => prev.filter((p) => p.studentId !== id));
      },
      () => deleteStudentAction(id),
      "Student deleted successfully",
    );
  };

  const addRoom = async (room: Omit<Room, "id" | "currentOccupancy" | "status">) => {
    await runWithDb(
      () => {
        setRooms((prev) => [
          ...prev,
          { ...room, id: Date.now(), currentOccupancy: 0, status: "available" },
        ]);
      },
      () => addRoomAction(room),
      "Room added successfully",
    );
  };

  const updateRoom = async (id: number, updates: Partial<Room>) => {
    await runWithDb(
      () => {
        setRooms((prev) => {
          const newRooms = prev.map((r) => (r.id === id ? { ...r, ...updates } : r));
          return recalculateRoomOccupancy(assignments, newRooms);
        });
      },
      () => updateRoomAction(id, updates),
      "Room updated successfully",
    );
  };

  const deleteRoom = async (id: number) => {
    await runWithDb(
      () => {
        setRooms((prev) => prev.filter((r) => r.id !== id));
        setAssignments((prev) => {
          const newAssignments = prev.filter((a) => a.roomId !== id);
          setStudents((s) =>
            s.map((student) =>
              student.assignedRoomId === id ? { ...student, assignedRoomId: null } : student,
            ),
          );
          return newAssignments;
        });
      },
      () => deleteRoomAction(id),
      "Room deleted successfully",
    );
  };

  const assignStudentToRoom = async (studentId: number, roomId: number) => {
    if (!useDatabase) {
      const room = rooms.find((r) => r.id === roomId);
      if (!room) {
        toast.error("Room not found");
        return;
      }
      const currentOccupancy = assignments.filter((a) => a.roomId === roomId).length;
      if (currentOccupancy >= room.capacity) {
        toast.error(`Room ${room.roomNumber} is already full`);
        return;
      }

      const existingAssignment = assignments.find((a) => a.studentId === studentId);
      let newAssignments = [...assignments];

      if (existingAssignment) {
        newAssignments = newAssignments.map((a) =>
          a.id === existingAssignment.id ? { ...a, roomId } : a,
        );
      } else {
        newAssignments.push({
          id: Date.now(),
          studentId,
          roomId,
          assignedAt: new Date().toISOString(),
        });
      }

      setAssignments(newAssignments);
      setRooms((prev) => recalculateRoomOccupancy(newAssignments, prev));
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, assignedRoomId: roomId } : s)),
      );
      toast.success("Student assigned successfully");
      return;
    }

    try {
      const data = await assignStudentToRoomAction(studentId, roomId);
      applyData(data);
      toast.success("Student assigned successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Assignment failed");
    }
  };

  const removeAssignment = async (assignmentId: number) => {
    await runWithDb(
      () => {
        const assignment = assignments.find((a) => a.id === assignmentId);
        if (!assignment) return;

        const newAssignments = assignments.filter((a) => a.id !== assignmentId);
        setAssignments(newAssignments);
        setRooms((prev) => recalculateRoomOccupancy(newAssignments, prev));
        setStudents((prev) =>
          prev.map((s) =>
            s.id === assignment.studentId ? { ...s, assignedRoomId: null } : s,
          ),
        );
      },
      () => removeAssignmentAction(assignmentId),
      "Assignment removed successfully",
    );
  };

  const addPayment = async (payment: Omit<Payment, "id">) => {
    await runWithDb(
      () => {
        setPayments((prev) => [...prev, { ...payment, id: Date.now() }]);
      },
      () => addPaymentAction(payment),
      "Payment record added",
    );
  };

  const updatePayment = async (id: number, updates: Partial<Payment>) => {
    await runWithDb(
      () => {
        setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      },
      () => updatePaymentAction(id, updates),
      "Payment updated",
    );
  };

  const deletePayment = async (id: number) => {
    await runWithDb(
      () => {
        setPayments((prev) => prev.filter((p) => p.id !== id));
      },
      () => deletePaymentAction(id),
      "Payment record deleted",
    );
  };

  const markPaymentPaid = async (id: number) => {
    await runWithDb(
      () => {
        setPayments((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: "paid", paidDate: new Date().toISOString().split("T")[0] }
              : p,
          ),
        );
      },
      () => markPaymentPaidAction(id),
      "Payment marked as paid",
    );
  };

  return (
    <AppContext.Provider
      value={{
        students,
        rooms,
        assignments,
        payments,
        isLoading,
        dataSourceMode,
        addStudent,
        updateStudent,
        deleteStudent,
        addRoom,
        updateRoom,
        deleteRoom,
        assignStudentToRoom,
        removeAssignment,
        addPayment,
        updatePayment,
        deletePayment,
        markPaymentPaid,
      }}
    >
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
