'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function CVUpload({ onUploadComplete }) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { toast } = useToast();
  const [error, setError] = React.useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF or Word document"
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB"
      });
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const urlResponse = await fetch('/api/upload-url');
      if (!urlResponse.ok) throw new Error('Failed to get upload URL');
      const { url, fields } = await urlResponse.json();

      // Prepare form data
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });
      formData.append('file', file);

      // Upload to S3 with progress tracking
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      await new Promise((resolve, reject) => {
        xhr.open('POST', url, true);
        xhr.onload = () => {
          if (xhr.status === 204) {
            resolve();
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });

      // Save CV record
      const fileUrl = `${url}/${fields.key}`;
      const cvResponse = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileUrl,
          key: fields.key,
          contentType: file.type,
          size: file.size
        }),
      });

      if (!cvResponse.ok) throw new Error('Failed to save CV');

      toast({
        title: "Success",
        description: "CV uploaded successfully"
      });

      onUploadComplete?.();
    } catch (err) {
      setError('Failed to upload CV');
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || 'Failed to upload CV'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button
          size="lg"
          onClick={() => document.getElementById('cv-upload').click()}
          disabled={uploading}
          className="relative"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload CV'}
        </Button>
        <input
          id="cv-upload"
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileUpload}
        />
      </div>

      {uploadProgress > 0 && (
        <div className="w-full space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}