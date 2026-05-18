"use client";

import { useAppStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
} from "recharts";
import { TrendingUp, Users, DoorClosed, DollarSign } from "lucide-react";

const COLORS = ["hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)", "hsl(270, 70%, 60%)"];

export default function Reports() {
  const { students, rooms, payments, isLoading } = useAppStore();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-72" />)}
        </div>
      </div>
    );
  }

  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const totalOccupied = rooms.reduce((s, r) => s + r.currentOccupancy, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const collectionRate = payments.length > 0
    ? Math.round((payments.filter(p => p.status === "paid").length / payments.length) * 100)
    : 0;

  const deptMap: Record<string, number> = {};
  students.forEach(s => { deptMap[s.department] = (deptMap[s.department] ?? 0) + 1; });
  const deptData = Object.entries(deptMap).map(([name, value]) => ({ name, value }));

  const roomOccupancyData = rooms.map(r => ({
    name: `Rm ${r.roomNumber}`,
    Occupied: r.currentOccupancy,
    Vacant: r.capacity - r.currentOccupancy,
  }));

  const floorMap: Record<number, { capacity: number; occupied: number }> = {};
  rooms.forEach(r => {
    if (!floorMap[r.floor]) floorMap[r.floor] = { capacity: 0, occupied: 0 };
    floorMap[r.floor].capacity += r.capacity;
    floorMap[r.floor].occupied += r.currentOccupancy;
  });
  const floorData = Object.entries(floorMap).map(([floor, d]) => ({
    name: `Floor ${floor}`,
    Rate: Math.round((d.occupied / d.capacity) * 100),
  }));

  const periodRevenue: Record<string, { period: string; Collected: number; Pending: number; Overdue: number }> = {};
  payments.forEach(p => {
    if (!periodRevenue[p.period]) periodRevenue[p.period] = { period: p.period, Collected: 0, Pending: 0, Overdue: 0 };
    if (p.status === "paid") periodRevenue[p.period].Collected += p.amount;
    else if (p.status === "pending") periodRevenue[p.period].Pending += p.amount;
    else periodRevenue[p.period].Overdue += p.amount;
  });
  const revenueData = Object.values(periodRevenue).sort((a, b) => a.period.localeCompare(b.period));

  const topPayingStudents = students
    .map(s => ({
      name: s.name,
      studentId: s.studentId,
      paid: payments.filter(p => p.studentId === s.id && p.status === "paid").reduce((sum, p) => sum + p.amount, 0),
      pending: payments.filter(p => p.studentId === s.id && p.status !== "paid").reduce((sum, p) => sum + p.amount, 0),
    }))
    .filter(s => s.paid > 0 || s.pending > 0)
    .sort((a, b) => b.paid - a.paid)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">Occupancy trends, revenue breakdown, and dormitory analytics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <DoorClosed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">{totalOccupied} of {totalCapacity} beds filled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">{students.filter(s => s.assignedRoomId !== null).length} assigned to rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Collected to date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <p className="text-xs text-muted-foreground">{payments.filter(p => p.status === "paid").length} of {payments.length} payments received</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Period</CardTitle>
            <CardDescription>Collected vs. pending vs. overdue per billing cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₱${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [`₱${v.toLocaleString()}`, undefined]}
                  />
                  <Legend />
                  <Bar dataKey="Collected" fill={COLORS[1]} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Pending" fill={COLORS[2]} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Overdue" fill={COLORS[3]} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
            <CardDescription>Distribution of enrolled students across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {deptData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [v, "Students"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Occupancy Breakdown</CardTitle>
            <CardDescription>Occupied vs. vacant beds per room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roomOccupancyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" fontSize={11} tickLine={false} axisLine={false} width={52} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Bar dataKey="Occupied" stackId="a" fill={COLORS[0]} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Vacant" stackId="a" fill="hsl(var(--muted))" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupancy Rate by Floor</CardTitle>
            <CardDescription>Percentage of beds filled on each floor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={floorData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))" }}
                    formatter={(v: number) => [`${v}%`, "Occupancy Rate"]}
                  />
                  <Line type="monotone" dataKey="Rate" stroke={COLORS[0]} strokeWidth={2.5} dot={{ fill: COLORS[0], r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Top Paying Students</p>
              {topPayingStudents.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.studentId}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600 dark:text-green-400">₱{s.paid.toLocaleString()}</p>
                    {s.pending > 0 && <Badge variant="secondary" className="text-xs">₱{s.pending.toLocaleString()} pending</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
