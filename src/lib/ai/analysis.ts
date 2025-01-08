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
- Keep the length between 200-300 words
`;

const chatPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a strict professional HR known for providing detailed and thorough feedback. Pay special attention to:
    
    1. Skills mentioned in ALL sections of the CV:
       - Work experience descriptions
       - Project details
       - Certifications and courses
       - Technical skills section
       - Academic projects
       - Volunteering/extracurricular activities
    
    2. Implicit skills that can be inferred from:
       - Technologies used in projects
       - Tools mentioned in work experience
       - Methods/processes described in achievements
       - Skills demonstrated through certifications
       
    3. Transferable skills from:
       - Previous roles even if in different industries
       - Academic background
       - Certification programs
       - Project management experience
    
    4. Years of Experience if there is big cap it should take this in consideration

    ${scoringGuidelines}
    ${responseValidation}
    ${emailGuidelines}
    `
  ],
  [
    "human",
    `Analyze this Resume and job description thoroughly:
    Resume: {cv}
    Job Description: {jobDescription}

    Return a JSON response with:
    1. technicalSkills: Array of ALL relevant skills including:
       - Explicitly stated skills
       - Skills from certificates/training
       - Skills demonstrated in job experiences
       - Tools/technologies used in projects
       - Related or transferable technical skills
    
    2. softSkills: Array of ALL soft skills evidenced by:
       - Achievement descriptions
       - Leadership roles
       - Project collaboration
       - Client interactions
       - Problem-solving examples
    
    3. matchScore: Integer 0-100
    4. missingSkills: Array of missing requirements
    5. improvements: Array of specific improvements also include improvements about the users resume highlighting what is currently missing and what is currently present
    6. generatedEmail: Gnerate an email to send to the recuiter. Return an Object with subject and body the body should be formatted with spaces like professional emails.
    7. status: "complete"

    Ensure NO relevant skills are missed from any section of the CV.`
  ],
  [
    "assistant",
    "I will conduct an exhaustive analysis, carefully extracting ALL skills from every section of the CV."
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