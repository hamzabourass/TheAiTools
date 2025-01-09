import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from "@langchain/core/prompts";

export const analysisPrompts = {
  summary: `Analyze the conversation and provide a detailed, structured summary with actionable insights. Focus on extracting key themes, outcomes, and practical recommendations. Ensure the output is clear, concise, and easy to follow. Use the following format:

    **SUMMARY**
    Write a concise yet comprehensive overview of the conversation. Highlight the main purpose, key themes, and any significant outcomes or conclusions. Include context to help the reader understand the conversation's relevance.

    **KEY POINTS**
    Identify and explain at least 3-5 key takeaways from the conversation. For each point:
    - Provide a detailed explanation with supporting examples or context.
    - Explain why the point matters and how it connects to the broader discussion.
    - Highlight its significance and practical implications.

    **ACTIONABLE INSIGHTS**
    Provide at least 3-5 specific recommendations or actions the user should take. For each insight:
    - Clearly explain the steps, reasoning, and expected outcomes.
    - Ensure the recommendations are practical, actionable, and easy to implement.
    - Align the insights with the conversation's key themes.

    **CONCLUSIONS**
    Summarize the conversation with 2-3 high-level takeaways or lessons. For each conclusion:
    - Explain its importance and how it can be applied in real-world scenarios.
    - Provide a closing remark that ties everything together and leaves a lasting impression.`,

  qa: `Based on the conversation, generate a set of hypothetical questions and answers that would be useful for preparation, study, or reference. Ensure the Q&A pairs are detailed, actionable, and cover the main topics discussed. Use the following format:

    **Q&A SUMMARY**
    Write a brief overview of the conversation's main topics and context. Explain why these Q&A pairs are relevant and how they can be used for learning or problem-solving.

    **QUESTIONS & ANSWERS**
    Generate at least 5-10 hypothetical Q&A pairs. For each pair:
    - Create a specific and relevant question someone might ask about the topic.
    - Provide a detailed answer that includes examples, steps, or practical advice.
    - Ensure the answer is thorough, actionable, and easy to understand.

    **KEY TAKEAWAYS**
    Summarize the Q&A with 3-5 key lessons or insights. For each takeaway:
    - Explain how it can be applied in practice.
    - Highlight its relevance and potential impact.
    - Provide actionable advice or a call to action.`,

  keyPoints: `Extract and organize the main points and insights from the conversation. Focus on providing detailed explanations, actionable insights, and clear connections to the broader topic. Use the following format:

    **OVERVIEW**
    Write a brief context and purpose of the conversation. Explain why these key points are important and how they relate to the main topic or goals.

    **KEY POINTS**
    Identify and explain at least 3-5 key insights or ideas from the conversation. For each point:
    - Provide a detailed explanation with examples or context.
    - Highlight its significance and practical implications.
    - Explain how it can be applied or why it matters.

    **IMPORTANT CONCEPTS**
    Define and explain 2-3 key concepts from the conversation. For each concept:
    - Provide a clear definition and explanation.
    - Include examples or analogies to enhance understanding.
    - Highlight its relevance and practical applications.`,

  codeSnippets: `Extract and organize code examples and technical explanations from the conversation. Focus on providing clear, detailed explanations, practical advice, and actionable insights. Use the following format:

    **TECHNICAL SUMMARY**
    Write a brief overview of the technical content discussed in the conversation. Explain the context, purpose, and relevance of the code examples.

    **CODE EXAMPLES**
    Extract and explain at least 2-3 code examples. For each example:
    - Describe what the code does and its purpose in detail.
    - Include any prerequisites or dependencies.
    - Provide the code in a clear, formatted block.

    **TECHNICAL NOTES**
    Provide 3-5 key technical details or insights from the conversation. For each note:
    - Explain the detail with practical advice or examples.
    - Highlight best practices, potential pitfalls, or actionable recommendations.`,

  studyNotes: `Create organized, detailed study notes from the conversation. Focus on providing clear explanations, actionable insights, and practical applications. Use the following format:

    **TOPIC OVERVIEW**
    Write a brief introduction to the topic. Explain the main purpose, context, and relevance of the conversation.

    **MAIN CONCEPTS**
    Identify and explain at least 3-5 main concepts from the conversation. For each concept:
    - Provide a detailed explanation with examples or context.
    - Explain how the concept can be applied in practice.
    - Include actionable advice or step-by-step guidance.

    **IMPORTANT DEFINITIONS**
    Define and explain 2-3 key terms from the conversation. For each term:
    - Provide a clear definition and explanation.
    - Include examples or analogies to enhance understanding.
    - Highlight its relevance and practical applications.

    **STUDY TIPS**
    Provide 3-5 practical tips for studying or applying the topic. For each tip:
    - Make it specific, actionable, and easy to follow.
    - Focus on efficiency, retention, or real-world application.`,
};


export const titlePrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(
        "Generate a clear, concise, and professional title (3-5 words) that captures the main topic of this content."
      ),
      HumanMessagePromptTemplate.fromTemplate("{input}")
    ]);