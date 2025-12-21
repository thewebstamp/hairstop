//app/api/chat/free/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Your Hair Stop business knowledge
const HAIR_STOP_SYSTEM_PROMPT = `You are the official AI assistant for "Hair Stop," a luxury hair boutique in Nigeria. You speak in a warm, feminine, and professional tone. Use this knowledge to answer questions:

**BUSINESS DETAILS:**
- **Name:** Hair Stop
- **Tagline:** "Your first stop for quality and luxury hair"
- **Products:** Closures, Frontals, Wigs (ready-made), Hair Bundles
- **Location:** Nigeria

**SHIPPING POLICY (CRITICAL - BE CLEAR):**
1. Hair price does NOT include shipping cost.
2. Orders over ₦1,000,000 within Lagos: FREE shipping.
3. Other locations: Subsidized shipping with 10% discount on shipping cost.
4. Shipping cost is communicated AFTER order review based on location.
5. Customer pays for delivery WHEN hair arrives at their gate/door-step.
6. Delivery time: 7-21 days maximum.

**SERVICES:**
1. Hair Revamping
2. Wig Making (custom)
3. Hair Maintenance & Massage
4. Periodic automated hair maintenance (discounted prices)

**PAYMENT:**
- Bank: UBA
- Account: 1028154357
- Name: HAIR STOP

**PHILOSOPHY:**
"We are not just sellers but the keepers and cleaners of your hair trophies. Our foreign-weaved strands offer luxury and premium feel worth the wait."

**GUIDELINES:**
- Be helpful, friendly, and concise.
- Use occasional tasteful emojis (💁🏾‍♀️✨🚚).
- If unsure about pricing, suggest contacting support.
- Never invent prices or guarantee delivery dates outside 7-21 days.
- Always mention shipping is separate from hair price.
- For urgent matters, suggest calling directly.

Example good response: "For orders over ₦1 million in Lagos, shipping is free! For other locations, we offer subsidized shipping with a 10% discount. The exact cost is calculated after we review your order based on your location. Delivery takes 7-21 days. 💁🏾‍♀️"`;

export async function POST(request: NextRequest) {
  let userMessage: string = '';
  
  try {
    const { message, conversation = [] } = await request.json();
    userMessage = message;

    if (!userMessage || typeof userMessage !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Prepare messages for Ollama
    const messages = [
      { role: 'system', content: HAIR_STOP_SYSTEM_PROMPT },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...conversation.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Call Ollama API
    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500 // Max tokens in response
        }
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API error:', ollamaResponse.status, errorText);
      throw new Error(`Ollama API error: ${ollamaResponse.status}`);
    }

    const data = await ollamaResponse.json();
    
    return NextResponse.json({ 
      response: data.message.content,
      source: 'ollama',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Free chat API error:', error);
    
    // Fallback responses based on common questions
    const fallbackResponse = getFallbackResponse(userMessage);
    
    return NextResponse.json({
      response: fallbackResponse,
      source: 'fallback',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}

// GET endpoint (unchanged - keep as is)
export async function GET() {
  const isLocalAIRunning = await checkLocalAI();
  
  return NextResponse.json({
    status: isLocalAIRunning ? 'connected' : 'disconnected',
    model: 'llama3.2',
    free: true,
    message: isLocalAIRunning 
      ? 'Hair Stop Local AI Assistant is ready!' 
      : 'Run Ollama locally for AI features, or using fallback mode'
  });
}

async function checkLocalAI(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Fallback response generator
function getFallbackResponse(userMessage?: string): string {
  if (!userMessage) {
    return "Hello! I'm the Hair Stop Chat Assistant. 💁🏾‍♀️ I can help with product info, shipping (7-21 days delivery), our services, or anything else about our luxury hair collection. What would you like to know?";
  }
  
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('ship') || lowerMessage.includes('deliver')) {
    return "Shipping takes 7-21 days. 🚚 For orders over ₦1 million in Lagos, shipping is free! For other locations, we offer subsidized shipping with 10% discount. The exact cost is calculated after we review your order based on your location.";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
    return "For specific pricing on our luxury hair bundles, closures, frontals, or wigs, please contact our support team. They can provide current prices and help you choose the perfect hair for your needs! 💁🏾‍♀️";
  }
  
  if (lowerMessage.includes('product') || lowerMessage.includes('hair') || lowerMessage.includes('bundle') || lowerMessage.includes('wig') || lowerMessage.includes('frontal') || lowerMessage.includes('closure')) {
    return "We offer premium: 1️⃣ Closures, 2️⃣ Frontals, 3️⃣ Ready-made Wigs, and 4️⃣ Hair Bundles. All are foreign-weaved for that luxury feel! Which category interests you most? ✨";
  }
  
  if (lowerMessage.includes('service') || lowerMessage.includes('maintenance') || lowerMessage.includes('revamp') || lowerMessage.includes('install')) {
    return "Beyond selling hair, we offer: ✂️ Hair Revamping, 👑 Custom Wig Making, 💆🏾‍♀️ Hair Maintenance & Massage, and 🔄 Periodic maintenance at discounted prices. We're keepers of your hair trophies!";
  }
  
  if (lowerMessage.includes('payment') || lowerMessage.includes('bank') || lowerMessage.includes('transfer') || lowerMessage.includes('pay')) {
    return "You can pay via bank transfer to: 🏦 UBA Bank, Account: 1028154357, Name: HAIR STOP. Please include your order number as reference! 💳";
  }
  
  if (lowerMessage.includes('return') || lowerMessage.includes('refund') || lowerMessage.includes('exchange')) {
    return "We accept returns on unused bundles within 3 days. Custom wigs and installed hair cannot be returned due to hygiene reasons. For details, contact our support team! 📦";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Hair Stop assistant! 💁🏾‍♀️ I can help with product info, shipping (7-21 days delivery), our services, or anything else about our luxury hair collection. What would you like to know?";
  }
  
  // Default friendly response
  return "Hello! I'm the Hair Stop Chat Assistant. 💁🏾‍♀️ I can help with:\n• Product information (closures, frontals, wigs, bundles)\n• Shipping & delivery (7-21 days)\n• Our special services\n• Payment methods\n\nWhat would you like to know about our luxury hair collection?";
}