import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Payment } from "@/types/entities";
import { mapPaymentRow, paymentToInsert } from "@/lib/supabase/mappers";

type Client = SupabaseClient<Database>;

export async function fetchPayments(supabase: Client): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("due_date", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPaymentRow);
}

export async function insertPayment(
  supabase: Client,
  payment: Omit<Payment, "id">,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert(paymentToInsert(payment))
    .select()
    .single();

  if (error) throw error;
  return mapPaymentRow(data);
}

export async function updatePayment(
  supabase: Client,
  id: number,
  updates: Partial<Payment>,
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...(updates.studentId !== undefined && { student_id: updates.studentId }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.dueDate !== undefined && { due_date: updates.dueDate }),
      ...(updates.paidDate !== undefined && { paid_date: updates.paidDate }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.period !== undefined && { period: updates.period }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapPaymentRow(data);
}

export async function deletePayment(supabase: Client, id: number): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);
  if (error) throw error;
}
