"use client";

import { useState } from "react";
import { useAppStore, type Room } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RoomImageField } from "@/components/room-image-field";
import { RoomThumbnail } from "@/components/room-thumbnail";
import { RoomOccupantsCell } from "@/components/room-occupants-cell";
import { resolveRoomImageUrl } from "@/lib/room-image";
import { toast } from "sonner";

type RoomFormValues = {
  roomNumber: string;
  floor: number;
  capacity: number;
  imageUrl: string | null;
};

function RoomForm({
  room,
  persistToDatabase,
  onSubmit,
  onCancel,
}: {
  room?: Room;
  persistToDatabase: boolean;
  onSubmit: (data: RoomFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const resolvedImage = await resolveRoomImageUrl(imageFile, {
        clearImage,
        persistToDatabase,
      });

      await onSubmit({
        roomNumber: String(formData.get("roomNumber")),
        floor: Number(formData.get("floor")),
        capacity: Number(formData.get("capacity")),
        imageUrl:
          resolvedImage === undefined ? (room?.imageUrl ?? null) : resolvedImage,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save room photo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="space-y-5 py-1">
        <RoomImageField
          currentImageUrl={room?.imageUrl}
          onFileSelect={(file) => {
            setImageFile(file);
            if (file) setClearImage(false);
          }}
          onClear={() => setClearImage(true)}
        />
        <Separator />

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Room details
          </p>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room number</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              placeholder="e.g. 101"
              defaultValue={room?.roomNumber}
              className="h-10"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                min="0"
                placeholder="1"
                defaultValue={room?.floor}
                className="h-10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="2"
                defaultValue={room?.capacity}
                className="h-10"
                required
              />
            </div>
          </div>
        </div>
      </div>
      <DialogFooter className="-mx-6 -mb-6 mt-5 gap-2 border-t bg-muted/30 px-6 py-4 sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[5.5rem]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save room"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function Rooms() {
  const { rooms, students, assignments, isLoading, dataSourceMode, addRoom, updateRoom, deleteRoom } =
    useAppStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const persistToDatabase = dataSourceMode === "database";

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.floor.toString().includes(search),
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "partial":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "full":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground">Manage dormitory rooms, photos, and capacity.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-room">
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left">
              <DialogTitle>Add new room</DialogTitle>
              <DialogDescription>
                Upload a photo and set the room number, floor, and bed capacity.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6">
              <RoomForm
                persistToDatabase={persistToDatabase}
                onSubmit={async (data) => {
                  await addRoom(data);
                  setIsAddOpen(false);
                }}
                onCancel={() => setIsAddOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[88px]">Photo</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[200px]">Occupancy</TableHead>
              <TableHead className="min-w-[9rem]">Occupants</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-10 w-14 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-2 w-full mt-2" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-16 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <EmptyState title="No rooms found" description="Try adjusting your search or add a new room." />
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => {
                const occupancyPercent = (room.currentOccupancy / room.capacity) * 100;

                return (
                  <TableRow key={room.id}>
                    <TableCell>
                      <RoomThumbnail imageUrl={room.imageUrl} roomNumber={room.roomNumber} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium font-mono">{room.roomNumber}</TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(room.status)}`}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={occupancyPercent} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground w-8 text-right">
                          {room.currentOccupancy}/{room.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoomOccupantsCell
                        roomId={room.id}
                        roomNumber={room.roomNumber}
                        assignments={assignments}
                        students={students}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog
                          open={editingRoom?.id === room.id}
                          onOpenChange={(open) => !open && setEditingRoom(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingRoom(room)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
                            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left">
                              <DialogTitle>Edit room</DialogTitle>
                              <DialogDescription>
                                Update the photo or change room details and capacity.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="px-6">
                            <RoomForm
                              room={room}
                              persistToDatabase={persistToDatabase}
                              onSubmit={async (data) => {
                                await updateRoom(room.id, data);
                                setEditingRoom(null);
                              }}
                              onCancel={() => setEditingRoom(null)}
                            />
                            </div>
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the room. Any assigned students will be unassigned.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteRoom(room.id)}
                                className="bg-destructive text-destructive-foreground"
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

