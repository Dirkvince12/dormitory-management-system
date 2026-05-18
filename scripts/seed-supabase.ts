/**
 * Upload dummy reference data to Supabase.
 * Requires .env.local with valid Supabase keys.
 *
 * Usage: npm run db:seed
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/database";
import {
  seedAssignments,
  seedPayments,
  seedRooms,
  seedStudents,
} from "../src/lib/seed-data";
import { paymentToInsert, roomToInsert, studentToInsert } from "../src/lib/supabase/mappers";

config({ path: resolve(process.cwd(), ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient<Database>(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function clearTables() {
  const tables = ["payments", "assignments", "students", "rooms"] as const;
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq("id", 0);
    if (error) throw new Error(`Clear ${table}: ${error.message}`);
  }
}

async function seed() {
  console.log("Clearing existing rows…");
  await clearTables();

  console.log("Inserting rooms…");
  const { data: rooms, error: roomsError } = await supabase
    .from("rooms")
    .insert(
      seedRooms.map((r) => ({
        ...roomToInsert(r),
        current_occupancy: r.currentOccupancy,
        status: r.status,
      })),
    )
    .select();
  if (roomsError) throw roomsError;

  const roomIdByNumber = new Map(rooms!.map((r) => [r.room_number, r.id]));

  console.log("Inserting students…");
  const { data: students, error: studentsError } = await supabase
    .from("students")
    .insert(
      seedStudents.map((s) => {
        const assignedRoom = s.assignedRoomId
          ? seedRooms.find((r) => r.id === s.assignedRoomId)
          : null;
        return {
          ...studentToInsert(s),
          assigned_room_id: assignedRoom ? roomIdByNumber.get(assignedRoom.roomNumber) ?? null : null,
        };
      }),
    )
    .select();
  if (studentsError) throw studentsError;

  const studentIdByCode = new Map(students!.map((s) => [s.student_id, s.id]));

  console.log("Inserting assignments…");
  const { error: assignmentsError } = await supabase.from("assignments").insert(
    seedAssignments.map((a) => {
      const student = seedStudents.find((s) => s.id === a.studentId)!;
      const room = seedRooms.find((r) => r.id === a.roomId)!;
      return {
        student_id: studentIdByCode.get(student.studentId)!,
        room_id: roomIdByNumber.get(room.roomNumber)!,
        assigned_at: a.assignedAt,
      };
    }),
  );
  if (assignmentsError) throw assignmentsError;

  console.log("Inserting payments…");
  const { error: paymentsError } = await supabase.from("payments").insert(
    seedPayments.map((p) => {
      const student = seedStudents.find((s) => s.id === p.studentId)!;
      return {
        ...paymentToInsert(p),
        student_id: studentIdByCode.get(student.studentId)!,
      };
    }),
  );
  if (paymentsError) throw paymentsError;

  console.log("Done. Seeded:");
  console.log(`  ${rooms!.length} rooms`);
  console.log(`  ${students!.length} students`);
  console.log(`  ${seedAssignments.length} assignments`);
  console.log(`  ${seedPayments.length} payments`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
