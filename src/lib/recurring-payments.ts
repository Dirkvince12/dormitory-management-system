import type { Payment } from "@/types/entities";

export function periodFromDueDate(dueDate: string): string {
  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** First day of the month before the given due date (YYYY-MM-DD). */
export function previousMonthDueDate(dueDate: string): string {
  const [year, month] = dueDate.split("-").map(Number);
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  return `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
}

export function previousMonthPeriod(dueDate: string): string {
  return periodFromDueDate(previousMonthDueDate(dueDate));
}

export function findPreviousMonthPaidPayment(
  payments: Payment[],
  bill: Payment,
): Payment | undefined {
  const prevPeriod = previousMonthPeriod(bill.dueDate);
  return payments.find(
    (p) =>
      isPaymentHistory(p) &&
      p.studentId === bill.studentId &&
      p.description === bill.description &&
      p.period === prevPeriod,
  );
}

/** First day of the month after the given due date (YYYY-MM-DD). */
export function nextMonthDueDate(dueDate: string): string {
  const [year, month] = dueDate.split("-").map(Number);
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01`;
}

export function isActiveBill(payment: Payment): boolean {
  return payment.status === "pending" || payment.status === "overdue";
}

export function isPaymentHistory(payment: Payment): boolean {
  return payment.status === "paid";
}

/** Roll the active billing record forward to the next month. */
export function advancePaymentToNextMonth(payment: Payment): Partial<Payment> {
  const nextDueDate = nextMonthDueDate(payment.dueDate);
  return {
    dueDate: nextDueDate,
    period: periodFromDueDate(nextDueDate),
    status: "pending",
    paidDate: null,
  };
}

/** Snapshot of a completed payment for Payment History. */
export function buildPaymentHistoryRecord(payment: Payment): Omit<Payment, "id"> {
  return {
    studentId: payment.studentId,
    amount: payment.amount,
    description: payment.description,
    dueDate: payment.dueDate,
    period: payment.period,
    status: "paid",
    paidDate: new Date().toISOString().split("T")[0],
  };
}

/** Next month's active bill after recording a payment. */
export function buildActiveBillFromPayment(payment: Payment): Omit<Payment, "id"> {
  const advanced = advancePaymentToNextMonth(payment);
  return {
    studentId: payment.studentId,
    amount: payment.amount,
    description: payment.description,
    dueDate: advanced.dueDate!,
    period: advanced.period!,
    status: "pending",
    paidDate: null,
  };
}

export function rollForwardPaymentInList(
  payments: Payment[],
  paymentId: number,
): Payment[] {
  return payments.map((p) =>
    p.id === paymentId ? { ...p, ...advancePaymentToNextMonth(p) } : p,
  );
}

/** Archive paid month to history and roll the active bill forward. */
export function recordPaymentAndRollForward(
  payments: Payment[],
  paymentId: number,
): Payment[] {
  const payment = payments.find((p) => p.id === paymentId);
  if (!payment) return payments;

  const historyRecord: Payment = {
    ...buildPaymentHistoryRecord(payment),
    id: Date.now(),
  };
  const rolled = rollForwardPaymentInList(payments, paymentId);
  return [...rolled, historyRecord];
}

export function addPaidPaymentToState(
  payments: Payment[],
  payment: Omit<Payment, "id">,
): Payment[] {
  const temp = { ...payment, id: Date.now() } as Payment;
  const historyRecord: Payment = {
    ...buildPaymentHistoryRecord(temp),
    id: Date.now(),
  };
  const activeBill: Payment = {
    ...buildActiveBillFromPayment(temp),
    id: Date.now() + 1,
  };
  return [...payments, historyRecord, activeBill];
}
