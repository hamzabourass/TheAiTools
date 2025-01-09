import { jsPDF } from 'jspdf';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { analysisPrompts, titlePrompt } from '../prompts/pdfAnalysisPrompt';

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
  analysisType: string;
}

// Helper function to detect if text is likely code
function isCodeBlock(text: string): boolean {
  // Common code indicators
  const codePatterns = [
    /^```[\s\S]*?```$/m,                    // Markdown code blocks
    /\b(function|class|import|export)\b/,    // Common programming keywords
    /[{}\[\]()];$/m,                        // Lines ending with common code syntax
    /^\s*(const|let|var)\s+\w+\s*=/m,       // Variable declarations
    /=>/,                                    // Arrow functions
    /^[\s]*if\s*\(.*\)\s*{/m,              // If statements
    /^[\s]*for\s*\(.*\)\s*{/m,             // For loops
    /^[\s]*while\s*\(.*\)\s*{/m,           // While loops
    /\b(return|await|async)\b/,             // Common programming keywords
    /^[\s]*@\w+/m,                          // Decorators
    /<[^>]+>/,                              // HTML/XML tags
    /^[\s]*#include/m,                      // C/C++ includes
    /^[\s]*import\s+.*from/m,               // ES6 imports
    /^[\s]*package\s+\w+/m,                 // Java/Kotlin packages
    /^[\s]*def\s+\w+\s*\(/m,               // Python function definitions
  ];

  return codePatterns.some(pattern => pattern.test(text));
}

async function generateTitle(content: string) {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const chain = titlePrompt.pipe(model).pipe(new StringOutputParser());
    return await chain.invoke({ input: content });
  } catch (error) {
    console.error('Error generating title:', error);
    return "Conversation Analysis Report";
  }
}

async function analyzeChat(messages: Message[], analysisType: string) {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = analysisPrompts[analysisType] || analysisPrompts.summary;
    
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    const chunkSize = 5;
    let analysis = "";
    
    for (let i = 0; i < messages.length; i += chunkSize) {
      const chunk = messages.slice(i, i + chunkSize);
      const chunkContent = chunk.map(m => m.content).join("\n\n");
      
      const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());
      const chunkAnalysis = await chain.invoke({
        input: chunkContent
      });
      
      analysis += chunkAnalysis + "\n\n";
    }

    if (messages.length > chunkSize) {
      const finalChain = chatPrompt.pipe(model).pipe(new StringOutputParser());
      analysis = await finalChain.invoke({ input: analysis });
    }

    return analysis;
  } catch (error) {
    console.error('Error in analyzeChat:', error);
    throw error;
  }
}

export async function generateChatPDF(chatData: ChatData) {
  try {
    let analysis = await analyzeChat(chatData.messages, chatData.analysisType);
    analysis = analysis.replace(/[#*]/g, ''); 
    let title = await generateTitle(analysis);
    title = title.replace(/^"|"$/g, '');

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

    // Set Times Roman font
    doc.setFont('times', 'normal');

    // Title
    doc.setFontSize(24);
    doc.setFont('times', 'bold');
    doc.text(title, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Metadata
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(`Analysis Type: ${chatData.analysisType}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 10;

    // Add a subtle divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Process content with enhanced code block handling
    const sections = analysis.split('\n');
    let inCodeBlock = false;
    let codeBlockBuffer = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) continue;

      // Check for code block markers or detect code
      if (section.startsWith('```') || (section.endsWith('```') && inCodeBlock)) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeBlockBuffer.length > 0) {
          // Render the accumulated code block
          renderCodeBlock(doc, codeBlockBuffer.join('\n'), margin, textWidth, yPos);
          yPos += (codeBlockBuffer.length * 7) + 10;
          codeBlockBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(section);
        continue;
      }

      // Check for inline code or code-like content
      if (isCodeBlock(section)) {
        renderCodeBlock(doc, section, margin, textWidth, yPos);
        yPos += 15;
        continue;
      }

      // Handle different section types
      if (section.toUpperCase() === section && section.length > 3) {
        // Section headers
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text(section, margin, yPos);
        yPos += 8;
      } else if (section.startsWith('•') || section.startsWith('-')) {
        // Bullet points
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        const contentLines = doc.splitTextToSize(section, textWidth - 5);
        
        if (yPos + (contentLines.length * 7) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(contentLines, margin + 5, yPos);
        yPos += contentLines.length * 7 + 3;
      } else {
        // Regular text
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        const contentLines = doc.splitTextToSize(section, textWidth);
        
        if (yPos + (contentLines.length * 7) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(contentLines, margin, yPos);
        yPos += contentLines.length * 7 + 3;
      }
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error in generateChatPDF:', error);
    throw error;
  }
}

// Helper function to render code blocks with proper styling
function renderCodeBlock(doc: jsPDF, code: string, margin: number, textWidth: number, yPos: number) {
  // Save current styles
  const currentFontSize = doc.getFontSize();
  const currentTextColor = doc.getTextColor();

  // Set code block styles
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 128); // Dark blue for code
  
  // Add background
  doc.setFillColor(245, 245, 250); // Light gray-blue background
  const lines = doc.splitTextToSize(code, textWidth - 10);
  const blockHeight = (lines.length * 7) + 6; // Add padding
  
  // Draw background with rounded corners
  doc.roundedRect(margin - 2, yPos - 4, textWidth + 4, blockHeight, 2, 2, 'F');
  
  // Add border
  doc.setDrawColor(220, 220, 230);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin - 2, yPos - 4, textWidth + 4, blockHeight, 2, 2, 'S');

  // Draw code content
  lines.forEach((line: string, index: number) => {
    doc.text(line, margin, yPos + (index * 7));
  });

  // Restore original styles
  doc.setFont('times', 'normal');
  doc.setFontSize(currentFontSize);
  doc.setTextColor(currentTextColor);
  doc.setDrawColor(200, 200, 200);
}