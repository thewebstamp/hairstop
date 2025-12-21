/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';

// Hair Stop Business Knowledge Base
const HAIR_STOP_KNOWLEDGE = `
BUSINESS NAME: Hair Stop
TAGLINE: Your first stop for quality and luxury hair
LOCATION: Nigeria

PRODUCT CATEGORIES:
1. Closures
2. Frontals  
3. Wigs (ready-made wigs)
4. Hair Bundles

PRICING & SHIPPING POLICY:
- Hair price does NOT include shipping
- Orders over ₦1,000,000 in Nigeria: FREE shipping
- Other locations: Subsidized shipping (10% discount on shipping cost)
- Shipping cost communicated AFTER order review based on location
- Customer pays for delivery WHEN hair arrives at their gate/door-step
- Delivery time: 7-21 days maximum

BANK DETAILS:
- Account: 1028154357
- Bank: UBA
- Name: HAIR STOP

SPECIAL SERVICES:
1. Hair Revamping
2. Wig Making (custom)
3. Hair Maintenance & Massage
4. Periodic automated hair maintenance (discounted prices)

BUSINESS PHILOSOPHY:
We are not just sellers but keepers and cleaners of hair trophies. Our foreign-weaved strands offer luxury and premium feel worth the wait.

RETURN POLICY:
Currently no returns on custom wigs and installed hair. Unused bundles may be returned within 3 days.

CONTACT:
- Email: support@hairstop.ng
- Phone: +2349036981564

FREQUENTLY ASKED QUESTIONS:
Q: How long does shipping take?
A: 7-21 days maximum.

Q: Is shipping free?
A: Free only for orders above ₦1 million within Nigeria. Others pay subsidized shipping.

Q: Do you install wigs?
A: Yes, we offer wig making and installation services.

Q: What payment methods?
A: Bank transfer to UBA 1028154357 (HAIR STOP).

Q: Do you deliver outside Lagos?
A: Yes, nationwide delivery with location-based shipping fees.

IMPORTANT: Always be helpful, feminine in tone, and refer customers to contact support for specific pricing inquiries.
`;

export class LocalAIAssistant {
  private ollamaUrl: string;

  constructor() {
    // Default to localhost - you can change this if hosting elsewhere
    this.ollamaUrl = 'http://localhost:11434';
  }

  async queryLocalAI(userMessage: string, conversationHistory: any[] = []) {
    try {
      // Format conversation with system prompt
      const messages = [
        {
          role: 'system',
          content: `You are the Hair Stop Chat Assistant, a helpful AI for a luxury hair store in Nigeria. Use this knowledge base to answer questions: ${HAIR_STOP_KNOWLEDGE}\n\nGuidelines:\n1. Be warm, feminine, and professional\n2. Use emojis tastefully 💁🏾‍♀️✨\n3. If unsure, ask for clarification\n4. Never invent prices or policies\n5. For specific pricing, suggest contacting support\n6. Always mention shipping takes 7-21 days\n7. Emphasize our "keeper of hair trophies" philosophy`
        },
        ...conversationHistory.slice(-4), // Keep last 4 messages for context
        { role: 'user', content: userMessage }
      ];

      // Try to use local Ollama first
      const response = await axios.post(`${this.ollamaUrl}/api/chat`, {
        model: 'llama3.2', // or 'mistral' or 'llama2'
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 500
        }
      }, {
        timeout: 30000 // 30 second timeout
      });

      return response.data.message.content;
      
    } catch (error: any) {
      console.error('Local AI error:', error.message);
      
      // Fallback: Simple rule-based responses
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Rule-based fallback responses
    if (lowerMessage.includes('ship') || lowerMessage.includes('deliver')) {
      return "Shipping takes 7-21 days. For orders over ₦1 million in Nigeria, shipping is free! 🚚 For other locations, we offer subsidized shipping. The exact cost is calculated after we review your order based on your location.";
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "For specific pricing on our luxury hair bundles, closures, frontals, or wigs, please contact our support team. They can provide current prices and help you choose the perfect hair for your needs! 💁🏾‍♀️";
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('hair')) {
      return "We offer premium: 1) Closures, 2) Frontals, 3) Ready-made Wigs, and 4) Hair Bundles. All are foreign-weaved for that luxury feel! Which category interests you? ✨";
    }
    
    if (lowerMessage.includes('service')) {
      return "Beyond selling hair, we offer: Hair Revamping, Custom Wig Making, Hair Maintenance & Massage, and Periodic maintenance at discounted prices. We're keepers of your hair trophies! 💇🏾‍♀️";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('bank')) {
      return "You can pay via bank transfer to: UBA Bank, Account: 1028154357, Name: HAIR STOP. you can include your order number as reference! 💳";
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "We accept returns on unused bundles within 3 days. Custom wigs and installed hair cannot be returned due to hygiene reasons. For details, contact support! 📦";
    }
    
    // Default friendly response
    return "Hello! I'm the Hair Stop Chat Assistant. I can help with:\n• Product information (closures, frontals, wigs, bundles)\n• Shipping & delivery (7-21 days)\n• Our special services\n• Payment methods\n\nWhat would you like to know about our luxury hair collection? 💁🏾‍♀️";
  }
}

// Singleton instance
export const localAssistant = new LocalAIAssistant();