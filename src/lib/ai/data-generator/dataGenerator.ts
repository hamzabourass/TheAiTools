import { ChatOpenAI } from "@langchain/openai";
import { 
  ChatPromptTemplate, 
  SystemMessagePromptTemplate, 
  HumanMessagePromptTemplate 
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import pLimit from 'p-limit';

// Types and interfaces
export type DataFormat = 'json' | 'csv' | 'xlsx';

export interface GenerateDataParams {
  format: DataFormat;
  rows: number;
  description: string;
  schema?: Record<string, string>;
  userId?: string;
}

export interface GeneratedData {
  data: string | Buffer;
  contentType: string;
  filename: string;
}

interface ChunkGenerationResult {
  data: any[];
  tokenCount: number;
}

// Custom error class for data generation errors
class DataGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'DataGenerationError';
  }
}

export class DataGeneratorService {
  private readonly model: ChatOpenAI;
  private readonly CHUNK_SIZE: number;
  private readonly CONCURRENCY_LIMIT: number;
  private readonly cache: Map<string, any[]>;
  private readonly headers: Map<string, string[]>;
  private readonly schema: Map<string, Record<string, string>>;

  constructor(
    apiKey: string,
    options: {
      chunkSize?: number;
      concurrencyLimit?: number;
      modelName?: string;
      temperature?: number;
    } = {}
  ) {
    if (!apiKey) {
      throw new DataGenerationError(
        'OpenAI API key is required',
        'MISSING_API_KEY'
      );
    }

    this.CHUNK_SIZE = options.chunkSize || 20;
    this.CONCURRENCY_LIMIT = options.concurrencyLimit || 10;
    this.cache = new Map();
    this.headers = new Map();
    this.schema = new Map();

    this.model = new ChatOpenAI({
      modelName: options.modelName || "gpt-3.5-turbo",
      temperature: options.temperature ?? 0.7,
      openAIApiKey: apiKey,
    });
  }

