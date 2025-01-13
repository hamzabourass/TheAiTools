import { NextRequest } from 'next/server';
import { DataGeneratorService } from '@/lib/ai/data-generator/dataGenerator';
import Papa from 'papaparse';

const generator = new DataGeneratorService(process.env.OPENAI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { format, rows, description, schema, export: shouldExport, userId } = body;

    if (!format || !description || !rows || !userId) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const clearCache = !shouldExport;

    const result = await generator.generateData({
      format,
      rows,
      description,
      schema,
      userId
    }, clearCache);

    if (shouldExport) {

      //generator.clearCache(userId);

      return new Response(result.data, {
        headers: {
          'Content-Type': result.contentType,
          'Content-Disposition': `attachment; filename=${result.filename}`,
        },
      });
    }

    let previewData = [];
    let headers = [];

    if (format === 'json') {
      previewData = JSON.parse(result.data as string);
      headers = Object.keys(previewData[0] || {});
    } else if (format === 'csv') {
      const parsedCsv = Papa.parse(result.data as string, {
        header: true,
        skipEmptyLines: true,
      });
      previewData = parsedCsv.data;
      headers = parsedCsv.meta.fields || [];
    } else if (format === 'xlsx') {
      const jsonStr = result.data.toString();
      try {
        previewData = JSON.parse(jsonStr);
        headers = Object.keys(previewData[0] || {});
      } catch {
        previewData = [];
        headers = [];
      }
    }

    return Response.json({
      previewData,
      headers,
    });
  } catch (error) {
    console.error('Generation error:', error);
    return Response.json(
      { error: 'Failed to generate data' },
      { status: 500 }
    );
  }
}