"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { Trash2, Search, DollarSign } from "lucide-react";
import { isPaymentHistory } from "@/lib/recurring-payments";

export default function Payments() {
  const { students, payments, isLoading, deletePayment } = useAppStore();
  const [search, setSearch] = useState("");

  const history = payments.filter(isPaymentHistory);

  const filtered = history.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    return (
      student?.name.toLowerCase().includes(search.toLowerCase()) ||
      student?.studentId.toLowerCase().includes(search.toLowerCase()) ||
      student?.email.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.period.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalCollected = history.reduce((s, p) => s + p.amount, 0);

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
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payment History</h2>
        <p className="text-muted-foreground">
          Completed payments recorded when you mark a bill as paid on the Billing page.
        </p>
      </div>

      <Card className="max-w-sm" data-testid="card-total-collected">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            ₱{totalCollected.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {history.length} payment{history.length !== 1 ? "s" : ""} received
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Completed Payments</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 h-9 w-48"
                data-testid="input-search-payments"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              title="No payment history yet"
              description="When you mark a bill as paid on Billing, it will appear here with the period and paid date."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(payment => {
                  const student = students.find(s => s.id === payment.studentId);
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
                          <a href={`mailto:${student.email}`} className="hover:text-foreground hover:underline">
                            {student.email}
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{payment.description}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.period}</TableCell>
                      <TableCell className="font-semibold text-sm">₱{payment.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.paidDate ?? "—"}</TableCell>
                      <TableCell>
                        <Badge variant="default">Paid</Badge>
                      </TableCell>
                      <TableCell className="text-right">
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
                              <AlertDialogTitle>Delete this history entry?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This removes the {payment.period} payment record for {student?.name}. The active bill on Billing is not affected.
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
