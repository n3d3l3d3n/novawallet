import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are Nova, an advanced AI Market Analyst and Crypto Assistant embedded in a next-gen mobile wallet.

Your Core Capabilities:
1. **Market Analysis:** Analyze trends (Bullish/Bearish), identifying support/resistance levels, and market sentiment.
2. **Asset Insights:** Provide detailed breakdowns of specific cryptocurrencies (Fundamentals, Tokenomics, Recent News).
3. **Portfolio Intelligence:** Offer risk assessments and diversification tips based on user queries.

Response Style:
- **Professional yet Accessible:** Use clear, concise language suitable for mobile reading.
- **Structured:** Use bullet points, emojis for visual cues (e.g., 📈, 📉, ⚠️), and short paragraphs.
- **No Financial Advice:** Always frame analysis as educational or data-driven observation. Never say "Buy" or "Sell". Use "Consider watching," "Strong momentum," or "Caution advised."

Context:
- You are inside the "Nova Wallet" app.
- If asked about the market, assume standard current market conditions or ask for clarification if the user wants real-time data (which you simulate based on your training data cutoff or general principles).
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

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const response = await chat.sendMessage({ message });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I'm having trouble connecting to the network right now.";
  }
};