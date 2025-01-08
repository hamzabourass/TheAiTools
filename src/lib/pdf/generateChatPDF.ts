import { jsPDF } from 'jspdf';

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

export async function generateChatPDF(chatData: ChatData) {
  // Create new jsPDF instance
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set initial position and margins
  const margin = 20;
  let yPos = margin;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const textWidth = pageWidth - (2 * margin);

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(chatData.metadata.title, pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Add metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Extracted at: ${chatData.metadata.extractedAt}`, margin, yPos);
  yPos += 5;
  doc.text(`URL: ${chatData.metadata.url}`, margin, yPos);
  yPos += 10;

  // Add messages
  doc.setFontSize(12);
  chatData.messages.forEach((message, index) => {
    // Split message content into lines that fit within the page width
    const contentLines = doc.splitTextToSize(message.content, textWidth);
    
    // Check if we need a new page
    const contentHeight = contentLines.length * 7; // Approximate height needed
    if (yPos + contentHeight > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }

    // Add message number
    doc.setFont('helvetica', 'bold');
    doc.text(`Message ${index + 1}:`, margin, yPos);
    yPos += 7;

    // Add message content
    doc.setFont('helvetica', 'normal');
    doc.text(contentLines, margin, yPos);
    yPos += contentHeight + 10; // Add spacing between messages
  });

  // Return the PDF as a Buffer
  return Buffer.from(doc.output('arraybuffer'));
}

// API Route handler
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate data structure
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error('Invalid data structure');
    }

    const pdfBuffer = await generateChatPDF(data);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=chat-export.pdf',
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}