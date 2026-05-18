import { DoorClosed } from "lucide-react";
import { cn } from "@/lib/utils";

type RoomThumbnailProps = {
  imageUrl?: string | null;
  roomNumber: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-14",
  md: "h-16 w-24",
  lg: "h-28 w-40",
};

export function RoomThumbnail({ imageUrl, roomNumber, className, size = "sm" }: RoomThumbnailProps) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border bg-muted",
        sizeClasses[size],
        className,
      )}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={`Room ${roomNumber}`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <DoorClosed className={size === "sm" ? "h-4 w-4" : "h-6 w-6"} />
        </div>
      )}
    </div>
  );
}
