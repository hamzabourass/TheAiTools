import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export type DataFormat = 'json' | 'csv' | 'xlsx';

export interface GenerateDataParams {
  format: DataFormat;
  rows: number;
  description: string;
  schema?: Record<string, string>;
}

export interface GeneratedData {
  data: string | Buffer;
  contentType: string;
  filename: string;
}

export class DataGeneratorService {
  private model: ChatOpenAI;
  private readonly CHUNK_SIZE = 20;
  private cachedData: any[] | null = null; // Cache for generated data
  private headers: string[] | null = null; // Memory for headers
  private schema: Record<string, string> | null = null; // Memory for schema

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: apiKey,
    });
  }

  private createPrompt(params: GenerateDataParams, startIndex: number, chunkSize: number): ChatPromptTemplate {
    const systemTemplate = `You are a precise data generator that ONLY outputs data in the exact format requested.
    Role: Generate synthetic data
    Output Format: ${params.format.toUpperCase()}
    Required: ONLY output the data, no explanations or text
    Must: Follow exact format rules with no deviations`;

    const humanTemplate = `Format: ${params.format.toUpperCase()}
    Rows to generate: ${chunkSize}
    Starting at index: ${startIndex}

    ${params.format === 'csv' ? `OUTPUT FORMAT MUST BE EXACTLY:
    ${this.headers ? this.headers.join(',') : 'field1,field2,field3'}
    value1,value2,value3
    value4,value5,value6

    REQUIRED CSV RULES:
    1. First row must be headers
    2. Use comma (,) as separator
    3. One record per line
    4. No empty lines
    5. No extra commas
    6. Ensure all rows have the same number of columns as the headers` : ''}

    Data requirements:
    ${params.description}
    ${this.schema ? `Schema: ${JSON.stringify(this.schema, null, 2)}` : ''}

    Remember: Output ONLY the data with NO explanations or additional text.
    Must be parseable ${params.format.toUpperCase()} format.`;

    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);
  }

  private cleanJsonOutput(text: string): string {
    try {
      let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
      const arrayMatch = cleaned.match(/\[\s*{[\s\S]*}\s*\]/);
      if (!arrayMatch) {
        throw new Error('No valid JSON array found');
      }
      cleaned = arrayMatch[0];
      const parsed = JSON.parse(cleaned);
      if (!Array.isArray(parsed)) {
        throw new Error('Output is not a JSON array');
      }
      return JSON.stringify(parsed);
    } catch (error) {
      console.error('JSON cleaning error:', { original: text, error });
      throw new Error(`Invalid JSON structure: ${error.message}`);
    }
  }

  private cleanCsvOutput(text: string): string {
    try {
      // Remove any code block markers (e.g., ```csv```)
      const cleaned = text.replace(/```csv\s*/g, '').replace(/```\s*$/g, '').trim();
  
      // Split into lines and remove empty lines
      const lines = cleaned.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
  
      if (lines.length < 2) {
        throw new Error('CSV must have headers and at least one data row');
      }
  
      // Extract headers
      const headers = lines[0].split(',').map(header => header.trim());
  
      // Store headers in memory if not already set
      if (!this.headers) {
        this.headers = headers;
      }
  
      // Process data rows
      const dataRows = lines.slice(1).map(line => {
        // Handle quoted fields properly
        const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
        const values = [];
        let match;
  
        while ((match = regex.exec(line)) !== null) {
          values.push(match[0].trim());
        }
  
        // Ensure the row has the same number of columns as the headers
        if (values.length !== headers.length) {
          // If not, pad with empty values or truncate
          return headers.map((_, index) => values[index] || '').join(',');
        }
  
        return values.join(',');
      });
  
      // Rebuild the CSV
      return [headers.join(','), ...dataRows].join('\n');
    } catch (error) {
      console.error('CSV cleaning error:', { original: text, error });
      throw new Error(`Invalid CSV structure: ${error.message}`);
    }
  }

  private async generateChunk(params: GenerateDataParams, startIndex: number, chunkSize: number): Promise<any[]> {
    const prompt = this.createPrompt(params, startIndex, chunkSize);
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

    const rawOutput = await chain.invoke({
      format: params.format,
      description: params.description,
    });

    console.log('Raw output:', rawOutput);

    if (params.format === 'json') {
      const cleanJson = this.cleanJsonOutput(rawOutput);
      return JSON.parse(cleanJson);
    } else {
      const cleanCsv = this.cleanCsvOutput(rawOutput);
      const result = Papa.parse(cleanCsv, { header: true });
      if (result.errors.length > 0) {
        throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      }
      return result.data;
    }
  }

  private async generateAllData(params: GenerateDataParams): Promise<any[]> {
    const allData: any[] = [];
    const numChunks = Math.ceil(params.rows / this.CHUNK_SIZE);

    // Store schema in memory if provided
    if (params.schema && !this.schema) {
      this.schema = params.schema;
    }

    for (let i = 0; i < numChunks; i++) {
      const startIndex = i * this.CHUNK_SIZE;
      const remainingRows = params.rows - startIndex;
      const currentChunkSize = Math.min(this.CHUNK_SIZE, remainingRows);

      console.log(`Generating chunk ${i + 1}/${numChunks} (${currentChunkSize} rows)`);
      const chunkData = await this.generateChunk(params, startIndex, currentChunkSize);
      allData.push(...chunkData);
    }

    return allData;
  }

  public async generateData(params: GenerateDataParams, clearCache: boolean = false): Promise<GeneratedData> {
    try {
      // Clear the cache if requested
      if (clearCache) {
        this.clearCache();
      }

      // Generate data only if it hasn't been cached
      if (!this.cachedData) {
        this.cachedData = await this.generateAllData(params);
      }

      // Return data in the requested format
      switch (params.format) {
        case 'json': {
          return {
            data: JSON.stringify(this.cachedData, null, 2),
            contentType: 'application/json',
            filename: 'generated-data.json',
          };
        }

        case 'csv': {
          const csv = Papa.unparse(this.cachedData);
          return {
            data: csv,
            contentType: 'text/csv',
            filename: 'generated-data.csv',
          };
        }

        case 'xlsx': {
          const worksheet = XLSX.utils.json_to_sheet(this.cachedData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

          return {
            data: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: 'generated-data.xlsx',
          };
        }

        default:
          throw new Error(`Unsupported format: ${params.format}`);
      }
    } catch (error) {
      console.error('Generation error:', error);
      throw new Error(`Data generation failed: ${error.message}`);
    }
  }

  // Clear the cache and memory
  public clearCache(): void {
    this.cachedData = null;
    this.headers = null;
    this.schema = null;
  }
}