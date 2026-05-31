"use client";

import { useState } from "react";
import { useAppStore, type Room } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash2, Loader2, Info } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import {
  ROOM_AMENITY_OPTIONS,
  ROOM_BED_TYPES,
  ROOM_CATEGORIES,
  emptyRoomAmenities,
  getBedTypeCapacity,
  getRoomCategoryLabel,
  type RoomAmenities,
  type RoomBedType,
  type RoomCategory,
} from "@/lib/room-amenities";
import { RoomImageField } from "@/components/room-image-field";
import { RoomThumbnail } from "@/components/room-thumbnail";
import { RoomOccupantsCell } from "@/components/room-occupants-cell";
import { RoomDetailsDialog } from "@/components/room-details-dialog";
import { getAvailableBeds } from "@/lib/rooms";
import { resolveRoomImageUrl } from "@/lib/room-image";
import { toast } from "sonner";

type RoomFormValues = {
  roomNumber: string;
  floor: number;
  capacity: number;
  imageUrl: string | null;
  bedType: RoomBedType;
  amenities: RoomAmenities;
  category: RoomCategory;
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
  const [category, setCategory] = useState<RoomCategory | "">(room?.category ?? "");
  const [bedType, setBedType] = useState<RoomBedType | "">(room?.bedType ?? "");
  const [amenities, setAmenities] = useState<RoomAmenities>(
    room?.amenities ?? emptyRoomAmenities(),
  );
  const [capacity, setCapacity] = useState(String(room?.capacity ?? ""));
  const [submitWarning, setSubmitWarning] = useState<string | null>(null);

  const clearSubmitWarning = () => setSubmitWarning(null);

  const hasPhoto = () => {
    if (imageFile) return true;
    if (room?.imageUrl && !clearImage) return true;
    return false;
  };

  const handleBedTypeChange = (value: RoomBedType) => {
    setBedType(value);
    setCapacity(String(getBedTypeCapacity(value)));
    clearSubmitWarning();
  };

  const toggleAmenity = (key: keyof RoomAmenities, checked: boolean) => {
    setAmenities((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const roomNumber = String(formData.get("roomNumber") ?? "").trim();
    const floorValue = formData.get("floor");
    const parsedFloor = Number(floorValue);
    const parsedCapacity = Number(capacity);

    const missingRequired =
      !roomNumber ||
      floorValue === null ||
      String(floorValue).trim() === "" ||
      Number.isNaN(parsedFloor) ||
      !parsedCapacity ||
      parsedCapacity < 1 ||
      !category ||
      !bedType;

    if (missingRequired) {
      setSubmitWarning("Please fill up all required fields");
      return;
    }

    if (!hasPhoto()) {
      setSubmitWarning("Please upload a photo or image");
      return;
    }

    setSubmitWarning(null);
    setIsSubmitting(true);

    try {
      const resolvedImage = await resolveRoomImageUrl(imageFile, {
        clearImage,
        persistToDatabase,
      });

      await onSubmit({
        roomNumber,
        floor: parsedFloor,
        capacity: parsedCapacity,
        imageUrl:
          resolvedImage === undefined ? (room?.imageUrl ?? null) : resolvedImage,
        bedType,
        amenities,
        category,
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
        <div className="space-y-2">
          <Label>
            Room photo <span className="text-destructive">*</span>
          </Label>
          <RoomImageField
            currentImageUrl={room?.imageUrl}
            onFileSelect={(file) => {
              setImageFile(file);
              if (file) {
                setClearImage(false);
                clearSubmitWarning();
              }
            }}
            onClear={() => {
              setClearImage(true);
              setImageFile(null);
            }}
          />
        </div>
        <Separator />

        <div className="space-y-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Room details
          </p>
          <div className="space-y-2">
            <Label htmlFor="roomNumber">
              Room number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              placeholder="e.g. 101"
              defaultValue={room?.roomNumber}
              className="h-10"
              onChange={clearSubmitWarning}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="floor">
                Floor <span className="text-destructive">*</span>
              </Label>
              <Input
                id="floor"
                name="floor"
                type="number"
                min="0"
                placeholder="1"
                defaultValue={room?.floor}
                className="h-10"
                onChange={clearSubmitWarning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">
                Capacity <span className="text-destructive">*</span>
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                placeholder="2"
                value={capacity}
                onChange={(e) => {
                  setCapacity(e.target.value);
                  clearSubmitWarning();
                }}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Auto-filled from bed type; you can adjust if needed.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Room category <span className="text-destructive">*</span>
            </p>
            <RadioGroup
              value={category}
              onValueChange={(v) => {
                setCategory(v as RoomCategory);
                clearSubmitWarning();
              }}
              className="grid grid-cols-2 gap-2"
            >
              {ROOM_CATEGORIES.map((option) => (
                <label
                  key={option.value}
                  htmlFor={`category-${option.value}`}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem
                    id={`category-${option.value}`}
                    value={option.value}
                    data-testid={`radio-category-${option.value}`}
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Bed configuration <span className="text-destructive">*</span>
          </p>
          <RadioGroup
            value={bedType}
            onValueChange={(v) => handleBedTypeChange(v as RoomBedType)}
            className="gap-2"
          >
            {ROOM_BED_TYPES.map((option) => (
              <label
                key={option.value}
                htmlFor={`bed-${option.value}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              >
                <RadioGroupItem
                  id={`bed-${option.value}`}
                  value={option.value}
                  data-testid={`radio-bed-${option.value}`}
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Amenities
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ROOM_AMENITY_OPTIONS.map((option) => (
              <label
                key={option.key}
                htmlFor={`amenity-${option.key}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  id={`amenity-${option.key}`}
                  checked={amenities[option.key]}
                  onCheckedChange={(checked) => toggleAmenity(option.key, checked === true)}
                  data-testid={`checkbox-amenity-${option.key}`}
                />
                <span className="text-sm leading-snug">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="-mx-6 -mb-6 mt-5 border-t bg-muted/30">
        {submitWarning && (
          <p
            className="px-6 pt-4 text-sm font-medium text-destructive"
            role="alert"
            data-testid="room-form-submit-warning"
          >
            {submitWarning}
          </p>
        )}
        <DialogFooter className="gap-2 px-6 py-4 sm:justify-end">
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
      </div>
    </form>
  );
}

export default function Rooms() {
  const { rooms, students, assignments, isLoading, dataSourceMode, addRoom, updateRoom, deleteRoom } =
    useAppStore();
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [detailsRoom, setDetailsRoom] = useState<Room | null>(null);
  const persistToDatabase = dataSourceMode === "database";

  const filteredRooms = rooms.filter(
    (r) =>
      r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.floor.toString().includes(search),
  );

  const getCategoryColor = (category: Room["category"]) => {
    switch (category) {
      case "male":
        return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
      case "female":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
      default:
        return "text-muted-foreground";
    }
  };

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
          <p className="text-muted-foreground">Manage rooms, view details, photos, and capacity.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-room">
              <Plus className="w-4 h-4 mr-2" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl max-h-[90vh] flex flex-col">
            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left shrink-0">
              <DialogTitle>Add new room</DialogTitle>
              <DialogDescription>
                Upload a photo, set room details, category, bed configuration, and amenities.
              </DialogDescription>
            </DialogHeader>
            <div className="px-6 overflow-y-auto flex-1 min-h-0">
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
              <TableHead>Category</TableHead>
              <TableHead>Floor</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Available</TableHead>
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
                    <Skeleton className="h-6 w-14 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-10" />
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
                <TableCell colSpan={10} className="h-32 text-center">
                  <EmptyState title="No rooms found" description="Try adjusting your search or add a new room." />
                </TableCell>
              </TableRow>
            ) : (
              filteredRooms.map((room) => {
                const occupancyPercent = (room.currentOccupancy / room.capacity) * 100;
                const bedsAvailable = getAvailableBeds(room, assignments);

                return (
                  <TableRow key={room.id}>
                    <TableCell>
                      <RoomThumbnail imageUrl={room.imageUrl} roomNumber={room.roomNumber} size="sm" />
                    </TableCell>
                    <TableCell className="font-medium font-mono">{room.roomNumber}</TableCell>
                    <TableCell>
                      {room.category ? (
                        <Badge
                          variant="outline"
                          className={`border-0 capitalize ${getCategoryColor(room.category)}`}
                        >
                          {getRoomCategoryLabel(room.category)}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{room.floor}</TableCell>
                    <TableCell className="text-sm">{room.capacity}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {bedsAvailable === 0 ? (
                        <span className="text-orange-600 dark:text-orange-400">Full</span>
                      ) : (
                        `${bedsAvailable} bed${bedsAvailable === 1 ? "" : "s"}`
                      )}
                    </TableCell>
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
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDetailsRoom(room)}
                          title="View room details"
                          data-testid={`button-room-details-${room.id}`}
                        >
                          <Info className="w-4 h-4" />
                        </Button>
                        <Dialog
                          open={editingRoom?.id === room.id}
                          onOpenChange={(open) => !open && setEditingRoom(null)}
                        >
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setEditingRoom(room)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-xl max-h-[90vh] flex flex-col">
                            <DialogHeader className="space-y-1 px-6 pt-6 pb-0 text-left shrink-0">
                              <DialogTitle>Edit room</DialogTitle>
                              <DialogDescription>
                                Update the photo, room details, bed configuration, or amenities.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="px-6 overflow-y-auto flex-1 min-h-0">
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

      <RoomDetailsDialog
        room={detailsRoom}
        assignments={assignments}
        students={students}
        open={detailsRoom !== null}
        onOpenChange={(open) => !open && setDetailsRoom(null)}
      />
    </div>
  );
}

