import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {chatPrompt} from "../prompts/cvAnalysisPrompt"
if (!process.env.OPENAI_API_KEY) {
  
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}



console.log(process.env.OPENAI_API_KEY);

const model = new ChatOpenAI({
  modelName: "gpt-4-turbo",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY
});



const chain = chatPrompt
  .pipe(model)
  .pipe(new StringOutputParser());

export class CVAnalyzer {
  async analyzeCVAndJob(cvText: string, jobDescription: string) {
    try {
      console.log('Starting analysis with GPT-4-Turbo...');

      if (!cvText || typeof cvText !== "string") {
        throw new Error('Invalid CV text provided.');
      }
      if (!jobDescription || typeof jobDescription !== "string") {
        throw new Error('Invalid job description provided.');
      }

      const response = await chain.invoke({
        cv: cvText,
        jobDescription: jobDescription,
        chat_history: []
      });

      console.log('Input variables:', { cv: cvText, jobDescription: jobDescription });
      console.log('Raw response:', response);

      // Try to find JSON in the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the response');
      }

      try {
        const analysis = JSON.parse(jsonMatch[0]);
        console.log('Parsed analysis:', analysis);

        const defaultAnalysis = {
          technicalSkills: [],
          softSkills: [],
          matchScore: 0,
          missingSkills: [],
          improvements: [],
          generatedEmail: "",
          status: "complete"
        };

        return { ...defaultAnalysis, ...analysis };
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Failed to parse analysis results');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }
}