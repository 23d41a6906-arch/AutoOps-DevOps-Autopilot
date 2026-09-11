// Groq API integration for optional live LLM reasoning
// Seamlessly falls back to Demo Mode when no key is set or if network fails

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;

export const isLiveAiAvailable = Boolean(GROQ_API_KEY && GROQ_API_KEY.trim().length > 5);

export interface AgentReasoningContext {
  agentName: string;
  incidentTitle: string;
  service: string;
  evidence: string;
  stage: string;
}

export async function generateAgentReasoning(
  context: AgentReasoningContext,
  fallbackText: string
): Promise<{ text: string; isLive: boolean }> {
  if (!isLiveAiAvailable || !GROQ_API_KEY) {
    return { text: fallbackText, isLive: false };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // Fast 2.5s timeout so workflow is never delayed

    const prompt = `You are ${context.agentName}, an autonomous AI DevOps agent responding to an incident in an enterprise e-commerce system.
Incident: ${context.incidentTitle}
Affected Service: ${context.service}
Current Stage: ${context.stage}
Evidence: ${context.evidence}

Provide 1-2 sentences of crisp, highly technical, professional reasoning for your current action. No fluff, no Markdown headings, no introductory filler. Output only your technical thought:`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY.trim()}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 80,
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { text: fallbackText, isLive: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (content && content.length > 5) {
      return { text: content, isLive: true };
    }
  } catch {
    // Silent fallback to demo mode as required
  }

  return { text: fallbackText, isLive: false };
}
