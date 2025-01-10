// components/PromptGuide.tsx
import { Lightbulb, FileText, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PromptGuide() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          Prompt Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section 1: Tips for Effective Prompts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Tips for Effective Prompts
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Be specific:</strong> Clearly describe the data you need. For example, &quot;Generate 100 rows of user data with name, email, and age.&quot;
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Include examples:</strong> Provide sample data to guide the output. For example, &quot;Example: John Doe, john@example.com, 28.&quot;
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Specify format:</strong> Mention the desired format (e.g., CSV). For example, &quot;Output in CSV format with headers: name, email, age.&quot;
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Avoid ambiguity:</strong> Use clear and concise language to avoid misunderstandings.
              </span>
            </li>
          </ul>
        </div>

        {/* Section 2: Example Prompts */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Example Prompts
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>User Data:</strong> &quot;Generate 100 rows of user data with the following fields: name (string), email (string), age (number). Output in CSV format.&quot;
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Product Listings:</strong> &quot;Create 50 product listings with fields: product_id (number), name (string), price (number), category (string). Output in CSV format.&quot;
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Sales Data:</strong> &quot;Generate sales data for the last year with fields: date (string), amount (number), region (string). Output in CSV format.&quot;
              </span>
            </li>
          </ul>
        </div>

        {/* Section 3: Formatting Tips */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Formatting Tips
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>CSV Format:</strong> Ensure the first row contains headers, and each subsequent row contains data. Use commas to separate fields.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Consistency:</strong> All rows must have the same number of columns as the headers.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>
                <strong>Quoting:</strong> Use double quotes for fields that contain commas or special characters.
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}