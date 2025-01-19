import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, File } from 'lucide-react';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileIcon(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
      return File;
    default:
      return FileText;
  }
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
