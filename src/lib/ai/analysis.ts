// lib/ai/analysis.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize GPT-3.5 Turbo
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

// Create the chat prompt template
const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a professional CV analyzer. Provide your analysis in a structured JSON format.`
  ],
  [
    "human",
    `Here is the CV and job description to analyze:

CV:
{cv}

Job Description:
{jobDescription}

Please analyze the CV against the job description and return a structured JSON response with the following fields:
1. **technicalSkills**: A list of technical skills in the CV that match the job requirements.
2. **softSkills**: A list of soft skills in the CV that match the job requirements.
3. **matchScore**: A score from 0 to 100 indicating how well the CV matches the job description.
4. **missingSkills**: A list of skills required in the job description but missing from the CV.
5. **improvements**: Suggestions to enhance the CV for better alignment with the job description.
6. **generatedEmail**: Write a professional email addressed to the recruiter applying for the job. The email should briefly introduce the candidate, express interest in the position, and highlight key skills and experiences relevant to the job.
7. **status**: A string indicating the status of the analysis (e.g., "complete").`
  ],
  [
    "assistant",
    "I will analyze the provided CV and job description and return a structured JSON response with the required fields."
  ],
  new MessagesPlaceholder("chat_history")
]);

const chain = chatPrompt
  .pipe(model)
  .pipe(new StringOutputParser());

export class CVAnalyzer {
  async analyzeCVAndJob(cvText: string, jobDescription: string) {
    try {
      console.log('Starting analysis with GPT-3.5...');

      // Validate input variables
      if (!cvText || typeof cvText !== "string") {
        throw new Error('Invalid CV text provided.');
      }
      if (!jobDescription || typeof jobDescription !== "string") {
        throw new Error('Invalid job description provided.');
      }

      // Invoke the chain with the correct input variables
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

        // Ensure all required fields exist
        const defaultAnalysis = {
          technicalSkills: [],
          softSkills: [],
          matchScore: 0,
          missingSkills: [],
          improvements: [],
          generatedEmail: "",
          status: "complete"
        };

        // Combine default values with actual analysis
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