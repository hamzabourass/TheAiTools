'use client';

import { Calendar, Clock} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, getFileIcon } from '@/lib/utils';

export function CVCard({ cv, onDelete }) {
  const { toast } = useToast();
  const FileIcon = getFileIcon(cv.filename);

  const handleView = async () => {
    try {
      // Get fresh URL in case it expired
      const response = await fetch(`/api/cvs/${cv.id}/url`);
      if (!response.ok) throw new Error('Failed to get URL');
      const { url } = await response.json();
      window.open(url, '_blank');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to view CV"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(cv.id);
      toast({
        title: "Success",
        description: "CV deleted successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete CV"
      });
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-muted rounded-lg">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
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
      {cv.analysis && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{cv.analysis}</p>
        </CardContent>
      )}
    </Card>
  );
}