import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { BadgeCheck, FileDown, List, Pencil, Settings2 } from 'lucide-react';

export default function GuidePageContent() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="text-center py-8 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          How to Use the AI Data Generator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto px-4">
          A comprehensive guide to generating custom synthetic data for your projects
        </p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <p className="text-gray-600">
              The AI Data Generator helps you create realistic synthetic data for testing, development, 
              and demonstration purposes. Follow this guide to make the most of its features.
            </p>
          </CardContent>
        </Card>

        {/* Steps */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Step 1 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <List className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle>1. Choose a Category</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Start by selecting a predefined category from the dropdown menu, or skip this step
                if you want to create custom data. Categories provide templates for common data types
                like user profiles, transactions, or product catalogs.
              </p>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Pencil className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle>2. Describe Your Data</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                In the description field, specify what kind of data you need. Be as detailed as possible,
                including the fields you want (e.g., "user profiles with full name, age between 18-65,
                email, and occupation").
              </p>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Settings2 className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle>3. Configure Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Set the number of rows you want to generate (1-1000) and choose your preferred output
                format (CSV). These settings help you control the volume and format of your generated data.
              </p>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <FileDown className="w-8 h-8 text-blue-600" />
              <div>
                <CardTitle>4. Generate and Export</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Click "Generate Data" to preview your results. Review the first 10 rows to ensure
                the data meets your needs. When satisfied, use the Export button to download the
                complete dataset in your chosen format.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BadgeCheck className="w-8 h-8 text-blue-600" />
              <CardTitle>Pro Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                • Use clear, specific descriptions for better results (e.g., "age between 25-40" instead of just "age")
              </p>
              <p className="text-gray-600">
                • Start with a small number of rows to verify the data structure before generating larger datasets
              </p>
              <p className="text-gray-600">
                • Include any specific constraints or patterns you need in your data description
              </p>
              <p className="text-gray-600">
                • Preview the generated data to ensure it matches your requirements before exporting
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}