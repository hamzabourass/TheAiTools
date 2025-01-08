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
  analysisType: string;
}

// Enhanced analysis prompts for different types (without ** ** markers)
const analysisPrompts = {
  summary: `Analyze the conversation and provide a detailed summary with actionable insights. Focus on extracting key themes, outcomes, and practical recommendations. Follow this format:

    SUMMARY
    Provide a concise yet comprehensive overview of the conversation. Highlight the main purpose, key themes, and any significant outcomes or conclusions.

    KEY POINTS
    • [Main point 1: A key takeaway from the conversation, explained in detail with supporting examples or context]
    • [Main point 2: Another key takeaway, explained in detail with supporting examples or context]
    • [Main point 3: A final key takeaway, explained in detail with supporting examples or context]

    ACTIONABLE INSIGHTS
    • [Insight 1: A specific recommendation or action the user should take, with clear steps or reasoning]
    • [Insight 2: Another recommendation or action, with clear steps or reasoning]
    • [Insight 3: A final recommendation or action, with clear steps or reasoning]

    CONCLUSIONS
    • [Conclusion 1: A high-level takeaway or lesson from the conversation]
    • [Conclusion 2: A final thought or piece of advice for the user]`,

  qa: `Based on the conversation, generate a set of questions and answers that would be useful for preparation or study. Focus on creating hypothetical Q&A pairs that cover the main topics and provide detailed, actionable answers. Follow this format:

    Q&A SUMMARY
    Provide a brief overview of the conversation's main topics and context. Explain why these Q&A pairs are relevant and useful.

    QUESTIONS & ANSWERS
    Q: [Hypothetical question 1: A question someone might ask about this topic]
    A: [Detailed answer 1: Provide a thorough explanation, including examples, steps, or practical advice. Expand on the topic as much as possible.]

    Q: [Hypothetical question 2: A question someone might ask about this topic]
    A: [Detailed answer 2: Provide a thorough explanation, including examples, steps, or practical advice. Expand on the topic as much as possible.]

    KEY TAKEAWAYS
    • [Takeaway 1: A key lesson or insight from the Q&A, with actionable advice]
    • [Takeaway 2: Another key lesson or insight, with actionable advice]
    • [Takeaway 3: A final lesson or insight, with actionable advice]`,

  keyPoints: `Extract and organize the main points and insights from the conversation. Focus on providing detailed explanations and actionable insights. Follow this format:

    OVERVIEW
    Provide a brief context and purpose of the conversation. Explain why these key points are important and how they relate to the main topic.

    KEY POINTS
    • [Point 1: A key insight or idea from the conversation, explained in detail with examples or context]
    • [Point 2: Another key insight or idea, explained in detail with examples or context]
    • [Point 3: A final key insight or idea, explained in detail with examples or context]

    IMPORTANT CONCEPTS
    • [Concept 1: A key concept from the conversation, defined and explained with relevance to the topic]
    • [Concept 2: Another key concept, defined and explained with relevance to the topic]`,

  codeSnippets: `Extract and organize code examples and technical explanations from the conversation. Focus on providing clear, detailed explanations and practical advice. Follow this format:

    TECHNICAL SUMMARY
    Provide a brief overview of the technical content discussed in the conversation. Explain the context and purpose of the code examples.

    CODE EXAMPLES
    [Example 1]
    Description: [What the code does and its purpose, explained in detail]
    Code:
    \`\`\`
    [code content]
    \`\`\`

    TECHNICAL NOTES
    • [Note 1: A key technical detail or insight, explained with practical advice or examples]
    • [Note 2: Another key technical detail or insight, explained with practical advice or examples]`,

  studyNotes: `Create organized study notes from the conversation. Focus on providing clear, detailed explanations and actionable insights. Follow this format:

    TOPIC OVERVIEW
    Provide a brief introduction to the topic. Explain the main purpose and context of the conversation.

    MAIN CONCEPTS
    1. [Concept 1]
       • Detail: [A detailed explanation of the concept, with examples or context]
       • Application: [How this concept can be applied in practice, with actionable advice]
    
    2. [Concept 2]
       • Detail: [A detailed explanation of the concept, with examples or context]
       • Application: [How this concept can be applied in practice, with actionable advice]

    IMPORTANT DEFINITIONS
    • [Term 1: A key term from the conversation, defined and explained with relevance to the topic]
    • [Term 2: Another key term, defined and explained with relevance to the topic]

    STUDY TIPS
    • [Tip 1: A practical tip for studying or applying the topic, with actionable advice]
    • [Tip 2: Another practical tip, with actionable advice]`
};

async function generateTitle(content: string) {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const titlePrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Generate a clear, concise, and professional title (3-5 words) that captures the main topic of this content."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

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
      modelName: "gpt-4",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY
    });

    const prompt = analysisPrompts[analysisType] || analysisPrompts.summary;
    
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(prompt),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);

    // Process messages in chunks
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

    // Final consolidation for longer conversations
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
    const analysis = await analyzeChat(chatData.messages, chatData.analysisType);
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

    // Process content based on analysis type
    const sections = analysis.split('\n');
    let inCodeBlock = false;

    sections.forEach((section) => {
      const trimmedSection = section.trim();
      if (!trimmedSection) return;

      // Handle code blocks for codeSnippets type
      if (chatData.analysisType === 'codeSnippets' && trimmedSection.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (inCodeBlock) {
          doc.setFont('courier', 'normal');
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 128); // Blue for code
          doc.setFillColor(240, 240, 240); // Light gray background
          doc.rect(margin, yPos - 5, textWidth, 10, 'F');
        } else {
          doc.setFont('times', 'normal');
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0); // Black for normal text
        }
        return;
      }

      // Handle different section types
      if (trimmedSection.toUpperCase() === trimmedSection && trimmedSection.length > 3) {
        // Section headers
        yPos += 10;
        doc.setFontSize(16);
        doc.setFont('times', 'bold');
        doc.text(trimmedSection, margin, yPos);
        yPos += 8;
      } else if (trimmedSection.startsWith('•') || trimmedSection.startsWith('-')) {
        // Bullet points
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
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
        doc.setFont(inCodeBlock ? 'courier' : 'times', 'normal');
        const contentLines = doc.splitTextToSize(trimmedSection, textWidth);
        
        if (yPos + (contentLines.length * 7) > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        
        doc.text(contentLines, margin, yPos);
        yPos += contentLines.length * 7 + 3;
      }
    });

    // Footer
    doc.setFontSize(10);
    doc.setFont('times', 'normal');
    doc.setTextColor(100, 100, 100); // Gray text
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 10, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error in generateChatPDF:', error);
    throw error;
  }
}