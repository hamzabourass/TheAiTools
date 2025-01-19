'use client';

import React from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

export function CVUpload({ onUploadComplete }) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const { toast } = useToast();

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

    setUploading(true);
    setUploadProgress(0);

    try {
      // Get presigned URL
      const urlResponse = await fetch('/api/upload-url');
      if (!urlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }
      const { url, fields, key } = await urlResponse.json();

      // Create form data
      const formData = new FormData();
      
      // Add all fields from the presigned URL first
      Object.entries(fields).forEach(([fieldName, fieldValue]) => {
        formData.append(fieldName, fieldValue as string);
      });
      
      // Add the file last
      formData.append('file', file);

      // Upload to S3
      const uploadResponse = await fetch(url, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 Error Response:', errorText);
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      // Construct the final URL - you might need to adjust this based on your bucket configuration
      const fileUrl = `${url}/${key}`;

      // Save record in our database
      const cvResponse = await fetch('/api/cvs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          fileUrl,
          key,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!cvResponse.ok) {
        throw new Error('Failed to save CV record');
      }

      toast({
        title: "Success",
        description: "CV uploaded successfully"
      });

      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || 'Failed to upload CV'
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
    </div>
  );
}