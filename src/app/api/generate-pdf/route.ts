import { generateChatPDF } from '@/lib/ai/pdf/generateChatPDF';
import { authOptions } from '@/lib/auth/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {

     const session = await getServerSession(authOptions)
        
        if (!session?.accessToken) {
          return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    const data = await request.json();
    
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