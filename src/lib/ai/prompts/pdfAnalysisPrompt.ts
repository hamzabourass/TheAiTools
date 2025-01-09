import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";

export const analysisPrompts = {
  summary: `Analyze the conversation comprehensively and provide a detailed, structured summary. The length and depth of analysis should be proportional to the conversation's size and complexity. Include all code examples and technical discussions in their entirety. For longer conversations (10+ messages), provide extensive analysis with multiple examples and detailed breakdowns. Use the following format:

    **EXECUTIVE SUMMARY**
    Provide a comprehensive overview that:
    - Summarizes the main discussion points, themes, and outcomes
    - Outlines the context and background of the conversation
    - Highlights critical decisions or conclusions reached
    - Identifies key stakeholders and their perspectives
    - Notes any technical specifications or requirements discussed
    - Includes overview of any code or technical implementations discussed

    **DETAILED ANALYSIS**
    Break down the conversation into major themes or topics. For each theme:
    - Provide in-depth analysis with specific examples from the conversation
    - Include complete code snippets and technical discussions
    - Document the evolution of ideas or solutions
    - Include all implementation details and code examples
    - Explain the purpose and functionality of each code segment
    - Document any modifications or improvements discussed
    - Note any assumptions or constraints discussed

    **CODE IMPLEMENTATION** (When code is present)
    Document all code-related discussions:
    - Include complete code snippets with proper formatting
    - Explain the purpose and functionality of each code block
    - Note any dependencies or prerequisites
    - Document setup and configuration requirements
    - Include any debugging or optimization discussions
    - Highlight best practices and potential pitfalls
    - Include any alternative implementations discussed

    **KEY FINDINGS**
    Extract and analyze 5-10 significant findings (more for longer conversations). For each finding:
    - Provide detailed explanation with direct references to the conversation
    - Include supporting evidence and context
    - Include relevant code examples and technical details
    - Explain the implications and impact
    - Connect it to broader objectives or challenges

    **TECHNICAL CONSIDERATIONS**
    Document technical aspects discussed:
    - System requirements or specifications
    - Complete code implementations with explanations
    - Architecture decisions and their rationale
    - Implementation details with code examples
    - Performance considerations with code optimizations
    - Security implications and code safeguards
    - Integration requirements and code interfaces

    **CHALLENGES AND SOLUTIONS**
    Identify 4-8 major challenges discussed and their proposed solutions:
    - Describe each challenge in detail
    - Include code examples of problems and solutions
    - Document proposed solutions with implementation details
    - Include complete code fixes or workarounds
    - Analyze the pros and cons of each approach
    - Note any implementation considerations
    - Include testing and validation approaches

    **ACTIONABLE RECOMMENDATIONS**
    Provide 6-10 specific, detailed recommendations. For each:
    - Outline concrete steps for implementation
    - Include code examples where relevant
    - Explain the reasoning and expected benefits
    - Provide complete code solutions when applicable
    - Include resource requirements or prerequisites
    - Define success criteria or metrics

    **IMPLEMENTATION ROADMAP**
    Create a structured plan for executing recommendations:
    - Break down into immediate, short-term, and long-term actions
    - Include specific code implementations for each phase
    - Define dependencies and prerequisites
    - Provide complete technical specifications
    - Include code migration or update plans
    - Suggest resource allocation and technical requirements

    **CONCLUSIONS**
    Provide comprehensive closing thoughts:
    - Summarize major themes and technical decisions
    - Include final code recommendations
    - Highlight critical next steps in implementation
    - Note areas requiring further technical discussion
    - Include risk mitigation strategies with code considerations
    - Suggest technical follow-up actions`,

  qa: `Generate a comprehensive Q&A document based on the conversation. For longer conversations, create extensive question sets with detailed answers covering all major topics and subtopics, including all code examples and technical implementations. Use the following format:

    **CONTEXT OVERVIEW**
    Provide detailed background:
    - Main topics and themes covered
    - Technical context and code overview
    - Discussion context and objectives
    - Key stakeholders and their concerns
    - Technical or domain-specific context
    - Overview of code implementations discussed

    **FUNDAMENTAL Q&A**
    Create 8-12 basic Q&A pairs covering core concepts. Each answer should:
    - Provide comprehensive explanation
    - Include relevant code examples
    - Explain technical concepts clearly
    - Include practical implementations
    - Address common issues
    - Provide working solutions

    **TECHNICAL Q&A** (When code is present)
    Develop 10-15 technical Q&A pairs. Each answer should:
    - Include complete code implementations
    - Provide step-by-step explanations
    - Explain code functionality in detail
    - Include setup and configuration steps
    - Address common errors and solutions
    - Provide optimization tips
    - Include testing approaches

    **PROBLEM-SOLVING Q&A**
    Present 6-10 real-world scenarios with detailed solutions:
    Q: [Specific problem scenario]
    A: 
    - Detailed problem analysis
    - Complete code solution
    - Step-by-step implementation guide
    - Alternative approaches
    - Testing and validation steps
    - Common pitfalls and solutions
    - Performance considerations

    **ADVANCED Q&A**
    Include 8-12 advanced Q&A pairs. Each answer should:
    - Provide in-depth technical explanation
    - Include complete code implementations
    - Cover edge cases and special situations
    - Include optimization techniques
    - Provide performance tips
    - Address scaling considerations
    - Include best practices

    **IMPLEMENTATION Q&A**
    Provide 6-8 implementation-focused Q&A pairs. Each answer should:
    - Include complete code solutions
    - Provide step-by-step implementation guides
    - Include configuration details
    - Address common implementation challenges
    - Provide testing strategies
    - Include deployment considerations
    - Cover maintenance aspects

    **BEST PRACTICES Q&A**
    Include 5-8 Q&A pairs covering best practices. Each answer should:
    - Provide detailed explanations
    - Include code examples
    - Cover optimization strategies
    - Include maintenance tips
    - Address scalability
    - Provide performance guidelines
    - Include security considerations`,

  keyPoints: `Extract and analyze key points from the conversation, scaling the depth and detail based on conversation length. Include all code examples and technical implementations. For longer conversations, provide extensive analysis of each point. Use the following format:

    **STRATEGIC OVERVIEW**
    Provide comprehensive context:
    - Main objectives and goals
    - Technical scope and requirements
    - Code implementation overview
    - Key stakeholders and their interests
    - Critical success factors
    - Technical or business context

    **CORE THEMES**
    Identify and analyze 5-8 major themes. For each:
    - Detailed theme description and context
    - Complete code implementations
    - Technical specifications and requirements
    - Supporting evidence from conversation
    - Impact and implications
    - Implementation considerations

    **TECHNICAL INSIGHTS**
    Document 6-10 technical insights:
    - Complete code examples and implementations
    - Architectural decisions with code samples
    - Implementation details with examples
    - Performance considerations and optimizations
    - Security implications and safeguards
    - Integration requirements and interfaces
    - Scaling factors and solutions

    **CRITICAL DECISIONS**
    Analyze 5-8 key decisions. For each:
    - Decision context and rationale
    - Complete code implementations
    - Technical specifications
    - Alternatives considered with code examples
    - Impact analysis and considerations
    - Implementation implications
    - Risk considerations

    **IMPLEMENTATION CONSIDERATIONS**
    Document 6-10 implementation factors:
    - Complete technical requirements
    - Code examples and solutions
    - Resource needs and specifications
    - Timeline considerations
    - Dependencies and prerequisites
    - Risk factors and mitigations
    - Success criteria and metrics`,

  studyNotes: `Create comprehensive study notes that thoroughly cover all aspects of the conversation, including all code examples and technical implementations. For longer conversations, provide in-depth analysis and examples for each topic. Use the following format:

    **COMPREHENSIVE OVERVIEW**
    Provide detailed context:
    - Subject matter introduction
    - Technical overview and requirements
    - Code implementation summary
    - Learning objectives and goals
    - Prerequisites and dependencies
    - Technical requirements
    - Practical applications

    **CORE CONCEPTS**
    Analyze 8-12 fundamental concepts. For each:
    - Detailed concept explanation
    - Complete code examples
    - Implementation details
    - Common misconceptions and solutions
    - Technical considerations
    - Best practices and optimizations

    **TECHNICAL DEEP DIVE**
    Cover 6-10 technical aspects:
    - Complete code implementations
    - Architectural patterns with examples
    - Implementation details and samples
    - Code examples and use cases
    - Performance optimizations
    - Security considerations
    - Integration patterns and examples

    **PRACTICAL APPLICATIONS**
    Provide 8-12 real-world applications:
    - Complete implementation examples
    - Working code solutions
    - Use case scenarios with code
    - Problem-solving approaches
    - Best practices and patterns
    - Common pitfalls and fixes
    - Testing and validation

    **ADVANCED TOPICS**
    Explore 6-8 advanced concepts:
    - Complex scenarios with solutions
    - Complete code implementations
    - Edge cases and handling
    - Optimization strategies
    - Scaling considerations
    - Advanced patterns
    - Performance tuning

    **LEARNING EXERCISES**
    Include 8-12 practice exercises:
    - Complete code challenges
    - Implementation assignments
    - Design problems with solutions
    - Integration exercises
    - Debugging scenarios
    - Optimization tasks
    - Testing exercises`
};

export const titlePrompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(
    "Generate a clear, descriptive, and professional title (4-6 words) that accurately represents the depth and complexity of the content. If the content is technical, include relevant technical terms."
  ),
  HumanMessagePromptTemplate.fromTemplate("{input}")
]);