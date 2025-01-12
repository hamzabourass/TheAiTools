"use client"
import React from 'react';
import { Metadata } from 'next';
import { Upload, FileText, Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';


export default function CVManagementPage() {
  const [cvs, setCvs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      const response = await fetch('/api/cvs');
      if (!response.ok) throw new Error('Failed to fetch CVs');
      const data = await response.json();
      setCvs(data);
    } catch (err) {
      setError('Failed to load CVs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Get presigned URL
      const urlResponse = await fetch('/api/upload-url');
      const { url, fields } = await urlResponse.json();

      // Prepare form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error('Upload failed');

      // Save CV record
      const cvResponse = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileUrl: `${url}/${fields.key}`,
        }),
      });

      if (!cvResponse.ok) throw new Error('Failed to save CV');

      fetchCVs();
    } catch (err) {
      setError('Failed to upload CV');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cvId) => {
    try {
      const response = await fetch(`/api/cvs/${cvId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete CV');
      fetchCVs();
    } catch (err) {
      setError('Failed to delete CV');
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
          <div className="flex items-center space-x-2">
            <Button
              size="lg"
              onClick={() => document.getElementById('cv-upload').click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload CV
            </Button>
            <input
              id="cv-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Status */}
        {uploading && (
          <Alert>
            <AlertTitle>Uploading CV...</AlertTitle>
            <AlertDescription>Please wait while your CV is being uploaded.</AlertDescription>
          </Alert>
        )}

        {/* CV Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
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
              <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{cv.filename}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          •••
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(cv.fileUrl, '_blank')}>
                          View CV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(cv.id)}
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
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}