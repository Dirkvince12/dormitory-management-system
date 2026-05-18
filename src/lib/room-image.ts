export const ROOM_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ROOM_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function validateRoomImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose a JPEG, PNG, WebP, or GIF image.";
  }
  if (file.size > ROOM_IMAGE_MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

import { uploadRoomImageAction } from "@/actions/dorm";

export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read image file."));
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}

/** Returns a URL for storage, or `undefined` when the image should stay unchanged. */
export async function resolveRoomImageUrl(
  file: File | null,
  options: { clearImage: boolean; persistToDatabase: boolean },
): Promise<string | null | undefined> {
  if (options.clearImage) return null;
  if (!file) return undefined;

  if (options.persistToDatabase) {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRoomImageAction(formData);
  }

  return readImageAsDataUrl(file);
}
