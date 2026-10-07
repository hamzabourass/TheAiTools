import { ChatOpenAI } from "@langchain/openai";
import { evaluationPrompt, requirementsPrompt } from "../prompts/cvAnalysisPrompt";
import {
  AnalysisOptions,
  CVAnalysis,
  CVEvaluation,
  JobRequirements,
  cvEvaluationSchema,
  defaultAnalysisOptions,
  jobRequirementsSchema,
} from "./schema";
import {
  checkKeywords,
  clampScore,
  groundExperienceScore,
  matchScoreCap,
  overallScore,
  requirementCoverage,
} from "./scoring";

const DEFAULT_MODEL = "gpt-6-luna";
// Temperature 0 keeps scoring consistent between runs. Some newer models only accept
// their default temperature (1); those are remembered here after the first rejection.
const PREFERRED_TEMPERATURE = 0;
const DEFAULT_TEMPERATURE = 1;
const modelsWithFixedTemperature = new Set<string>();

function isUnsupportedTemperatureError(error: unknown) {
  const message = (error as Error)?.message ?? '';
  return /temperature/i.test(message) && /unsupported|not supported|does not support|only the default/i.test(message);
}
const MAX_CV_CHARS = 30_000;
const MAX_JOB_CHARS = 15_000;

export class AnalysisError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}

// Undo the most common PDF extraction artifacts before the text reaches the model.
export function cleanCVText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/(\w)-\n(\w)/g, '$1$2') // words hyphenated across lines
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const bulletList = (items: string[]) =>
  items.length ? items.map((item) => `- ${item}`).join('\n') : '- (none stated)';

/**
 * Two-step CV analysis:
 * 1. Extract structured requirements from the job description.
 * 2. Evaluate the CV against each requirement with evidence.
 * Scores are then computed in code from those results so they stay consistent
 * between runs instead of being a number the model makes up.
 */
export class CVAnalyzer {
  private readonly apiKey: string;
  private readonly modelName: string;
  private chains: ReturnType<CVAnalyzer['buildChains']>;

  constructor(apiKey?: string) {
    if (!apiKey && !process.env.OPENAI_API_KEY) {
      throw new AnalysisError(
        'OpenAI API key is required',
        'MISSING_API_KEY'
      );
    }

    this.apiKey = (apiKey || process.env.OPENAI_API_KEY)!;
    this.modelName = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    this.chains = this.buildChains();
  }

  private buildChains() {
    const model = new ChatOpenAI({
      modelName: this.modelName,
      temperature: modelsWithFixedTemperature.has(this.modelName) ? DEFAULT_TEMPERATURE : PREFERRED_TEMPERATURE,
      openAIApiKey: this.apiKey
    });

    // Structured output through a strict JSON schema (response_format) rather than
    // function tools: reasoning models such as gpt-6-luna reject function tools on
    // /v1/chat/completions.
    return {
      requirements: requirementsPrompt.pipe(
        model.withStructuredOutput(jobRequirementsSchema, { name: "job_requirements", method: "jsonSchema" })
      ),
      evaluation: evaluationPrompt.pipe(
        model.withStructuredOutput(cvEvaluationSchema, { name: "cv_evaluation", method: "jsonSchema" })
      ),
    };
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

  private extractRequirements(jobDescription: string): Promise<JobRequirements> {
    return this.chains.requirements.invoke({ jobDescription });
  }

  private evaluate(
    cvText: string,
    jobDescription: string,
    requirements: JobRequirements,
    options: AnalysisOptions
  ): Promise<CVEvaluation> {
    return this.chains.evaluation.invoke({
      cv: cvText,
      jobDescription,
      title: requirements.title || 'the advertised position',
      seniority: requirements.seniority || 'unspecified level',
      requiredYears: requirements.requiredYears != null ? `${requirements.requiredYears}+ years` : 'not stated',
      mustHave: bulletList(requirements.mustHave),
      niceToHave: bulletList(requirements.niceToHave),
      education: bulletList(requirements.education),
      tone: options.tone,
      language: options.language,
      emailInstruction: options.includeEmail
        ? 'Also write the application email.'
        : 'Do NOT write an application email: return empty strings for generatedEmail.',
      interviewInstruction: options.includeInterviewPrep
        ? 'Also list 5 likely interview questions with a tip for answering each, based on this CV and its gaps.'
        : 'Do NOT generate interview questions: return an empty array for interviewQuestions.',
    });
  }

  private score(
    cvText: string,
    requirements: JobRequirements,
    evaluation: CVEvaluation,
    options: AnalysisOptions
  ): CVAnalysis {
    const matches = evaluation.requirementMatches;
    const keywords = checkKeywords(cvText, requirements.keywords);
    const keywordTotal = keywords.present.length + keywords.missing.length;

    const technicalSkills = requirementCoverage(matches) ?? 50;
    const scoreBreakdown = {
      technicalSkills,
      experience: groundExperienceScore(
        evaluation.scoreBreakdown.experience,
        evaluation.experience.relevantYears,
        requirements.requiredYears
      ),
      education: clampScore(evaluation.scoreBreakdown.education),
      softSkills: clampScore(evaluation.scoreBreakdown.softSkills),
      keywords: keywordTotal ? clampScore((keywords.present.length / keywordTotal) * 100) : technicalSkills,
    };

    return {
      ...evaluation,
      targetRole: requirements.title,
      seniority: requirements.seniority,
      matchScore: overallScore(scoreBreakdown, matchScoreCap(matches)),
      scoreBreakdown,
      matchedSkills: matches.filter((m) => m.status !== 'missing').map((m) => m.requirement),
      missingSkills: matches
        .filter((m) => m.status === 'missing')
        .map((m) => ({ skill: m.requirement, importance: m.importance === 'must' ? 'critical' : 'preferred' })),
      experience: {
        relevantYears: Math.max(0, evaluation.experience.relevantYears),
        requiredYears: requirements.requiredYears,
        summary: evaluation.experience.summary,
      },
      keywords,
      interviewQuestions: options.includeInterviewPrep ? evaluation.interviewQuestions : [],
      generatedEmail: options.includeEmail ? evaluation.generatedEmail : { subject: '', body: '' },
    };
  }

  async analyzeCVAndJob(
    rawCvText: string,
    rawJobDescription: string,
    options: AnalysisOptions = defaultAnalysisOptions
  ): Promise<CVAnalysis> {
    this.validateInputs(rawCvText, rawJobDescription);

    const cvText = cleanCVText(rawCvText).slice(0, MAX_CV_CHARS);
    const jobDescription = rawJobDescription.trim().slice(0, MAX_JOB_CHARS);

    const run = async () => {
      const requirements = await this.extractRequirements(jobDescription);
      const evaluation = await this.evaluate(cvText, jobDescription, requirements, options);
      return this.score(cvText, requirements, evaluation, options);
    };

    try {
      try {
        return await run();
      } catch (error) {
        // The model rejected temperature 0: remember that and retry once with its default.
        if (!isUnsupportedTemperatureError(error) || modelsWithFixedTemperature.has(this.modelName)) throw error;
        modelsWithFixedTemperature.add(this.modelName);
        this.chains = this.buildChains();
        return await run();
      }
    } catch (error) {
      throw new AnalysisError(
        'Analysis failed: ' + (error as Error).message,
        'ANALYSIS_ERROR'
      );
    }
  }
}