  private createPrompt(
    params: GenerateDataParams, 
    startIndex: number, 
    chunkSize: number
  ): ChatPromptTemplate {
    const systemTemplate = `You are a precise data generator that ONLY outputs data in the exact format requested. 
    Ensure all generated data follows the specified schema and format exactly.`;
    
    const humanTemplate = `Generate ${chunkSize} rows of data starting at index ${startIndex}. 
    Format: ${params.format}
    Description: ${params.description}
    Schema: ${JSON.stringify(this.schema.get(params.userId || 'default'))}
    
    Important: Return ONLY the data in the specified format with no additional text or markdown.`;

    return ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate(humanTemplate),
    ]);
  }

  private cleanOutput(text: string, format: DataFormat): string {
    const cleaned = text
      .replace(/```(?:json|csv)?\s*/g, '')
      .replace(/```\s*$/g, '')
      .trim();

    if (format === 'json') {
      try {
        return JSON.stringify(JSON.parse(cleaned));
      } catch (error) {
        throw new DataGenerationError(
          'Invalid JSON output from model',
          'INVALID_JSON_OUTPUT',
          { rawOutput: cleaned }
        );
      }
    }
    return cleaned;
  }

  private async generateChunk(
    params: GenerateDataParams,
    startIndex: number,
    chunkSize: number
  ): Promise<ChunkGenerationResult> {
    try {
      const prompt = this.createPrompt(params, startIndex, chunkSize);
      const chain = prompt.pipe(this.model).pipe(new StringOutputParser());
      const rawOutput = await chain.invoke({
        format: params.format,
        description: params.description
      });

      const cleanedOutput = this.cleanOutput(rawOutput, params.format);
      const tokenCount = rawOutput.split(' ').length;

      if (params.format === 'json') {
        return {
          data: JSON.parse(cleanedOutput),
          tokenCount
        };
      } else {
        const result = Papa.parse(cleanedOutput, { header: true });
        if (result.errors.length > 0) {
          throw new DataGenerationError(
            'CSV parsing error',
            'CSV_PARSE_ERROR',
            result.errors
          );
        }
        return {
          data: result.data,
          tokenCount
        };
      }
    } catch (error) {
      if (error instanceof DataGenerationError) throw error;
      throw new DataGenerationError(
        'Chunk generation failed',
        'CHUNK_GENERATION_ERROR',
        error
      );
    }
  }

  private async generateChunkWithRetry(
    params: GenerateDataParams,
    startIndex: number,
    chunkSize: number,
    retries = 3
  ): Promise<any[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await this.generateChunk(params, startIndex, chunkSize);
        return result.data;
      } catch (error) {
        const isRateLimit = error.response?.status === 429;
        const canRetry = attempt < retries;
        
        if (isRateLimit && canRetry) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new DataGenerationError(
      'Max retries exceeded',
      'MAX_RETRIES_EXCEEDED'
    );
  }

  private async generateAllData(params: GenerateDataParams): Promise<any[]> {
    this.validateParams(params);

    const numChunks = Math.ceil(params.rows / this.CHUNK_SIZE);
    const limit = pLimit(this.CONCURRENCY_LIMIT);
    const allData: any[] = [];

    if (params.schema) {
      this.schema.set(params.userId || 'default', params.schema);
    }

    const chunkPromises = Array.from({ length: numChunks }, (_, i) => {
      const startIndex = i * this.CHUNK_SIZE;
      const remainingRows = params.rows - startIndex;
      const currentChunkSize = Math.min(this.CHUNK_SIZE, remainingRows);

      return limit(() => this.generateChunkWithRetry(
        params,
        startIndex,
        currentChunkSize
      ));
    });

    try {
      const chunkResults = await Promise.all(chunkPromises);
      chunkResults.forEach(chunkData => allData.push(...chunkData));
      return allData;
    } catch (error) {
      throw new DataGenerationError(
        'Failed to generate all data chunks',
        'BULK_GENERATION_ERROR',
        error
      );
    }
  }

  private validateParams(params: GenerateDataParams): void {
    if (params.rows <= 0) {
      throw new DataGenerationError(
        'Number of rows must be positive',
        'INVALID_ROW_COUNT'
      );
    }
    if (!params.description?.trim()) {
      throw new DataGenerationError(
        'Description is required',
        'MISSING_DESCRIPTION'
      );
    }
  }

  public async generateData(
    params: GenerateDataParams,
    clearCache: boolean = false
  ): Promise<GeneratedData> {
    const cacheKey = params.userId || 'default';

    if (clearCache) {
      this.clearCache(cacheKey);
    }

    try {
      if (!this.cache.get(cacheKey)) {
        this.cache.set(cacheKey, await this.generateAllData(params));
      }

      const cachedData = this.cache.get(cacheKey);
      
      switch (params.format) {
        case 'json':
          return {
            data: JSON.stringify(cachedData, null, 2),
            contentType: 'application/json',
            filename: 'generated-data.json',
          };
        case 'csv':
          return {
            data: Papa.unparse(cachedData),
            contentType: 'text/csv',
            filename: 'generated-data.csv',
          };
        case 'xlsx': {
          const worksheet = XLSX.utils.json_to_sheet(cachedData);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
          return {
            data: XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }),
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filename: 'generated-data.xlsx',
          };
        }
        default:
          throw new DataGenerationError(
            `Unsupported format: ${params.format}`,
            'UNSUPPORTED_FORMAT'
          );
      }
    } catch (error) {
      if (error instanceof DataGenerationError) throw error;
      throw new DataGenerationError(
        'Data generation failed',
        'GENERATION_ERROR',
        error
      );
    }
  }

  public clearCache(userId: string = 'default'): void {
    this.cache.delete(userId);
    this.headers.delete(userId);
    this.schema.delete(userId);
  }
}