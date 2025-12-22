/* eslint-disable @typescript-eslint/no-explicit-any */
//app/api/chat/free/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    let userMessage: string = '';
    
    try {
        const { message, conversation = [] } = await request.json();
        userMessage = message;

        if (!userMessage || typeof userMessage !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Check if Ollama is running first
        let ollamaRunning = false;
        try {
            const testResponse = await fetch('http://localhost:11434/api/tags', {
                method: 'GET',
                signal: AbortSignal.timeout(3000) // 3 second timeout
            });
            ollamaRunning = testResponse.ok;
        } catch {
            ollamaRunning = false;
        }

        // If Ollama is not running, use fallback immediately
        if (!ollamaRunning) {
            console.log('Ollama not running, using fallback');
            const fallbackResponse = getFallbackResponse(userMessage);
            return NextResponse.json({ 
                response: fallbackResponse,
                source: 'fallback',
                timestamp: new Date().toISOString()
            });
        }

        // Prepare messages for Ollama with better context management
        const messages = [
            { 
                role: 'system', 
                content: `You are Ada, the AI assistant for Hair Stop - a luxury hair boutique in Nigeria.
                **Business Info:**
                - Products: Closures, Frontals, Wigs, Hair Bundles
                - Shipping: 7-21 days delivery. Free shipping for orders over ₦1M in Lagos, 10% discount elsewhere.
                - Services: Hair Revamping, Wig Making, Hair Maintenance & Massage
                - Payment: UBA Bank - 1028154357 (HAIR STOP)
                
                **Guidelines:**
                - Be friendly, professional, and helpful
                - Use occasional emojis but don't overdo it
                - If unsure about pricing, suggest contacting support
                - Always mention shipping is separate from hair price
                - Keep responses concise but informative
                - Current date: ${new Date().toLocaleDateString()}`
            },
            ...conversation.map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: 'user', content: userMessage }
        ];

        console.log('Sending to Ollama:', { 
            messageCount: messages.length,
            lastMessage: userMessage.substring(0, 50) + '...'
        });

        // Call Ollama API with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'llama3.2',
                messages: messages,
                stream: false,
                options: {
                    temperature: 0.3, // Lower for consistency
                    top_p: 0.9,
                    repeat_penalty: 1.1, // Prevent repetition
                    num_predict: 300 // Shorter responses
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!ollamaResponse.ok) {
            const errorText = await ollamaResponse.text();
            console.error('Ollama API error:', ollamaResponse.status, errorText);
            throw new Error(`Ollama API error: ${ollamaResponse.status}`);
        }

        const data = await ollamaResponse.json();
        
        console.log('Ollama response received');
        
        return NextResponse.json({ 
            response: data.message?.content || getFallbackResponse(userMessage),
            source: 'ollama',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        
        // Use fallback for any error
        const fallbackResponse = getFallbackResponse(userMessage);
        
        return NextResponse.json({
            response: fallbackResponse,
            source: 'fallback',
            timestamp: new Date().toISOString()
        }, { status: 200 });
    }
}

// GET endpoint to check Ollama status
export async function GET() {
    try {
        const response = await fetch('http://localhost:11434/api/tags', {
            method: 'GET',
            signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
            const data = await response.json();
            const hasModel = data.models?.some((model: any) => 
                model.name.includes('llama') || 
                model.name.includes('mistral') ||
                model.name.includes('phi')
            );
            
            return NextResponse.json({
                status: hasModel ? 'connected' : 'no-model',
                models: data.models?.map((m: any) => m.name) || [],
                model: 'llama3.2',
                message: hasModel 
                    ? 'Ollama is running with models available' 
                    : 'Ollama is running but no suitable models found'
            });
        }
        
        return NextResponse.json({
            status: 'disconnected',
            message: 'Ollama is not running or not accessible'
        });
    } catch (error) {
        return NextResponse.json({
            status: 'disconnected',
            message: 'Failed to connect to Ollama'
        });
    }
}

// Improved fallback responses
function getFallbackResponse(userMessage?: string): string {
    if (!userMessage) {
        return "Hi! I'm your Hair Stop assistant. 💁🏾‍♀️ How can I help you today?";
    }
    
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Check for specific product inquiries
    if (lowerMessage.includes('frontal')) {
        return "Frontals are a premium hairpiece that creates a natural-looking hairline from ear to ear! 💁🏾‍♀️ They give you more styling versatility than closures. Our frontals are foreign-weaved for a luxury feel. Would you like to know about pricing or installation?";
    }
    
    if (lowerMessage.includes('closure')) {
        return "Closures are hairpieces that cover a small section of your head (usually 4x4 inches). They're perfect for protective styling! Our closures are made with premium imported hair for a natural look. ✨";
    }
    
    if (lowerMessage.includes('wig')) {
        return "We offer ready-made wigs and custom wig making! 👑 Our wigs are crafted with premium hair and can be styled just like natural hair. Would you like ready-made or custom?";
    }
    
    if (lowerMessage.includes('bundle')) {
        return "Hair bundles are the foundation of any great install! We offer bundles in various lengths and textures. All our hair is foreign-weaved for that luxurious feel. What length are you looking for?";
    }
    
    // Shipping questions
    if (lowerMessage.includes('ship') || lowerMessage.includes('deliver') || lowerMessage.includes('delivery')) {
        return "Shipping info: 🚚\n• Delivery: 7-21 days\n• Lagos orders over ₦1M: FREE shipping\n• Other locations: 10% shipping discount\n• You pay when hair arrives at your door\n• Hair price doesn't include shipping";
    }
    
    // Price questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        return "Pricing varies by product type, length, and texture! 💁🏾‍♀️ For the most accurate pricing on our luxury hair, please contact our support team. They'll help you choose the perfect hair within your budget!";
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! 👋 I'm your Hair Stop assistant! I can help with product info, shipping, services, or anything about our luxury hair. What would you like to know?";
    }
    
    // Services
    if (lowerMessage.includes('service') || lowerMessage.includes('maintain') || lowerMessage.includes('revamp')) {
        return "Our services: ✨\n1. Hair Revamping - Refresh old hair\n2. Wig Making - Custom creations\n3. Hair Maintenance & Massage\n4. Periodic maintenance plans\nWe're keepers of your hair trophies!";
    }
    
    // Default response
    return "Thanks for your message! 💁🏾‍♀️ I specialize in helping with:\n• Hair products (closures, frontals, wigs, bundles)\n• Shipping & delivery info\n• Our hair services\n• Payment methods\n\nWhat specific question can I help with today?";
}