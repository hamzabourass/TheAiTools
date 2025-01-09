import { jsPDF } from 'jspdf';
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BufferMemory } from "langchain/memory";
import { analysisPrompts, titlePrompt } from '../prompts/pdfAnalysisPrompt';

interface Message {
  content: string;
  role?: string;
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

// Enhanced code detection
function isCodeBlock(text: string): boolean {
  if (!text) return false;
  const codePatterns = [
    /^```[\s\S]*?```$/m,
    /\b(function|class|import|export)\b/,
    /[{}\[\]()];$/m,
    /^\s*(const|let|var)\s+\w+\s*=/m
  ];
  return codePatterns.some(pattern => pattern.test(text));
}

class ProcessingManager {
  private readonly TIMEOUT_MS = 180000; // 3 minutes
  private readonly CHUNK_SIZE: number;
  private readonly memory: BufferMemory;
  private readonly model: ChatOpenAI;

  constructor(model: ChatOpenAI, chunkSize = 5) {
    this.model = model;
    this.CHUNK_SIZE = chunkSize;
    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "chat_history",
      inputKey: "input",
      outputKey: "output"
    });
  }

  async processChunk(messages: Message[]): Promise<string> {
    const content = messages.map(m => m.content).join("\n\n");
    
    try {
      await this.memory.saveContext(
        { input: content },
        { output: "" }
      );

      const summary = await this.memory.loadMemoryVariables({});
      return summary.chat_history?.[0]?.content || content;
    } catch (error) {
      console.error('Chunk processing error:', error);
      return content;
    }
  }

  async process(messages: Message[], analysisType: string): Promise<string> {
    const chunks: Message[][] = [];
    for (let i = 0; i < messages.length; i += this.CHUNK_SIZE) {
      chunks.push(messages.slice(i, i + this.CHUNK_SIZE));
    }

    console.log(`Processing ${chunks.length} chunks...`);
    
    let analysis = "";
    const prompt = analysisPrompts[analysisType] || analysisPrompts.summary;
    
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    // Process chunks with timeout
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Chunk processing timeout')), this.TIMEOUT_MS);
      });

      try {
        const chunkContent = await Promise.race([
          this.processChunk(chunk),
          timeoutPromise
        ]);

        const chain = chatPrompt.pipe(this.model).pipe(new StringOutputParser());
        const chunkAnalysis = await chain.invoke({ input: chunkContent });
        analysis += chunkAnalysis + "\n\n";
      } catch (error) {
        console.error(`Error processing chunk ${i + 1}:`, error);
        continue; // Skip failed chunk and continue
      }
    }

    return analysis.trim();
  }
}

class PDFGenerator {
  private doc: jsPDF;
  private margin = 25;
  private pageWidth: number;
  private pageHeight: number;
  private textWidth: number;
  private yPos: number;

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.textWidth = this.pageWidth - (2 * this.margin);
    this.yPos = this.margin;
  }

  private checkPageBreak(height: number): boolean {
    if (this.yPos + height > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.yPos = this.margin;
      return true;
    }
    return false;
  }

  addTitle(title: string) {
    this.doc.setFontSize(24);
    this.doc.setFont('times', 'bold');
    this.doc.text(title, this.pageWidth / 2, this.yPos, { align: 'center' });
    this.yPos += 15;
  }

  addMetadata(metadata: Record<string, string>) {
    this.doc.setFontSize(10);
    this.doc.setFont('times', 'normal');
    Object.entries(metadata).forEach(([key, value]) => {
      this.doc.text(`${key}: ${value}`, this.pageWidth - this.margin, this.yPos, { align: 'right' });
      this.yPos += 5;
    });
  }

  addContent(text: string, isCode = false) {
    if (!text.trim()) return;

    if (isCode) {
      this.doc.setFont('courier', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(0, 0, 128);
    } else {
      this.doc.setFont('times', 'normal');
      this.doc.setFontSize(12);
      this.doc.setTextColor(0);
    }

    const lines = this.doc.splitTextToSize(text, this.textWidth);
    const height = lines.length * (isCode ? 7 : 7);

    if (this.checkPageBreak(height)) {
      // Reset position after page break
      this.yPos = this.margin;
    }

    if (isCode) {
      // Add code block background
      this.doc.setFillColor(245, 245, 250);
      this.doc.rect(this.margin - 2, this.yPos - 4, this.textWidth + 4, height + 8, 'F');
    }

    this.doc.text(lines, this.margin, this.yPos);
    this.yPos += height + (isCode ? 10 : 5);
  }

  addFooter() {
    this.doc.setFont('times', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(100);
    this.doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      this.pageWidth / 2,
      this.pageHeight - 10,
      { align: 'center' }
    );
  }

  generateBuffer(): Buffer {
    return Buffer.from(this.doc.output('arraybuffer'));
  }
}

export async function generateChatPDF(chatData: ChatData) {
  try {
    console.log('Starting PDF generation process...');
    
    // Initialize models
    const initialModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-16k",
      temperature: 0.7,
      maxTokens: 4000,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const titleModel = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      maxTokens: 50,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    // Process content
    const processor = new ProcessingManager(initialModel);
    console.log('Analyzing conversation...');
    const analysis = await processor.process(chatData.messages, chatData.analysisType);
    
    // Generate title
    console.log('Generating title...');
    const titleChain = titlePrompt.pipe(titleModel).pipe(new StringOutputParser());
    const title = await titleChain.invoke({ input: analysis.substring(0, 1000) })
      .then(t => t.replace(/^"|"$/g, ''))
      .catch(() => "Conversation Analysis");

    // Generate PDF
    console.log('Creating PDF document...');
    const pdfGenerator = new PDFGenerator();
    
    // Add title and metadata
    pdfGenerator.addTitle(title);
    pdfGenerator.addMetadata({
      'Analysis Type': chatData.analysisType,
      'Date': new Date().toLocaleDateString()
    });

    // Process content sections
    const sections = analysis.split('\n');
    let inCodeBlock = false;
    let codeBuffer = [];

    for (const section of sections) {
      if (!section.trim()) continue;

      if (section.includes('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock && codeBuffer.length > 0) {
          pdfGenerator.addContent(codeBuffer.join('\n'), true);
          codeBuffer = [];
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(section);
        continue;
      }

      pdfGenerator.addContent(section, isCodeBlock(section));
    }

    pdfGenerator.addFooter();
    
    console.log('PDF generation completed');
    return pdfGenerator.generateBuffer();

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('PDF generation failed: ' + (error as Error).message);
  }
}