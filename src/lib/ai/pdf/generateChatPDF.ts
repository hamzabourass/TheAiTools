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

function isCodeBlock(text: string): boolean {
  // Check if it's already marked as code with backticks
  if (text.startsWith('```') || text.endsWith('```')) {
    return true;
  }

  // Count code indicators
  let codeIndicators = 0;
  
  // Strong code indicators (more weight)
  const strongPatterns = [
    /^(const|let|var|function|class)\s+[\w$_]/m,      // Variable/function declarations
    /^import\s+.*\s+from\s+['"].*['"]/m,              // ES6 imports
    /^export\s+(default\s+)?(function|class|const)/m,  // ES6 exports
    /^public\s+(class|interface|enum)\s+\w+/m,         // Java/C# class definitions
    /^def\s+\w+\s*\([^)]*\):/m,                       // Python function
    /^package\s+[\w.]+;/m,                             // Java/Kotlin package
    /^#include\s+[<"].*[>"]/m                          // C/C++ include
  ];

  // Medium code indicators
  const mediumPatterns = [
    /\s*if\s*\([^)]+\)\s*{/m,                         // if statements
    /\s*for\s*\([^)]+\)\s*{/m,                        // for loops
    /\s*while\s*\([^)]+\)\s*{/m,                      // while loops
    /^\s*@\w+(\([^)]*\))?$/m,                         // Decorators
    /=>\s*{/,                                          // Arrow function
    /\s*try\s*{\s*$/m,                                // Try blocks
    /^async\s+function/m                               // Async functions
  ];

  // Weak code indicators
  const weakPatterns = [
    /[{}\[\]();]/g,                                    // Code syntax
    /\b(return|await|async)\b/,                        // Keywords
    /['"`].*['"`]/,                                    // String literals
    /\b(true|false|null|undefined)\b/,                 // Constants
    /\b(console|window|document)\./                    // Common objects
  ];

  // Check patterns and count indicators
  strongPatterns.forEach(pattern => {
    if (pattern.test(text)) codeIndicators += 3;
  });

  mediumPatterns.forEach(pattern => {
    if (pattern.test(text)) codeIndicators += 2;
  });

  weakPatterns.forEach(pattern => {
    if (pattern.test(text)) codeIndicators += 1;
  });

  // Additional structural checks
  if (text.split('\n').some(line => line.trim().startsWith('//'))) {
    codeIndicators += 2; // Comments are a good indicator
  }

  if (text.includes('{') && text.includes('}')) {
    codeIndicators += 2; // Matching braces are a good indicator
  }

  // Require multiple indicators for better accuracy
  return codeIndicators >= 4;
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
      modelName: "gpt-3.5-turbo",
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

function renderCodeBlock(doc: jsPDF, code: string, margin: any, textWidth: number, yPos: number) {
  const currentFontSize = doc.getFontSize();
  const currentFont = doc.getFont().fontName;
  
  // Save position for box drawing
  const startY = yPos - 4;
  
  // Set code font and size
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  
  // Clean up code and split into lines
  const cleanCode = code.replace(/```/g, '').trim();
  const lines = doc.splitTextToSize(cleanCode, textWidth - 10);
  const blockHeight = (lines.length * 6) + 8;
  
  // Draw background box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.5);
  doc.rect(margin.left - 2, startY, textWidth + 4, blockHeight, 'FD');
  
  // Draw side marking
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(2);
  doc.line(margin.left, startY, margin.left, startY + blockHeight);
  
  // Add code content with proper indentation
  lines.forEach((line: string, index: number) => {
    // Calculate indentation level based on leading spaces
    const leadingSpaces = line.match(/^\s*/)[0].length;
    const indent = leadingSpaces * 2;
    
    // Remove the leading spaces since we're handling indentation manually
    const trimmedLine = line.trimLeft();
    
    // Draw the line with calculated indentation
    doc.text(trimmedLine, margin.left + 6 + indent, yPos + (index * 6));
  });

  // Restore original styles
  doc.setFont(currentFont, 'normal');
  doc.setFontSize(currentFontSize);
  doc.setDrawColor(0);
  doc.setFillColor(0);
  
  return blockHeight; // Return height for proper spacing
}

function addHeader(doc: jsPDF, pageWidth: number, margin: any) {
  doc.setDrawColor(240, 240, 240);
  doc.setLineWidth(0.3);
  doc.line(margin.left, margin.top - 5, pageWidth - margin.right, margin.top - 5);
}

function addFooter(doc: jsPDF, pageHeight: number, margin: any, pageWidth: number) {
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Add subtle line above footer
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.3);
    doc.line(margin.left, pageHeight - margin.bottom + 10, pageWidth - margin.right, pageHeight - margin.bottom + 10);
    
    // Add page number
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - margin.bottom + 15,
      { align: 'center' }
    );
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

    const margin = {
      top: 25,
      bottom: 25,
      left: 25,
      right: 25
    };
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const textWidth = pageWidth - (margin.left + margin.right);
    let yPos = margin.top;

    doc.setFont('times', 'normal');


    // Title section with improved spacing
    doc.setFontSize(18);
    doc.setFont('times', 'bold');
    doc.text(title, pageWidth / 2, yPos, { align: 'center', maxWidth: textWidth });
    yPos += 15;  // Reduced from 20

    // Add decorative line under title
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.5);
    const titleWidth = Math.min(doc.getTextWidth(title), textWidth);
    const titleLineStart = (pageWidth - titleWidth) / 2;
    doc.line(titleLineStart, yPos - 8, titleLineStart + titleWidth, yPos - 8);

    // Metadata section with subtle box
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    const dateStr = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    doc.setDrawColor(240, 240, 240);
    const metaHeight = 12;  // Reduced from 15
    doc.roundedRect(margin.left, yPos - 5, textWidth, metaHeight, 2, 2, 'S');
    doc.text(`Analysis Type: ${chatData.analysisType}`, margin.left + 5, yPos + 3);
    doc.text(`Generated: ${dateStr}`, pageWidth - margin.right - 5, yPos + 3, { align: 'right' });
    yPos += metaHeight + 10;  // Reduced from 15

    // Process content
    const sections = analysis.split('\n');
    let inCodeBlock = false;
    let codeBlockBuffer = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (!section) {
        yPos += 3;
        continue;
      }

      // Check for page break
      if (yPos > pageHeight - margin.bottom - 20) {
        doc.addPage();
        yPos = margin.top;
        addHeader(doc, pageWidth, margin);
      }

      // Handle code blocks
      if (section.startsWith('```') || (section.endsWith('```') && inCodeBlock)) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeBlockBuffer.length > 0) {
          renderCodeBlock(doc, codeBlockBuffer.join('\n'), margin, textWidth, yPos);
          yPos += (codeBlockBuffer.length * 7) + 15;
          codeBlockBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockBuffer.push(section);
        continue;
      }

      if (isCodeBlock(section)) {
        renderCodeBlock(doc, section, margin, textWidth, yPos);
        yPos += 20;
        continue;
      }

      // Section headers
      if (section.toUpperCase() === section && section.length > 3) {
        yPos += 8;  // Reduced from 15
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        
        // Draw text first
        doc.text(section, margin.left, yPos);
        
        // Add underline after text
        const headerWidth = doc.getTextWidth(section);
        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.4);
        doc.line(margin.left, yPos + 2, margin.left + headerWidth, yPos + 2);
        
        yPos += 8;  // Reduced from 12
      }
      // Bullet points
      else if (section.startsWith('•') || section.startsWith('-')) {
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        
        const bulletIndent = 8;
        const contentLines = doc.splitTextToSize(section.substring(1).trim(), textWidth - bulletIndent);
        
        doc.text('•', margin.left + 3, yPos);
        doc.text(contentLines, margin.left + bulletIndent, yPos);
        yPos += contentLines.length * 6 + 3;  // Reduced spacing
      }
      // Regular text
      else {
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        const contentLines = doc.splitTextToSize(section, textWidth);
        doc.text(contentLines, margin.left, yPos);
        yPos += contentLines.length * 6 + 3;  // Reduced spacing
      }
    }

    // Add footer with page numbers
    addFooter(doc, pageHeight, margin, pageWidth);

    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error in generateChatPDF:', error);
    throw error;
  }
}