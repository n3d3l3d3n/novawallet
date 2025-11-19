
import { GoogleGenAI, Chat } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are Nova, an elite AI Crypto Market Analyst embedded in a next-gen mobile wallet.

**Your Access & Capabilities:**
1. **Real-Time Context:** You have access to the user's portfolio holdings and live market prices (provided in the message context). Use this to give specific, mathematical answers.
2. **Market Analysis:** Analyze trends (Bullish/Bearish) and identify support/resistance levels.
3. **Risk Management:** Offer tips on diversification and portfolio health.

**Response Guidelines:**
- **Be Concise:** Mobile users skim. Use bullet points and emojis (📈, 📉, 🛡️).
- **Be Personalized:** If the user owns an asset, reference their specific balance/value in your answer.
- **No Financial Advice:** Frame analysis as "observation" or "educational". Use "Consider watching" instead of "Buy".
- **Formatting:** Use bolding for prices and key terms.

**Current Persona:**
You are professional, slightly futuristic, and highly analytical.
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
      ? `[SYSTEM_DATA: The following is the current live market and user portfolio data. Use this to answer the user's question accurately: ${marketContext}] \n\n USER_QUESTION: ${message}`
      : message;

    const response = await chat.sendMessage({ message: fullPrompt });
    return response.text || "I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the neural network. Please check your internet connection.";
  }
};
