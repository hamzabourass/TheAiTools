'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { FileDown } from 'lucide-react';
import { CategorySelect } from '@/components/CategorySelect';
import { Header } from '@/components/Header';
import { useSession } from "next-auth/react";

export default function DataGeneratorPage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    description: '',
    rows: 100,
    format: 'csv',
    userId: session?.user?.id || '',
  });
  const [generatedData, setGeneratedData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);

  if (!session) return null;

  const handleGenerate = async () => {
    if (isNaN(formData.rows) || formData.rows < 1) {
      console.error('Invalid number of rows');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          export: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      if (data.error) {
        console.error('Generation error:', data.error);
        return;
      }

      setGeneratedData(data.previewData);
      setHeaders(data.headers);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (isNaN(formData.rows) || formData.rows < 1) {
      console.error('Invalid number of rows');
      return;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          export: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Export failed:', errorData);
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-data.${formData.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="text-center py-8 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Data Generator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          Generate custom synthetic data instantly. Choose a category or describe your requirements.
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Category Select */}
          <div className="space-y-2">
            <Label>Category (Optional)</Label>
            <CategorySelect
              onSelect={(description) => setFormData(prev => ({
                ...prev,
                description
              }))}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Data Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[100px] p-3 border rounded-md"
              placeholder="Describe what kind of data you want to generate (e.g., user profiles with name, email, age...)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rows Input */}
            <div className="space-y-2">
              <Label htmlFor="rows">Number of Rows</Label>
              <Input
                id="rows"
                type="number"
                min="1"
                max="1000"
                value={formData.rows}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  setFormData({ ...formData, rows: isNaN(value) ? 1 : value });
                }}
              />
            </div>

            {/* Format Select */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select
                value={formData.format}
                onValueChange={(value) => setFormData({ ...formData, format: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Data'}
          </Button>
        </div>

        {/* Results Table */}
        {generatedData && generatedData.length > 0 && (
          <div className="mt-8 border rounded-lg">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Generated Data Preview
              </h2>
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <FileDown className="w-4 h-4" />
                Export as {formData.format.toUpperCase()}
              </Button>
            </div>

            <div className="p-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {headers.map((header, index) => (
                      <TableHead key={index} className="font-semibold">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedData.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {headers.map((header, colIndex) => (
                        <TableCell key={colIndex}>
                          {row[header]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {generatedData.length > 10 && (
                <div className="text-center text-sm text-gray-500 mt-4 py-2 bg-gray-50 rounded">
                  Showing first 10 rows of {generatedData.length} total rows
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}