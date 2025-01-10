import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";

export const analysisPrompts = {
  summary: `Analyze the conversation and provide a concise, structured summary. Include all code examples and technical discussions. Use this format:

    **EXECUTIVE SUMMARY**
    - Main points, context, and outcomes
    - Key stakeholders and perspectives
    - Technical details and code overview

    **DETAILED ANALYSIS**
    - Break into themes with code snippets and explanations
    - Document solutions and modifications

    **CODE IMPLEMENTATION** (if code exists)
    - Include complete code snippets with explanations
    - Highlight best practices and dependencies

    **KEY FINDINGS**
    - Extract 5-10 significant findings with code examples

    **TECHNICAL CONSIDERATIONS**
    - System requirements, architecture, and optimizations

    **CHALLENGES AND SOLUTIONS**
    - Describe challenges and solutions with code fixes

    **ACTIONABLE RECOMMENDATIONS**
    - Provide 6-10 specific recommendations with code solutions

    **CONCLUSIONS**
    - Summarize themes, decisions, and next steps`,

  qa: `Generate a concise Q&A document based on the conversation. Include all code examples and technical discussions. Use this format:

    **CONTEXT OVERVIEW**
    - Main topics, technical context, and code overview

    **FUNDAMENTAL Q&A**
    - 8-12 basic Q&A pairs with code examples

    **TECHNICAL Q&A** (if code exists)
    - 10-15 technical Q&A pairs with complete code implementations

    **PROBLEM-SOLVING Q&A**
    - 6-10 real-world scenarios with detailed code solutions

    **ADVANCED Q&A**
    - 8-12 advanced Q&A pairs with edge cases and optimizations

    **IMPLEMENTATION Q&A**
    - 6-8 implementation-focused Q&A pairs with code solutions

    **BEST PRACTICES Q&A**
    - 5-8 Q&A pairs covering best practices with code examples`,

  keyPoints: `Extract and analyze key points from the conversation. Include all code examples and technical discussions. Use this format:

    **STRATEGIC OVERVIEW**
    - Main objectives, technical scope, and code overview

    **CORE THEMES**
    - 5-8 major themes with code implementations

    **TECHNICAL INSIGHTS**
    - 6-10 technical insights with code examples

    **CRITICAL DECISIONS**
    - 5-8 key decisions with code alternatives

    **IMPLEMENTATION CONSIDERATIONS**
    - 6-10 implementation factors with code solutions`,

  studyNotes: `Create concise study notes covering all aspects of the conversation. Include all code examples and technical discussions. Use this format:

    **COMPREHENSIVE OVERVIEW**
    - Subject matter, technical requirements, and code overview

    **CORE CONCEPTS**
    - 8-12 fundamental concepts with code examples

    **TECHNICAL DEEP DIVE**
    - 6-10 technical aspects with complete code implementations

    **PRACTICAL APPLICATIONS**
    - 8-12 real-world applications with working code solutions

    **ADVANCED TOPICS**
    - 6-8 advanced concepts with edge cases and optimizations

    **LEARNING EXERCISES**
    - 8-12 practice exercises with code challenges`
};

export const titlePrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "Generate a clear, descriptive, and professional title (4-6 words) that accurately represents the depth and complexity of the content. If the content is technical, include relevant technical terms."
  ),
  HumanMessagePromptTemplate.fromTemplate("{input}")
]);