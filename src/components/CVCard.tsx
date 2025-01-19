'use client';

import { Calendar, Clock, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export function CVCard({ cv, onDelete }) {
  const { toast } = useToast();

  const handleView = async () => {
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
      
      const { url } = await response.json();
      
      if (!url) {
        throw new Error('No URL returned from server');
      }

      // Open in new tab with noopener for security
      window.open(url, '_blank', 'noopener');
    } catch (error) {
      console.error('View error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to view CV"
      });
    }
  };

  const handleDelete = async () => {
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
        title: "Success",
        description: "CV deleted successfully"
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete CV"
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{cv.filename}</CardTitle>
              {cv.size && (
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(cv.size)}
                </p>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                •••
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleView}>
                View CV
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={handleDelete}
              >
                Delete CV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(cv.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              {new Date(cv.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}