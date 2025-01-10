import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { chatPrompt } from "../prompts/cvAnalysisPrompt";

// Define types for the analysis result
interface TechnicalSkillsAnalysis {
  verifiedSkills: string[];
  missingCriticalSkills: string[];
  outdatedSkills: string[];
  skillEvidence: Record<string, string>;
}

interface ExperienceAnalysis {
  totalRelevantYears: number;
  gapsIdentified: string[];
  skillSpecificExperience: Record<string, string>;
}

interface ScoreCalculation {
  technicalScore: number;
  experienceScore: number;
  educationScore: number;
  industryScore: number;
  totalScore: number;
  detailedCalculation: string;
}

interface MissingRequirements {
  criticalGaps: string[];
  preferredSkills: string[];
  certificationGaps: string[];
}

interface Improvements {
  resumeEnhancements: string[];
  skillDevelopment: string[];
  experienceGaps: string[];
}

interface ApplicationEmail {
  subject: string;
  body: string;
}

interface AnalysisResult {
  technicalSkillsAnalysis: TechnicalSkillsAnalysis;
  experienceAnalysis: ExperienceAnalysis;
  scoreCalculation: ScoreCalculation;
  missingRequirements: MissingRequirements;
  improvements: Improvements;
  applicationEmail: ApplicationEmail;
  status: string;
}

class AnalysisError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

export class CVAnalyzer {
  private readonly model: ChatOpenAI;
  private readonly chain: any; // TODO: Type this properly when LangChain types are available

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new AnalysisError(
        'OpenAI API key is required',
        'MISSING_API_KEY'
      );
    }

    this.model = new ChatOpenAI({
      modelName: "gpt-4-turbo",
      temperature: 0.7,
      openAIApiKey: apiKey || process.env.OPENAI_API_KEY
    });

    this.chain = chatPrompt
      .pipe(this.model)
      .pipe(new StringOutputParser());
  }

  private validateInputs(cvText: string, jobDescription: string): void {
    if (!cvText?.trim()) {
      throw new AnalysisError(
        'CV text is required and cannot be empty',
        'INVALID_CV'
      );
    }
    if (!jobDescription?.trim()) {
      throw new AnalysisError(
        'Job description is required and cannot be empty',
        'INVALID_JOB_DESCRIPTION'
      );
    }
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AnalysisError(
        'Failed to extract JSON from analysis response',
        'INVALID_RESPONSE_FORMAT'
      );
    }

    try {
      return JSON.parse(jsonMatch[0]) as AnalysisResult;
    } catch (error) {
      throw new AnalysisError(
        'Failed to parse analysis results: ' + (error as Error).message,
        'PARSE_ERROR'
      );
    }
  }

  async analyzeCVAndJob(cvText: string, jobDescription: string): Promise<AnalysisResult> {
    try {
      this.validateInputs(cvText, jobDescription);

      const response = await this.chain.invoke({
        cv: cvText,
        jobDescription: jobDescription,
        chat_history: []
      });

      return this.parseAnalysisResponse(response);
    } catch (error) {
      if (error instanceof AnalysisError) {
        throw error;
      }

      throw new AnalysisError(
        'Analysis failed: ' + (error as Error).message,
        'ANALYSIS_ERROR'
      );
    }
  }
}