/* eslint-disable @typescript-eslint/no-explicit-any */
//app/api/chat/free/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const response = getEnhancedBusinessResponse(message);
        
        return NextResponse.json({ 
            response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chat API error:', error);
        
        return NextResponse.json({
            response: "Hello! I'm the Hair Stop Assistant. 💁🏾‍♀️ I can help with:\n• Product info (closures, frontals, wigs, bundles)\n• Shipping & delivery\n• Our hair services\n• Payment methods\n\nWhat would you like to know?",
            timestamp: new Date().toISOString()
        }, { status: 200 });
    }
}

// GET endpoint for health check
export async function GET() {
    return NextResponse.json({
        status: 'active',
        version: '1.0.0',
        message: 'Hair Stop Chat Assistant is ready to help!'
    });
}

// Enhanced business-specific responses
function getEnhancedBusinessResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Product-specific responses
    if (lowerMessage.includes('frontal')) {
        return "**Frontals** are premium hairpieces that create a natural-looking hairline from ear to ear! 💁🏾‍♀️\n\n**Features:**\n• 100% imported human hair\n• Lace or silk base options\n• Available in 13x4, 13x6, 13x8 inches\n• Can be tinted to match your skin tone\n• Perfect for versatile styling (ponytails, updos, etc.)\n\n**Price Range:** ₦25,000 - ₦60,000\n\nWould you like to know about installation or maintenance?";
    }
    
    if (lowerMessage.includes('closure')) {
        return "**Closures** cover a 4x4 inch section - perfect for protective styling! ✨\n\n**Types we offer:**\n• **Lace closures** - Most natural look\n• **Silk base closures** - No bleaching needed\n• **360 closures** - For full perimeter styling\n\n**Benefits:**\n• Protects your natural hair\n• Easy to install\n• Reusable with proper care\n• Available in all textures (straight, wavy, curly)\n\n*";
    }
    
    if (lowerMessage.includes('wig')) {
        return "We offer both **ready-made wigs** and **custom wig making**! 👑\n\n**Ready-made Wigs:**\n• Available for immediate purchase\n• Various lengths (14-30 inches)\n• Lace front & full lace options\n• Human hair & synthetic blends\n\n**Custom Wigs:**\n• Made to your specifications\n• Choose hair type, length, density\n• Perfect fit guaranteed\n• 7-10 days production time\n\n*";
    }
    
    if (lowerMessage.includes('bundle')) {
        return "**Hair Bundles** - The foundation of any great install! 💫\n\n**Available Hair Types:**\n• **Brazilian** - Thick, durable, minimal shedding\n• **Peruvian** - Soft, silky, natural wave\n• **Malaysian** - Super straight, glossy finish\n• **Virgin Hair** - Unprocessed, highest quality\n\n**Lengths:** 10\", 12\", 14\", 16\", 18\", 20\", 22\", 24\", 26\", 28\", 30\"\n\n\nHow many bundles do you need for your install?";
    }
    
    // Shipping questions
    if (lowerMessage.includes('ship') || lowerMessage.includes('deliver')) {
        return "**Shipping Information** 🚚\n\n**Delivery Time:** 7-21 days maximum\n\n**Shipping Costs:**\n• **Lagos:** Orders over ₦1,000,000 = FREE shipping\n• **Other States:** 10% discount on shipping cost\n• **International:** Available (contact for rates)\n\n**Important Notes:**\n1. Hair price does NOT include shipping\n2. Shipping cost is calculated after order review\n3. Pay for delivery WHEN hair arrives at your gate\n4. Track your order via WhatsApp\n\nNeed a shipping quote? Send your location!";
    }
    
    // Price questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much')) {
        return "**Pricing Information** 💰\n\nPrices vary by:\n• Hair type (Brazilian, Peruvian, Malaysian)\n• Length (10-30 inches)\n• Texture (straight, wavy, curly)\n• Quantity\n\n**For exact pricing**, please contact us via:\n📞 **Phone:** +234-812-345-6789\n💬 **WhatsApp:** +234-812-345-6789\n📧 **Email:** info@hairstop.com\n\nWe'll give you the best quote!";
    }
    
    // Services
    if (lowerMessage.includes('service') || lowerMessage.includes('install') || lowerMessage.includes('revamp')) {
        return "**Our Professional Services** ✂️\n\n1. **Hair Installation** - Expert wig/weave installation\n2. **Hair Revamping** - Refresh old or damaged hair\n3. **Custom Wig Making** - Made to your exact specifications\n4. **Hair Maintenance** - Cleaning, conditioning, styling\n5. **Periodic Maintenance Plans** - Discounted packages\n\n**Studio Location:** Lagos, Nigeria\n**Appointment Required:** Yes\n**Service Hours:** Mon-Sat: 9AM-6PM\n\nBook an appointment: +234-812-345-6789";
    }
    
    // Payment
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay') || lowerMessage.includes('bank')) {
        return "**Payment Methods** 💳\n\n**Bank Transfer:**\n🏦 **Bank:** UBA (United Bank for Africa)\n📋 **Account Name:** HAIR STOP\n🔢 **Account Number:** 1028154357\n\n**Other Methods:**\n• POS available at our studio\n• Cash on delivery (Lagos only)\n• Payment plans available\n\n**After Payment:**\n1. Send proof of payment to +234-812-345-6789\n2. Include your name and order details\n3. We'll confirm within 24 hours\n\nNeed help with payment? Call us!";
    }
    
    // Contact
    if (lowerMessage.includes('contact') || lowerMessage.includes('whatsapp') || lowerMessage.includes('call') || lowerMessage.includes('email')) {
        return "**Contact Hair Stop** 📞\n\n**Phone/WhatsApp:** +234-812-345-6789\n**Email:** info@hairstop.com\n**Instagram:** @hairstop_ng\n**Address:** Lagos, Nigeria\n\n**Business Hours:**\nMonday - Saturday: 9:00 AM - 6:00 PM\nSunday: 12:00 PM - 4:00 PM\n\n**For Urgent Inquiries:**\nCall or WhatsApp for immediate response!";
    }
    
    // Returns/Exchange
    if (lowerMessage.includes('return') || lowerMessage.includes('exchange') || lowerMessage.includes('refund')) {
        return "**Return & Exchange Policy** 📦\n\n✅ **Accepted:**\n• Unused hair bundles within 3 days of delivery\n• Wrong item received\n• Defective products\n\n❌ **Not Accepted:**\n• Custom-made wigs\n• Installed hair\n• Used products\n• Hygiene reasons\n\n**Process:**\n1. Contact us within 3 days\n2. Provide photos/video\n3. We'll guide you through return\n4. Refund/exchange within 7 days\n\nQuestions? Contact: +234-812-345-6789";
    }
    
    // Greetings
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
        return "Hello! 👋 Welcome to **Hair Stop** - Your first stop for quality and luxury hair! 💁🏾‍♀️\n\nI can help you with:\n• **Products:** Closures, Frontals, Wigs, Bundles\n• **Shipping:** 7-21 days delivery\n• **Services:** Installation, Revamping, Maintenance\n• **Payment:** Bank transfer, POS\n• **Contact:** Phone, WhatsApp, Email\n\nWhat would you like to know about today?";
    }
    
    // Thank you
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're welcome! ✨\n\nIf you need more help or want to place an order:\n📞 **Call/WhatsApp:** +234-812-345-6789\n📧 **Email:** info@hairstop.com\n📍 **Visit:** Our Lagos studio\n\nWe're here to help you get the perfect hair! 💁🏾‍♀️";
    }
    
    // Bye
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye')) {
        return "Goodbye! 👋 Thank you for visiting Hair Stop.\n\nRemember, we're your first stop for quality and luxury hair! 💁🏾‍♀️\n\nNeed help later? We're always here!\n📞 +234-812-345-6789";
    }
    
    // Default response
    return `Thanks for your message! 💁🏾‍♀️

I specialize in helping with everything about **Hair Stop**:

**Products:**
• Closures
• Frontals
• Wigs
• Hair Bundles

**Shipping:** 7-21 days delivery

**Services:** Installation, Revamping, Custom Wigs

**Need specific help?** Try asking about:
• "How much are frontals?"
• "What's your shipping policy?"
• "Do you offer installation?"
• "How can I contact you?"

Or contact us directly:
📞 **Phone/WhatsApp:** +234-812-345-6789`;
}