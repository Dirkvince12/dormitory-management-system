"use client";

import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROOM_IMAGE_ACCEPT, validateRoomImageFile } from "@/lib/room-image";
import { cn } from "@/lib/utils";

type RoomImageFieldProps = {
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onClear?: () => void;
  className?: string;
};

export function RoomImageField({
  currentImageUrl,
  onFileSelect,
  onClear,
  className,
}: RoomImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const displayUrl = cleared ? null : previewUrl;

  const handleFile = (file: File | null) => {
    setError(null);
    setCleared(false);
    if (!file) {
      setPreviewUrl(currentImageUrl ?? null);
      onFileSelect(null);
      return;
    }

    const validationError = validateRoomImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    onFileSelect(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setCleared(true);
    onFileSelect(null);
    onClear?.();
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={ROOM_IMAGE_ACCEPT}
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {displayUrl ? (
        <div className="group relative overflow-hidden rounded-xl border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Room preview"
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
            <p className="text-sm font-medium text-white">Room photo</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openPicker();
                }}
              >
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-8 shadow-sm"
                onClick={clearImage}
              >
                <X className="mr-1.5 h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </div>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-3 top-3 h-8 w-8 rounded-full shadow-md sm:hidden"
            onClick={clearImage}
            aria-label="Remove photo"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={openPicker}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            "bg-muted/20 hover:border-primary/50 hover:bg-primary/5",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDragging && "border-primary bg-primary/10",
            error && "border-destructive/50",
          )}
        >
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border",
              isDragging && "ring-primary/30",
            )}
          >
            <ImagePlus
              className={cn("h-6 w-6 text-muted-foreground", isDragging && "text-primary")}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop image here" : "Drag & drop a room photo"}
            </p>
            <p className="text-xs text-muted-foreground">
              or{" "}
              <span className="font-medium text-primary underline-offset-4 hover:underline">
                browse from your device
              </span>
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/80">
            JPEG, PNG, WebP, GIF · max 5 MB
          </p>
        </button>
      )}

      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
