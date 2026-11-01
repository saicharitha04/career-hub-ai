import type { Id } from "@/convex/_generated/dataModel";

/**
 * Uploads a file straight to Convex storage via the short-lived URL from
 * files.generateUploadUrl and returns the storage ID to record on a profile.
 */
export async function uploadToStorage(
  file: File,
  generateUploadUrl: () => Promise<string>,
): Promise<Id<"_storage">> {
  const url = await generateUploadUrl();
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/pdf" },
    body: file,
  });
  if (!response.ok) throw new Error("Upload failed — please try again");
  const result = (await response.json()) as { storageId: Id<"_storage"> };
  return result.storageId;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Split a comma-separated input into a clean list of values. */
export function splitList(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}
