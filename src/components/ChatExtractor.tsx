"use client"

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  FileText, 
  Code,
  BookOpen,
  ListChecks,
  MessageSquare,
  BookMarked,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ANALYSIS_TYPES = [
  {
    id: 'summary',
    label: 'Summary',
    icon: BookOpen,
    description: 'Get a concise summary with key points'
  },
  {
    id: 'qa',
    label: 'Q&A Format',
    icon: MessageSquare,
    description: 'Extract questions and answers'
  },
  {
    id: 'keyPoints',
    label: 'Key Points',
    icon: ListChecks,
    description: 'Extract main points and concepts'
  },
  {
    id: 'codeSnippets',
    label: 'Code Snippets',
    icon: Code,
    description: 'Extract and format code examples'
  },
  {
    id: 'studyNotes',
    label: 'Study Notes',
    icon: BookMarked,
    description: 'Create organized study notes'
  }
];

export default function ChatExtractor() {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMessages, setExpandedMessages] = useState({});

  const messagesPerPage = 5; // Number of messages to display per page

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!analysisType) {
      setError('Please select an analysis type');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);
    setCurrentPage(1); // Reset pagination to the first page
    setExpandedMessages({}); // Reset expanded messages

    try {
      const response = await fetch('/api/chat-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, analysisType })
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

  const handleDownload = async () => {
    if (!data) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, analysisType })
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat_${analysisType}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const toggleExpandMessage = (index) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [index]: !prev[index] // Toggle expanded state for the message
    }));
  };

  const renderAnalysisResults = () => {
    if (!data) return null;

    const { messages } = data;
    const totalMessages = messages.length;
    const averageMessageLength = messages.reduce((acc, msg) => acc + msg.content.length, 0) / totalMessages;

    // Pagination logic
    const indexOfLastMessage = currentPage * messagesPerPage;
    const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
    const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);

    const totalPages = Math.ceil(totalMessages / messagesPerPage);

    return (
      <div className="space-y-6 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Analysis Results</h2>
          <Button
            onClick={handleDownload}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {`Generate AI-Powered ${ANALYSIS_TYPES.find(t => t.id === analysisType)?.label} PDF`}
              </>
            )}
          </Button>
        </div>

        {/* Analysis Summary */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Messages</p>
              <p className="text-lg font-semibold">{totalMessages}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Avg. Message Length</p>
              <p className="text-lg font-semibold">{averageMessageLength.toFixed(2)} characters</p>
            </div>
          </div>
        </div>

        {/* Messages Table */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold">Messages</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {currentMessages.map((message, index) => {
                  const globalIndex = indexOfFirstMessage + index;
                  const isExpanded = expandedMessages[globalIndex];
                  return (
                    <tr key={globalIndex}>
                      <td className="px-6 py-4 whitespace-pre-wrap text-sm text-muted-foreground">
                        {isExpanded ? message.content : `${message.content.substring(0, 100)}...`}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpandMessage(globalIndex)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Collapse
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Expand
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination with Arrows */}
          <div className="flex justify-center items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}

        <div className="text-center mb-20 mt-5">
          <h1 className="text-4xl font-bold tracking-tight">ChatGPT Extractor</h1>
          <p className="text-lg text-muted-foreground">
          Convert your ChatGPT chat conversations into organized documents using AI
          </p>
        </div>


        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat URL</label>
              <Input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your chat URL"
                required
                disabled={loading}
              />
            </div>

            {/* Analysis Type Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <Select
                value={analysisType}
                onValueChange={setAnalysisType}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ANALYSIS_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {analysisType && (
                <p className="text-xs text-muted-foreground">
                  {ANALYSIS_TYPES.find(t => t.id === analysisType)?.description}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Analyze Chat
              </>
            )}
          </Button>
        </form>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {data ? renderAnalysisResults() : (
          <div className="space-y-6 rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Analysis Results</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-muted text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Message
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                  <tr>
                    <td className="px-6 py-4 whitespace-pre-wrap text-sm text-muted-foreground">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}