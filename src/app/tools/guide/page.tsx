import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, Database } from "lucide-react";
import Navbar from "@/components/landing/navbar/Navbar";
import { CVAnalyzerSection } from "@/components/guide/CVAnalyzerSection";
import { ChatConverterSection } from "@/components/guide/ChatConverterSection";
import { DataGeneratorSection } from "@/components/guide/DataGeneratorSection";
import { ToolsHero } from "@/components/guide/ToolsHero";

export default function ToolsGuidePage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto py-8 px-4">
          <ToolsHero />
          
          <Tabs defaultValue="cv-analyzer" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="cv-analyzer" className="text-sm">
                <FileText className="w-4 h-4 mr-2" />
                CV Analysis
              </TabsTrigger>
              <TabsTrigger value="chat-converter" className="text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat Converter
              </TabsTrigger>
              <TabsTrigger value="data-generator" className="text-sm">
                <Database className="w-4 h-4 mr-2" />
                Data Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cv-analyzer">
              <CVAnalyzerSection />
            </TabsContent>

            <TabsContent value="chat-converter">
              <ChatConverterSection />
            </TabsContent>

            <TabsContent value="data-generator">
              <DataGeneratorSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}