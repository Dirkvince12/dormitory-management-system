"use client";

import { useState } from "react";
import { useAppStore, Payment, PaymentStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Plus, CheckCircle, Trash2, AlertCircle, Clock, Search, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  sendBulkPaymentReminderAction,
  sendPaymentReminderAction,
} from "@/actions/reminders";
import {
  buildBulkPaymentReminderMailto,
  openPaymentReminderMailto,
  type PaymentReminderDetails,
} from "@/lib/payment-reminder";
import { isActiveBill, periodFromDueDate, findPreviousMonthPaidPayment } from "@/lib/recurring-payments";

import type { Student } from "@/types/entities";

const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid: { label: "Paid", variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

type PaymentFormStatus = "paid" | "pending";

type PaymentFormData = {
  studentId: string;
  amount: string;
  description: string;
  dueDate: string;
  status: PaymentFormStatus;
};

const emptyForm: PaymentFormData = {
  studentId: "",
  amount: "",
  description: "Dormitory Fee",
  dueDate: "",
  status: "pending",
};

function buildReminderDetails(
  payment: Payment,
  student: Student,
): PaymentReminderDetails {
  return {
    email: student.email,
    studentName: student.name,
    description: payment.description,
    amount: payment.amount,
    dueDate: payment.dueDate,
    period: payment.period,
    status: payment.status,
  };
}

async function sendReminder(
  payment: Payment,
  student: Student | undefined,
): Promise<void> {
  if (!student?.email) {
    toast.error("This student has no email on file. Add one in Students first.");
    return;
  }

  const details = buildReminderDetails(payment, student);
  const result = await sendPaymentReminderAction(details);

  if (result.mode === "mailto") {
    openPaymentReminderMailto(details);
    toast.info("Email API not configured — opened your mail app instead. Add RESEND_API_KEY to .env to send automatically.");
    return;
  }

  if (!result.ok) {
    toast.error(result.error);
    return;
  }

  toast.success(`Reminder sent to ${student.email}`);
}

export default function Billing() {
  const { students, payments, isLoading, addPayment, deletePayment, markPaymentPaid } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PaymentStatus>("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<PaymentFormData>(emptyForm);
  const [sendingReminderId, setSendingReminderId] = useState<number | null>(null);
  const [sendingBulk, setSendingBulk] = useState(false);

  const activeBills = payments.filter(isActiveBill);

  const filtered = activeBills.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    const matchesSearch =
      student?.name.toLowerCase().includes(search.toLowerCase()) ||
      student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student?.email.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.period.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = activeBills.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = activeBills.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const selectedStudent = students.find(s => s.id === Number(form.studentId));
  const overduePayments = activeBills.filter(p => p.status === "overdue");
  const overdueEmails = overduePayments
    .map(p => students.find(s => s.id === p.studentId)?.email)
    .filter((email): email is string => Boolean(email));

  const handleBulkRemindOverdue = async () => {
    if (overdueEmails.length === 0) {
      toast.error("No overdue students with email on file.");
      return;
    }

    setSendingBulk(true);
    try {
      const result = await sendBulkPaymentReminderAction(overdueEmails);

      if (result.mode === "mailto") {
        const mailto = buildBulkPaymentReminderMailto(overdueEmails);
        if (mailto) window.location.href = mailto;
        toast.info("Email API not configured — opened your mail app instead.");
        return;
      }

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(`Reminders sent to ${result.count} student${result.count === 1 ? "" : "s"}`);
    } finally {
      setSendingBulk(false);
    }
  };

  const handleAdd = () => {
    if (!form.studentId || !form.amount || !form.dueDate) return;
    addPayment({
      studentId: Number(form.studentId),
      amount: Number(form.amount),
      description: form.description,
      dueDate: form.dueDate,
      paidDate: form.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      status: form.status,
      period: periodFromDueDate(form.dueDate),
    });
    setForm(emptyForm);
    setIsAddOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
          <p className="text-muted-foreground">
            Current bills only. Mark as paid to save to Payment History and advance to the next month.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} data-testid="button-add-payment">
          <Plus className="w-4 h-4 mr-2" />
          Add Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              ₱{totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{activeBills.filter(p => p.status === "pending").length} awaiting payment</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              ₱{totalOverdue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">{overduePayments.length} overdue records</p>
            {overduePayments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={handleBulkRemindOverdue}
                disabled={overdueEmails.length === 0 || sendingBulk}
                data-testid="button-remind-all-overdue"
              >
                <Mail className="mr-2 h-3.5 w-3.5" />
                Remind all overdue
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Current Bills</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bills..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 w-48"
                  data-testid="input-search-payments"
                />
              </div>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v as "all" | PaymentStatus)}>
                <SelectTrigger className="h-9 w-32" data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No active bills" description="No current bills match your search or filter. Add a bill or check Payment History for completed payments." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Previous Month</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  const cfg = statusConfig[payment.status];
                  const previousPaid = findPreviousMonthPaidPayment(payments, payment);
                  return (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{student?.name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{student?.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student?.email ? (
                          <a
                            href={`mailto:${student.email}`}
                            className="hover:text-foreground hover:underline"
                            data-testid={`email-payment-${payment.id}`}
                          >
                            {student.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{payment.description}</TableCell>
                      <TableCell>
                        {previousPaid ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant="outline"
                                className="border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400 font-normal"
                                data-testid={`previous-paid-${payment.id}`}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                {previousPaid.period} paid
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Paid on {previousPaid.paidDate ?? "—"}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="text-xs text-muted-foreground">No prior payment</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.period}</TableCell>
                      <TableCell className="font-medium text-sm">₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.dueDate}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {payment.status !== "paid" && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                  disabled={sendingReminderId === payment.id}
                                  onClick={async () => {
                                    setSendingReminderId(payment.id);
                                    try {
                                      await sendReminder(payment, student);
                                    } finally {
                                      setSendingReminderId(null);
                                    }
                                  }}
                                  data-testid={`button-send-reminder-${payment.id}`}
                                >
                                  <Mail className="w-4 h-4" />
                                  <span className="sr-only">Send reminder</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Send payment reminder</TooltipContent>
                            </Tooltip>
                          )}
                          {payment.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => markPaymentPaid(payment.id)}
                              data-testid={`button-mark-paid-${payment.id}`}
                              title="Record payment and advance to next month"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-payment-${payment.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete payment record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove the {payment.description} record for {student?.name} ({payment.period}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deletePayment(payment.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={v => setForm(f => ({ ...f, studentId: v }))}>
                <SelectTrigger data-testid="select-payment-student">
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name} — {s.studentId} ({s.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedStudent && (
              <div className="space-y-1.5">
                <Label htmlFor="student-email">Email</Label>
                <Input
                  id="student-email"
                  value={selectedStudent.email || "No email on file"}
                  readOnly
                  className="bg-muted/50"
                  data-testid="input-payment-student-email"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Dormitory Fee" data-testid="input-payment-description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount (₱)</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="4500" data-testid="input-payment-amount" />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} data-testid="input-payment-due-date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as PaymentFormStatus }))}>
                <SelectTrigger data-testid="select-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.studentId || !form.amount || !form.dueDate} data-testid="button-submit-payment">
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
