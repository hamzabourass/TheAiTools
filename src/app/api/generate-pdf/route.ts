import { NextResponse } from 'next/server';
import { generateChatPDF } from '@/lib/pdf/generateChatPDF';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Route received data:', data); // Debug log
    
    const pdfBuffer = await generateChatPDF(data);
    console.log('PDF buffer size:', pdfBuffer.length); // Debug log

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