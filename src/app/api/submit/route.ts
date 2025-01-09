import { NextResponse } from 'next/server';
import { CVAnalyzer } from '@/lib/ai/cv/analysis';
import mammoth from "mammoth";
import PDFParser from 'pdf2json';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // Initialize PDF parser with type casting to bypass type checks
    const pdfParser = new (PDFParser as any)(null, 1);

    // Handle parsing errors
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF parsing error:', errData.parserError);
      reject(new Error('Failed to parse PDF'));
    });

    // Handle successful parsing
    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const rawText = (pdfParser as any).getRawTextContent();
        console.log('Extracted PDF text:', rawText);
        resolve(rawText);
      } catch (error) {
        console.error('Error extracting text:', error);
        reject(error);
      }
    });

    // Start parsing the PDF
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const email = formData.get('email');
    const jobDescription = formData.get('jobDescription');
    const cvFile = formData.get('cv') as File;

    console.log('Received file:', {
      name: cvFile.name,
      type: cvFile.type,
      size: cvFile.size
    });

    // Validation checks
    if (!email || !jobDescription || !cvFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    try {
      // Convert file to Buffer
      const arrayBuffer = await cvFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      let cvText = '';
      
      // Check file extension
      const fileExt = cvFile.name.split('.').pop()?.toLowerCase();
      console.log('Processing file with extension:', fileExt);

      if (fileExt === 'pdf') {
        console.log('Starting PDF text extraction...');
        cvText = await extractTextFromPDF(buffer);
        console.log('PDF Text extracted. Length:', cvText.length);
      } else if (fileExt === 'docx') {
        const result = await mammoth.extractRawText({ buffer });
        cvText = result.value;
      } else {
        return NextResponse.json({ error: 'Please upload a PDF or DOCX file' }, { status: 400 });
      }

      if (!cvText?.trim()) {
        console.log('No text extracted from file');
        return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
      }

      // Debug log
      console.log('Extracted text preview:', cvText.substring(0, 200));

      // Analyze the CV
      const analyzer = new CVAnalyzer();
      const analysis = await analyzer.analyzeCVAndJob(cvText, jobDescription as string);

      return NextResponse.json({
        status: 'complete',
        ...analysis
      });

    } catch (error: any) {
      console.error('Document processing error:', error);
      return NextResponse.json(
        { error: `Error processing document: ${error.message}` }, 
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}