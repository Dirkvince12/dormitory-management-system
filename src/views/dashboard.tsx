"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DoorClosed, Bed, AlertCircle, CreditCard, TrendingUp, Clock, ArrowRight } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function Dashboard() {
  const { students, rooms, assignments, payments, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="h-96 md:col-span-4" />
          <Skeleton className="h-96 md:col-span-3" />
        </div>
      </div>
    );
  }

  const totalCapacity = rooms.reduce((acc, room) => acc + room.capacity, 0);
  const totalOccupied = rooms.reduce((acc, room) => acc + room.currentOccupancy, 0);
  const availableBeds = totalCapacity - totalOccupied;
  const occupiedRooms = rooms.filter(r => r.status === "full" || r.status === "partial").length;

  const chartData = rooms.map(room => ({
    name: room.roomNumber,
    Occupancy: room.currentOccupancy,
    Capacity: room.capacity,
  }));

  const recentAssignments = [...assignments]
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
    .slice(0, 5);

  const totalCollected = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const overdueCount = payments.filter(p => p.status === "overdue").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of dormitory capacity and recent activity.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered in system</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Beds</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBeds}</div>
            <p className="text-xs text-muted-foreground">Out of {totalCapacity} total beds</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
            <DoorClosed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">Out of {rooms.length} total rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.filter(s => s.assignedRoomId === null).length}</div>
            <p className="text-xs text-muted-foreground">Needing room assignments</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <CardTitle className="text-base">Billing Overview</CardTitle>
            </div>
            <Link href="/billing">
              <Button size="sm" data-testid="button-dashboard-new-payment">
                New Payment
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-500" /> Collected</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">₱{totalCollected.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3 text-yellow-500" /> Pending</p>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">₱{totalPending.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertCircle className="w-3 h-3 text-red-500" /> Overdue</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">₱{totalOverdue.toLocaleString()}</p>
              {overdueCount > 0 && <Badge variant="destructive" className="text-xs">{overdueCount} records</Badge>}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/50">
            <Link href="/billing" className="text-xs text-primary flex items-center gap-1 hover:underline w-fit" data-testid="link-view-all-payments">
              View all payment records <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Room Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    cursor={{fill: 'var(--color-muted)'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-card)', color: 'var(--color-foreground)' }}
                  />
                  <Bar dataKey="Occupancy" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Capacity" fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentAssignments.map(assignment => {
                const student = students.find(s => s.id === assignment.studentId);
                const room = rooms.find(r => r.id === assignment.roomId);
                if (!student || !room) return null;
                
                return (
                  <div key={assignment.id} className="flex items-center">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                      {student.name.charAt(0)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned to Room {room.roomNumber}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(assignment.assignedAt), { addSuffix: true })}
                    </div>
                  </div>
                );
              })}
              {recentAssignments.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No recent assignments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
