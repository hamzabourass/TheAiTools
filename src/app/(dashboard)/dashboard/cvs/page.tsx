'use client';

import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import { CVUpload } from '@/components/CVUpload';
import { CVCard } from '@/components/CVCard';
import { useToast } from '@/hooks/use-toast';

export default function CVManagementPage() {
  const [cvs, setCvs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { toast } = useToast();

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/cvs');
      if (!response.ok) throw new Error('Failed to fetch CVs');
      const data = await response.json();
      setCvs(data);
    } catch (err) {
      setError('Failed to load CVs');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load CVs"
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCVs();
  }, []);

  const handleDelete = async (cvId) => {
    try {
      // Optimistically remove the CV from the UI
      setCvs((prevCvs) => prevCvs.filter((cv) => cv.id !== cvId));

      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // If delete fails, revert the UI and show error
        fetchCVs(); // Reload the CVs to ensure UI is in sync
        throw new Error('Failed to delete CV');
      }

      toast({
        title: "Success",
        description: "CV deleted successfully"
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete CV"
      });
      console.error('Delete error:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">CV Management</h1>
              <p className="text-muted-foreground mt-2">
                Upload and manage your curriculum vitae documents
              </p>
            </div>
            <CVUpload onUploadComplete={fetchCVs} />
          </div>

          {/* CV Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : cvs.length === 0 ? (
              <Card className="col-span-full p-6">
                <CardContent className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle>No CVs uploaded yet</CardTitle>
                  <CardDescription>
                    Upload your first CV to get started
                  </CardDescription>
                </CardContent>
              </Card>
            ) : (
              cvs.map((cv) => (
                <CVCard
                  key={cv.id}
                  cv={cv}
                  onDelete={() => handleDelete(cv.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}