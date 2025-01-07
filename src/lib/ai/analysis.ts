// lib/ai/analysis.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

if (!process.env.OPENAI_API_KEY) {
  
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}



console.log(process.env.OPENAI_API_KEY);
// Initialize GPT-3.5 Turbo
const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY
});
// Add explicit scoring criteria
const scoringGuidelines = `
Your scoring must follow these strict rules:
- Base score starts at 0
- Each required technical skill present: +5 points
- Each required soft skill present: +3 points
- Years of experience match: +15 points
- Education requirements match: +10 points
- Industry experience match: +10 points
- Missing critical skills: -10 points each
- Insufficient experience: -15 points
- The final score cannot exceed 85 without exceptional qualifications
- A score above 60 requires meeting all critical requirements
- No score inflation - be brutally honest
`;

const responseValidation = `
Your analysis must include:
- At least 3 concrete missing skills if score is below 70
- At least 5 specific improvements
- Detailed justification for the match score
- Clear explanation why critical requirements are not met
`;

const emailGuidelines = `
The generated email must:
- Acknowledge any significant gaps honestly
- Focus only on directly relevant experience
- Not oversell or exaggerate capabilities
- Include specific examples of relevant projects/achievements
- Keep length between 150-200 words
`;

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a professional CV analyzer with a reputation for being ruthlessly honest and critical. Your analysis must be data-driven and follow these principles:
    
    1. Never inflate scores or qualifications
    2. Flag every mismatch between requirements and experience
    3. Consider both hard and soft requirements as critical
    4. Maintain consistent scoring across all analyses
    5. Provide specific, actionable feedback
    
    ${scoringGuidelines}
    
    ${responseValidation}
    
    ${emailGuidelines}
    `
  ],
  [
    "human",
    `Analyze this CV and job description with strict criteria:

CV:
{cv}

Job Description:
{jobDescription}

Return a JSON response with:
1. technicalSkills: Array of matching technical skills, only include skills with demonstrable experience
2. softSkills: Array of matching soft skills, must be evidenced in CV
3. matchScore: Integer 0-100, following strict scoring guidelines above
4. missingSkills: Array of ALL missing requirements, both technical and soft
5. improvements: Array of specific, actionable improvements with examples
6.  generatedEmail: Write a professional email addressed to the recruiter applying for the job. The email should briefly introduce the candidate, express interest in the position, and highlight key skills and experiences relevant to the job, in Json format email with subject and body .
7. status: "complete"

The analysis must be brutally honest and highlight all gaps.`
  ],
  [
    "assistant",
    "I will perform a rigorous analysis following the strict criteria and scoring guidelines provided."
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