'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ViewCVDialog({
  isOpen,
  onClose,
  url,
  filename,
  isLoading
}: {
  isOpen: boolean;
  onClose: () => void;
  url?: string;
  filename: string;
  isLoading: boolean;
}) {
  const { toast } = useToast();

  // Function to determine if we can preview the file
  const canPreview = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  };

  const handleDownload = async () => {
    if (!url) return;

    try {
      // Fetch the file
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');

      // Get the blob
      const blob = await response.blob();

      // Create blob URL
      const blobUrl = window.URL.createObjectURL(blob);

      // Create temporary link
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;

      // Append to document, click, and cleanup
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke the blob URL to free up memory
      window.URL.revokeObjectURL(blobUrl);

      toast({
        title: "Download started",
        description: "Your file will be downloaded shortly"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        variant: "destructive",
        title: "Download failed",
        description: "Failed to download the file. Please try again."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{filename}</DialogTitle>
            <div className="flex items-center gap-2">
              {url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="mt-3 mr-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}

            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 mt-4 relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : url ? (
            canPreview(filename) ? (
              <iframe
                src={url}
                className="w-full h-full rounded-md border"
                title={`Preview of ${filename}`}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                <p>This file type cannot be previewed.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="mt-4"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to view
                </Button>
              </div>
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              Failed to load preview
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}