import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@radix-ui/react-accordion";
import { FileOutput, List, Sparkles } from "lucide-react";

export const ChatConverterDetails = () => (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold">Chat Converter Features</h3>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="conversion">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <FileOutput className="w-5 h-5" />
              Smart Conversion
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 ml-7">
              <li>Convert ChatGPT conversations into well-structured PDF documents</li>
              <li>Maintain formatting and conversation flow</li>
              <li>Support for code blocks and technical content</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="insights">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Powered Insights
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 ml-7">
              <li>Extract key takeaways and important points automatically</li>
              <li>Generate summaries of technical discussions</li>
              <li>Identify action items and follow-ups</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="organization">
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <List className="w-5 h-5" />
              Content Organization
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 ml-7">
              <li>Organize Q&A sections for easy reference</li>
              <li>Create table of contents for longer conversations</li>
              <li>Tag and categorize different types of content</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )