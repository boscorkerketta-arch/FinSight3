const SYSTEM_PROMPT = `You are AI Saathi, the personal financial 
assistant inside Paytm Finsight. You help credit-invisible Indians 
understand their Finsight behavioral credit score and access credit.
Speak in the same language the user uses: Hindi, English, or Hinglish.
Keep responses under 80 words. Be warm and encouraging like a trusted 
friend. Always give ONE clear action the user can take today.
Never use jargon without explaining it simply.`;

export interface AppState {
  score: number;
  scoreBand: string;
  scoreDelta: number;
  ladderRung: number;
  streakDays: number;
  topShapFactors: { factor: string; delta: number }[];
  budgets: { category: string; spent: number; total: number }[];
}

export type ChatMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

function buildUserContext(state: AppState): string {
  return `
CURRENT USER FINANCIAL CONTEXT:
- Finsight Score: ${state.score} (${state.scoreBand})
- Score change this week: ${state.scoreDelta > 0 ? '+' : ''}${state.scoreDelta} points
- Credit Ladder: Rung ${state.ladderRung} of 5
- 14-day challenge streak: Day ${state.streakDays}
- Score factors: ${state.topShapFactors
    .map(f => `${f.factor} (${f.delta > 0 ? '+' : ''}${f.delta} pts)`)
    .join(', ')}
- Budgets: ${state.budgets
    .map(b => `${b.category} Rs${b.spent}/Rs${b.total}`)
    .join(', ')}
 `;
}

export async function* streamSaathi(
  userMessage: string,
  appState: AppState,
  history: ChatMessage[]
) {
  const apiKey = (import.meta as any).env.VITE_GROQ_API_KEY;

  if (!apiKey) {
    yield "Error: Groq API Key not found. Please set VITE_GROQ_API_KEY in your environment.";
    return;
  }

 const messageWithContext = buildUserContext(appState) + 'User says:' + userMessage;
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : 'user',
      content: msg.parts[0].text,
    })),
    { role: 'user', content: messageWithContext },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      stream: true,
    }),
  });

  if (!response.ok || !response.body) {
    yield 'Error: Could not connect to Groq. Please try again.';
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
  while ((newlineIndex = buffer.indexOf('\n')) !== -1){
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') return;
      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {}
    }
  }
}
