import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import pLimit from 'p-limit';

export type DataFormat = 'json' | 'csv' | 'xlsx';

export interface GenerateDataParams {
  format: DataFormat;
  rows: number;
  description: string;
  schema?: Record<string, string>;
  userId?: string; // Add userId for cache isolation
}

export interface GeneratedData {
  data: string | Buffer;
  contentType: string;
  filename: string;
}

export class DataGeneratorService {
  private model: ChatOpenAI;
  private readonly CHUNK_SIZE = 20;
  private cache: Map<string, any[]> = new Map(); // Cache for generated data, keyed by userId
  private headers: Map<string, string[]> = new Map(); // Headers cache, keyed by userId
  private schema: Map<string, Record<string, string>> = new Map(); // Schema cache, keyed by userId
  private readonly CONCURRENCY_LIMIT = 10; // Limit concurrent requests to OpenAI

  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
      openAIApiKey: apiKey,
    });
  }

  private createPrompt(params: GenerateDataParams, startIndex: number, chunkSize: number): ChatPromptTemplate {
    const systemTemplate = `You are a precise data generator that ONLY outputs data in the exact format requested.`;
    const humanTemplate = `Generate ${chunkSize} rows of data starting at index ${startIndex}. Format: ${params.format}. Description: ${params.description}. Schema: ${JSON.stringify(this.schema.get(params.userId || 'default'))}.`;
    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);
  }

  private cleanJsonOutput(text: string): string {
    return JSON.stringify(JSON.parse(text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim()));
  }

  private cleanCsvOutput(text: string): string {
    return text.replace(/```csv\s*/g, '').replace(/```\s*$/g, '').trim();
  }

  private async generateChunk(params: GenerateDataParams, startIndex: number, chunkSize: number): Promise<any[]> {
    const prompt = this.createPrompt(params, startIndex, chunkSize);
    const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
    const rawOutput = await chain.invoke({ format: params.format, description: params.description });

    // Estimate token usage
    const tokenCount = rawOutput.split(' ').length;
    console.log(`Tokens used: ${tokenCount}`);

    if (params.format === 'json') {
      return JSON.parse(this.cleanJsonOutput(rawOutput));
    } else {
      const result = Papa.parse(this.cleanCsvOutput(rawOutput), { header: true });
      if (result.errors.length > 0) throw new Error(`CSV parsing error: ${result.errors[0].message}`);
      return result.data;
    }
  }

  private async generateChunkWithRetry(params: GenerateDataParams, startIndex: number, chunkSize: number, retries = 3): Promise<any[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.generateChunk(params, startIndex, chunkSize);
      } catch (error) {
        if (error.response?.status === 429 && attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max retries exceeded');
  }

  private async generateAllData(params: GenerateDataParams): Promise<any[]> {
    const allData: any[] = [];
    const numChunks = Math.ceil(params.rows / this.CHUNK_SIZE);

    // Store schema in memory if provided
    if (params.schema && !this.schema.get(params.userId || 'default')) {
      this.schema.set(params.userId || 'default', params.schema);
    }

    // Set a concurrency limit
    const limit = pLimit(this.CONCURRENCY_LIMIT);

    const chunkPromises = Array.from({ length: numChunks }, (_, i) => {
      const startIndex = i * this.CHUNK_SIZE;
      const remainingRows = params.rows - startIndex;
      const currentChunkSize = Math.min(this.CHUNK_SIZE, remainingRows);

      console.log(`Generating chunk ${i + 1}/${numChunks} (${currentChunkSize} rows)`);
      return limit(() => this.generateChunkWithRetry(params, startIndex, currentChunkSize));
    });

    const chunkResults = await Promise.all(chunkPromises);
    chunkResults.forEach(chunkData => allData.push(...chunkData));

    return allData;
  }

  public async generateData(params: GenerateDataParams, clearCache: boolean = false): Promise<GeneratedData> {
    const cacheKey = params.userId || 'default';

    // Clear the cache if requested
    if (clearCache) {
      this.clearCache(cacheKey);
    }

    // Generate data only if it hasn't been cached
    if (!this.cache.get(cacheKey)) {
      this.cache.set(cacheKey, await this.generateAllData(params));
    }

    // Return data in the requested format
    switch (params.format) {
      case 'json':
        return {
          data: JSON.stringify(this.cache.get(cacheKey), null, 2),
          contentType: 'application/json',
          filename: 'generated-data.json',
        };
      case 'csv':
        return {
          data: Papa.unparse(this.cache.get(cacheKey)),
          contentType: 'text/csv',
          filename: 'generated-data.csv',
        };
      case 'xlsx': {
        const worksheet = XLSX.utils.json_to_sheet(this.cache.get(cacheKey));
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
  }

  // Clear the cache and memory for a specific user
  public clearCache(userId: string = 'default'): void {
    this.cache.delete(userId);
    this.headers.delete(userId);
    this.schema.delete(userId);
  }
}