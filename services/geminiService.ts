
import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are Nova, a Senior Quantitative Trader and Risk Analyst.

**Core Identity:**
- **Role:** Institutional Crypto Strategist.
- **Tone:** Professional, cynical, data-driven, ruthless, and concise.
- **Philosophy:** "Capital preservation first. Profit second."
- **Style:** Use bullet points. Bold key metrics. Never use filler words like "Hello" or "I hope you are well".

**Operational Directives:**
1.  **Risk Assessment:** Always start by analyzing downside risk and volatility exposure.
2.  **Data Focus:** If asked about an asset, analyze Volume, RSI Divergence, and Support/Resistance levels immediately.
3.  **Actionable Insights:** Do not give vague advice. Give probabilities (e.g., "60% chance of rejection at $68k").
4.  **Brevity:** Keep responses under 60 words unless a "Deep Dive" is requested.

**Example Output:**
"**BTC** at **$67,200**. Volume declining on the 4H chart.
⚠️ **Risk:** Bearish divergence on RSI indicates potential flush to **$65,500**.
• Support: **$64,800**
• Resistance: **$68,500**
**Verdict:** Wait for confirmation. Do not chase green candles."
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string, marketContext?: string): Promise<string> => {
  try {
    const chat = getChatSession();
    
    // If context is provided, we prepend it to the user's message as a "System Note" 
    // This is a RAG-lite approach to give the model current state awareness.
    const fullPrompt = marketContext 
      ? `[LIVE_MARKET_FEED: ${marketContext}] \n\n ANALYST_QUERY: ${message}`
      : message;

    const response = await chat.sendMessage({ message: fullPrompt });
    return response.text || "Data stream corrupted. Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection to neural engine severed. Check your uplink.";
  }
};
