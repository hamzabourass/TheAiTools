'use client';

import { useState } from 'react';
import { Calendar, Clock, FileText, Loader2, ExternalLink, Trash2, MoreHorizontal } from 'lucide-react';
import { Card,  CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CVCard({ cv, onDelete }) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState(null);

  const handleView = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cvs/${cv.id}/view`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get view URL');
      }
      
      const data = await response.json();
      
      if (!data.url) {
        throw new Error('No URL returned from server');
      }

      window.open(data.url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: "Opening CV",
        description: "Your CV will open in a new tab"
      });
    } catch (error) {
      console.error('View error:', error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error viewing CV",
        description: error.message || "Failed to view CV"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/cvs/${cv.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete CV');
      }

      await onDelete();
      
      toast({
        title: "CV Deleted",
        description: "Your CV has been successfully deleted"
      });
    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Error deleting CV",
        description: error.message || "Failed to delete CV"
      });
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const fileIcon = getFileIcon(cv.filename);

  return (
    <>
      <Card className={cn(
        "hover:shadow-lg transition-all duration-300",
        isLoading && "opacity-70 pointer-events-none"
      )}>
        <CardHeader className="space-y-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-muted rounded-lg">
                {fileIcon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold truncate max-w-[200px]">
                  {cv.filename}
                </CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {cv.size && (
                    <span className="text-sm text-muted-foreground">
                      {formatFileSize(cv.size)}
                    </span>
                  )}
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {getFileType(cv.filename)}
                  </span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-muted"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleView}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View CV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-1 h-3 w-3" />
                <time dateTime={cv.createdAt}>
                  {new Date(cv.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {new Date(cv.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this CV?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your CV.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete CV</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getFileIcon(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-5 w-5 text-blue-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
}

function getFileType(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'PDF Document';
    case 'doc':
    case 'docx':
      return 'Word Document';
    default:
      return 'Document';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}