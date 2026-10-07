import { NextResponse } from 'next/server';
import { AnalysisError, CVAnalyzer } from '@/lib/ai/cv/analysis';
import { analysisOptionsSchema, defaultAnalysisOptions } from '@/lib/ai/cv/schema';
import mammoth from "mammoth";
import PDFParser from 'pdf2json';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_JOB_DESCRIPTION_LENGTH = 50;

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    // pdf2json's typings don't expose the raw-text mode constructor
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParser = new (PDFParser as any)(null, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pdfParser.on('pdfParser_dataError', (errData: any) => {
      console.error('PDF parsing error:', errData.parserError);
      reject(new Error('Failed to parse PDF'));
    });

    pdfParser.on('pdfParser_dataReady', () => {
      try {
        const rawText: string = pdfParser.getRawTextContent();
        // Drop pdf2json's page-break markers
        resolve(rawText.replace(/-+Page \(\d+\) Break-+/g, '\n'));
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileExt = file.name.split('.').pop()?.toLowerCase();

  if (fileExt === 'pdf') {
    return extractTextFromPDF(buffer);
  }
  if (fileExt === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new AnalysisError('Please upload a PDF or DOCX file', 'UNSUPPORTED_FILE');
}

function parseOptions(raw: FormDataEntryValue | null) {
  if (typeof raw !== 'string' || !raw) return defaultAnalysisOptions;
  try {
    const parsed = analysisOptionsSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : defaultAnalysisOptions;
  } catch {
    return defaultAnalysisOptions;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const jobDescription = formData.get('jobDescription');
    const cvFile = formData.get('cv');
    const options = parseOptions(formData.get('options'));

    if (!(cvFile instanceof File) || cvFile.size === 0) {
      return NextResponse.json({ error: 'Please upload your CV' }, { status: 400 });
    }
    if (typeof jobDescription !== 'string' || jobDescription.trim().length < MIN_JOB_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Please paste the full job description (at least ${MIN_JOB_DESCRIPTION_LENGTH} characters)` },
        { status: 400 }
      );
    }
    if (cvFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    let cvText: string;
    try {
      cvText = await extractText(cvFile);
    } catch (error) {
      const message = error instanceof AnalysisError
        ? error.message
        : 'We could not read this file. Try exporting your CV to PDF again.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    if (!cvText?.trim()) {
      return NextResponse.json(
        { error: 'No text found in your CV. If it is a scanned image, export a text-based PDF instead.' },
        { status: 400 }
      );
    }

    const analyzer = new CVAnalyzer();
    const analysis = await analyzer.analyzeCVAndJob(cvText, jobDescription, options);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('CV analysis error:', error);
    return NextResponse.json(
      { error: 'The analysis could not be completed. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
