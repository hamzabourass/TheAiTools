import { jsPDF } from 'jspdf';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

interface Message {
  content: string;
}

interface ChatData {
  success: boolean;
  messages: Message[];
  metadata: {
    title: string;
    url: string;
    extractedAt: string;
  };
}

async function generateTitle(analysis: string) {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const titlePrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Generate a clear, simple title (3-5 words) that captures the main topic of this content."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    const chain = titlePrompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ input: analysis });
  } catch (error) {
    console.error('Error generating title:', error);
    return "Analysis Report";
  }
}

async function analyzeChat(messages: Message[]) {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `Analyze the conversation and provide a clear summary with these sections:

        SUMMARY
        [2-3 sentence overview]

        KEY POINTS
        • [Main point 1]
        • [Main point 2]
        etc.

        INSIGHTS
        • [Key insight 1]
        • [Key insight 2]
        etc.

        CONCLUSIONS
        • [Main conclusion 1]
        • [Main conclusion 2]
        etc.`
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    // Process messages in chunks
    const chunkSize = 5;
    let summary = "";
    
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const chunkContent = chunk.map(m => m.content).join("\n\n");
      
      const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());
      const chunkSummary = await chain.invoke({
        input: chunkContent
      });
      
      summary += chunkSummary + "\n\n";
    }

    const finalPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        `Create a clear, organized summary following this exact format:

        SUMMARY
        [2-3 sentence overview]

        KEY POINTS
        • [Point 1]
        • [Point 2]
        etc.

        INSIGHTS
        • [Insight 1]
        • [Insight 2]
        etc.

        CONCLUSIONS
        • [Conclusion 1]
        • [Conclusion 2]
        etc.`
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    const finalChain = finalPrompt.pipe(model).pipe(new StringOutputParser());
    return await finalChain.invoke({ input: summary });
  } catch (error) {
    console.error('Error in analyzeChat:', error);
    throw error;
  }
}

export async function generateChatPDF(chatData: ChatData) {
  try {
    const analysis = await analyzeChat(chatData.messages);
    const title = await generateTitle(analysis);

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Style constants
    const margin = 25;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const textWidth = pageWidth - (2 * margin);
    let yPos = margin;

    // Simple header line
    doc.setDrawColor(70, 70, 70);
    doc.setLineWidth(0.5);
    doc.line(margin, 15, pageWidth - margin, 15);

    // Title
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, 30, { align: 'center' });

    // Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString(), pageWidth - margin, 40, { align: 'right' });

    yPos = 50;

    // Process content sections
    const sections = analysis.split('\n');
    let currentSection = '';

    sections.forEach((section) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return; // Skip empty lines

      if (['SUMMARY', 'KEY POINTS', 'INSIGHTS', 'CONCLUSIONS'].includes(trimmedSection)) {
        // Section header
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(trimmedSection, margin, yPos);
        yPos += 8;
        currentSection = trimmedSection;
      } else if (trimmedSection.startsWith('•')) {
        // Bullet points
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(trimmedSection, textWidth - 5);
        
        if (yPos + (contentLines.length * 7) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(contentLines, margin + 5, yPos);
        yPos += contentLines.length * 7 + 3;
      } else {
        // Regular text
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const contentLines = doc.splitTextToSize(trimmedSection, textWidth);
        
        if (yPos + (contentLines.length * 7) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(contentLines, margin, yPos);
        yPos += contentLines.length * 7 + 3;
      }
    });

    // Simple footer line
    doc.setDrawColor(70, 70, 70);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error in generateChatPDF:', error);
    throw error;
  }
}