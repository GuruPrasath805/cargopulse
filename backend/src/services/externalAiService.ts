/**
 * Optional cloud-LLM enhancement layer for the AI Copilot.
 *
 * CargoPulse's chat assistant (`AiChatService`) answers most questions
 * instantly from local rule-based logic and live in-memory/Postgres data —
 * no network round-trip, no API cost, no key required. That local engine
 * stays the FIRST line of response for known intents (fast + free + always
 * available in demos).
 *
 * This service is only consulted as a fallback, for questions the local
 * engine doesn't recognize, and only when the operator has supplied
 * OPENAI_API_KEY or GEMINI_API_KEY in the environment. If neither key is
 * set, or the call fails/times out, callers get `null` back and should fall
 * back to the local generic answer — the assistant should never crash or
 * go silent because of a missing/invalid key or a flaky network call.
 */

const SYSTEM_PROMPT = [
  'You are the CargoPulse AI Copilot, embedded in a supply chain and logistics',
  'management platform covering inventory, shipments, warehouses, suppliers,',
  'purchase orders, returns, and fleet telematics.',
  'Answer the user question helpfully and concisely (under ~180 words).',
  'Prefer plain sentences; use light markdown (bold, short bullet lists) only',
  'where it aids clarity. If the question is unrelated to logistics, still',
  'answer it normally and helpfully.',
].join(' ');

const REQUEST_TIMEOUT_MS = 12_000;

async function withTimeout<T>(fn: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fn(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

async function callOpenAi(question: string, apiKey: string): Promise<string> {
  return withTimeout(async (signal) => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: question },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`OpenAI API responded with ${res.status}`);
    }

    const data: any = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error('OpenAI returned an empty response');
    return text;
  });
}

async function callGemini(question: string, apiKey: string): Promise<string> {
  return withTimeout(async (signal) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nUser question: ${question}` }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.4 },
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Gemini API responded with ${res.status}`);
    }

    const data: any = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Gemini returned an empty response');
    return text;
  });
}

export class ExternalAiService {
  /** True when at least one cloud LLM key is present in the environment. */
  static isConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY);
  }

  /**
   * Tries OpenAI first (if configured), then Gemini, then gives up.
   * Never throws — returns null on any failure so the caller can fall back
   * to the local knowledgebase answer.
   */
  static async generateAnswer(question: string): Promise<string | null> {
    const openAiKey = process.env.OPENAI_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (openAiKey) {
      try {
        return await callOpenAi(question, openAiKey);
      } catch (err) {
        console.warn('[CargoPulse] OpenAI enhancement failed, trying next provider:', (err as Error).message);
      }
    }

    if (geminiKey) {
      try {
        return await callGemini(question, geminiKey);
      } catch (err) {
        console.warn('[CargoPulse] Gemini enhancement failed:', (err as Error).message);
      }
    }

    return null;
  }
}
