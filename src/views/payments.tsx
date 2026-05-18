"use client";

import { useState } from "react";
import { useAppStore, PaymentStatus } from "@/lib/store";
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
import { Plus, CheckCircle, Trash2, Search, Banknote } from "lucide-react";

const statusConfig: Record<PaymentStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  paid:    { label: "Paid",    variant: "default" },
  pending: { label: "Pending", variant: "secondary" },
  overdue: { label: "Overdue", variant: "destructive" },
};

type FormData = {
  studentId: string;
  amount: string;
  description: string;
  dueDate: string;
  period: string;
  status: PaymentStatus;
};

const empty: FormData = {
  studentId: "",
  amount: "",
  description: "Dormitory Fee",
  dueDate: "",
  period: "",
  status: "pending",
};

export default function Payments() {
  const { students, payments, isLoading, addPayment, deletePayment, markPaymentPaid } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | PaymentStatus>("all");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormData>(empty);

  const filtered = payments.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    const matchesSearch =
      student?.name.toLowerCase().includes(search.toLowerCase()) ||
      student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.period.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = () => {
    if (!form.studentId || !form.amount || !form.dueDate || !form.period) return;
    addPayment({
      studentId: Number(form.studentId),
      amount: Number(form.amount),
      description: form.description,
      dueDate: form.dueDate,
      paidDate: form.status === "paid" ? new Date().toISOString().split("T")[0] : null,
      status: form.status,
      period: form.period,
    });
    setForm(empty);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment</h2>
          <p className="text-muted-foreground">Record and manage individual student payments.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} data-testid="button-add-payment">
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["paid", "pending", "overdue"] as PaymentStatus[]).map(status => {
          const cfg = statusConfig[status];
          const count = payments.filter(p => p.status === status).length;
          const total = payments.filter(p => p.status === status).reduce((s, p) => s + p.amount, 0);
          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all border-2 ${filterStatus === status ? "border-primary" : "border-transparent"}`}
              onClick={() => setFilterStatus(prev => prev === status ? "all" : status)}
              data-testid={`card-filter-${status}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium capitalize">{status}</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₱{total.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{count} payment{count !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>All Payments</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 h-9 w-44"
                  data-testid="input-search-payments"
                />
              </div>
              <Select value={filterStatus} onValueChange={v => setFilterStatus(v as "all" | PaymentStatus)}>
                <SelectTrigger className="h-9 w-32" data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No payments found" description="No payment records match your search or filter." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
                  const cfg = statusConfig[payment.status];
                  return (
                    <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{student?.name ?? "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{student?.studentId}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{payment.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.period}</TableCell>
                      <TableCell className="font-semibold text-sm">₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.dueDate}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.paidDate ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {payment.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                              onClick={() => markPaymentPaid(payment.id)}
                              data-testid={`button-mark-paid-${payment.id}`}
                              title="Mark as paid"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                data-testid={`button-delete-payment-${payment.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this payment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove the {payment.description} record for {student?.name} ({payment.period}).
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePayment(payment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
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
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name} — {s.studentId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="e.g. Dormitory Fee"
                  data-testid="input-payment-description"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Input
                  value={form.period}
                  onChange={e => setForm(f => ({ ...f, period: e.target.value }))}
                  placeholder="e.g. Feb 2026"
                  data-testid="input-payment-period"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="4500"
                  data-testid="input-payment-amount"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  data-testid="input-payment-due-date"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as PaymentStatus }))}>
                <SelectTrigger data-testid="select-payment-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.studentId || !form.amount || !form.dueDate || !form.period}
              data-testid="button-submit-payment"
            >
              Save Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
