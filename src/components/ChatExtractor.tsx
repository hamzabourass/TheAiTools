import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function ChatExtractor() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch('/api/chat-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to extract chat content');
      }

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
      <CardHeader className="text-center">
      <CardTitle className="text-3xl font-bold text-gray-800">Chat Content Extractor</CardTitle>
      <CardDescription className="text-lg text-gray-600">
        Enter a chat URL to extract and analyze its content
      </CardDescription>
    </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter chat URL"
                required
                disabled={loading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                'Extract Chat'
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>

        {data && (
          <CardContent className="border-t">
            <div className="space-y-2">
              <h3 className="font-medium">Extracted Content</h3>
              <pre className="bg-slate-50 p-4 rounded-lg overflow-auto text-sm">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}