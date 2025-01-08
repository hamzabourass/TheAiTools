// lib/ai/analysis.ts
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

if (!process.env.OPENAI_API_KEY) {
  
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}



console.log(process.env.OPENAI_API_KEY);

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
  openAIApiKey: process.env.OPENAI_API_KEY
});

const scoringGuidelines = `
Your scoring should follow these guidelines:
- Base score starts at 0
- Each required technical skill present: +5 points
- Each required soft skill present: +3 points
- Years of experience match: +15 points
- Education requirements match: +10 points
- Industry experience match: +10 points
- Missing critical skills: -5 points each
- Insufficient experience: -10 points
- The final score can exceed 85 if qualifications are strong
- A score above 60 generally requires meeting most critical requirements
- Be fair and balanced in your assessment
`;

const responseValidation = `
Your analysis should include:
- At least 2 concrete missing skills if the score is below 70
- At least 3 specific suggestions for improvement
- A clear explanation of the match score
- A balanced view of strengths and areas for development
`;

const emailGuidelines = `
The generated email should:
- Acknowledge any significant gaps in a constructive manner
- Focus on relevant experience and potential
- Avoid overselling or exaggerating capabilities
- Include specific examples of relevant projects or achievements
- Keep the length between 150-200 words
`;

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a professional CV analyzer known for providing balanced and constructive feedback. Your analysis should be data-driven and follow these principles:
    
    1. Be fair and balanced in your assessment
    2. Highlight both strengths and areas for improvement
    3. Consider both hard and soft requirements
    4. Provide specific, actionable feedback
    5. Allow for some flexibility in matching education and experience
    
    ${scoringGuidelines}
    
    ${responseValidation}
    
    ${emailGuidelines}
    `
  ],
  [
    "human",
    `Analyze this CV and job description with the provided criteria:

CV:
{cv}

Job Description:
{jobDescription}

Return a JSON response with:
1. technicalSkills: Array of matching technical skills or additional skills that can add value, include every technical skill
2. softSkills: Array of matching soft skills, must be evidenced in CV
3. matchScore: Integer 0-100, following the scoring guidelines above
4. missingSkills: Array of missing requirements, both technical and soft and don't add education or language requirements
5. improvements: Array of specific, actionable improvements with examples
6. generatedEmail: Object with subject and body properties for a professional application email
7. status: "complete"

The analysis should be fair, highlighting both strengths and areas for development.`
  ],
  [
    "assistant",
    "I will perform a thorough and balanced analysis following the provided criteria and guidelines."
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