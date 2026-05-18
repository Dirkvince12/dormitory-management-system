"use client";

import { useState } from "react";
import { DoorClosed, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md border bg-muted",
          sizeClasses[size],
          className,
        )}
      >
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <DoorClosed className={size === "sm" ? "h-4 w-4" : "h-6 w-6"} />
        </div>
      </div>
    );
  }

  const thumb = (
    <button
      type="button"
      onClick={() => setLightboxOpen(true)}
      className={cn(
        "group relative shrink-0 overflow-hidden rounded-md border bg-muted transition-all",
        "cursor-zoom-in hover:ring-2 hover:ring-primary/40 hover:ring-offset-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        sizeClasses[size],
        className,
      )}
      aria-label={`View full photo for room ${roomNumber}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={`Room ${roomNumber}`} className="h-full w-full object-cover" />
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/25">
        <ZoomIn className="h-4 w-4 text-white opacity-0 drop-shadow-sm transition-opacity group-hover:opacity-100" />
      </span>
    </button>
  );

  return (
    <>
      <HoverCard openDelay={200} closeDelay={100}>
        <HoverCardTrigger asChild>{thumb}</HoverCardTrigger>
        <HoverCardContent side="right" align="start" className="w-auto p-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`Room ${roomNumber} preview`}
            className="max-h-56 max-w-[min(20rem,70vw)] rounded-md object-contain"
          />
          <p className="mt-1.5 px-1 text-center text-[11px] text-muted-foreground">
            Click for full size
          </p>
        </HoverCardContent>
      </HoverCard>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl gap-0 overflow-hidden border-0 bg-black/95 p-0 text-white sm:rounded-xl">
          <DialogHeader className="absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/80 to-transparent px-6 pb-8 pt-6 text-left">
            <DialogTitle className="text-white">Room {roomNumber}</DialogTitle>
            <DialogDescription className="text-white/70">Room photo</DialogDescription>
          </DialogHeader>
          <div className="flex max-h-[min(85vh,900px)] items-center justify-center p-4 pt-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={`Room ${roomNumber}`}
              className="max-h-[min(80vh,820px)] w-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
