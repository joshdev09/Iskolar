import { useState, useCallback } from "react";
import { organizeNotes } from "@/services/api";
import type { OrganizedNotes } from "@/types";

interface UseNoteOrganizerReturn {
  files: File[];
  isLoading: boolean;
  isCopied: boolean;
  error: string | null;
  result: OrganizedNotes | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (index: number) => void;
  handleUpload: () => Promise<void>;
  handleCopy: () => void;
  setError: (error: string | null) => void;
}

export function useNoteOrganizer(): UseNoteOrganizerReturn {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OrganizedNotes | null>(null);

  const addFiles = useCallback((newFiles: File[]) => {
    setError(null);
    setResult(null);
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        if (updated.length === 0) setResult(null);
        return updated;
      });
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await organizeNotes(files);
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [files]);

  const handleCopy = useCallback(() => {
    if (!result) return;

    const actionItemsText =
      result.actionItems.length > 0
        ? result.actionItems.map((i) => `• ${i}`).join("\n")
        : "None";

    const text = [
      `Summary:\n${result.summary}`,
      `Key Points:\n${result.keyPoints.map((p) => `• ${p}`).join("\n")}`,
      `Action Items:\n${actionItemsText}`,
    ].join("\n\n");

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  }, [result]);

  return {
    files,
    isLoading,
    isCopied,
    error,
    result,
    addFiles,
    removeFile,
    handleUpload,
    handleCopy,
    setError,
  };
}
