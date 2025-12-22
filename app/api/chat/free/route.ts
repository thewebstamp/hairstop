//app/api/chat/free/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = getEnhancedBusinessResponse(message);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      {
        response:
          "Hello! I'm the Hair Stop Assistant. 💁🏾‍♀️ I can help with:\n• Product info (closures, frontals, wigs, bundles)\n• Shipping & delivery\n• Our hair services\n• Payment methods\n\nWhat would you like to know?",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "active",
    version: "1.0.0",
    message: "Hair Stop Chat Assistant is ready to help!",
  });
}

// Enhanced business-specific responses
function getEnhancedBusinessResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase().trim();

  // 1. GREETINGS & BASIC COURTESY (Very General)
  if (
    lowerMessage.includes("hello") ||
    lowerMessage.includes("hi") ||
    lowerMessage.includes("hey") ||
    lowerMessage.includes("good morning") ||
    lowerMessage.includes("good afternoon") ||
    lowerMessage.includes("good evening")
  ) {
    return "Hello! 👋 Welcome to **Hair Stop** - Your first stop for quality and luxury hair! 💁🏾‍♀️\n\nI can help you with:\n• **Products:** Closures, Frontals, Wigs, Bundles\n• **Shipping:** 7-21 days delivery\n• **Services:** Installation, Revamping, Maintenance\n• **Payment:** Bank transfer, POS\n• **Contact:** Phone, WhatsApp, Email\n\nWhat would you like to know about today?";
  }

  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return "You're welcome! ✨\n\nIf you need more help or want to place an order:\n📞 **Call/WhatsApp:** +234-812-345-6789\n📧 **Email:** info@hairstop.com\n📍 **Visit:** Our Lagos studio\n\nWe're here to help you get the perfect hair! 💁🏾‍♀️";
  }

  if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
    return "Goodbye! 👋 Thank you for visiting Hair Stop.\n\nRemember, we're your first stop for quality and luxury hair! 💁🏾‍♀️\n\nNeed help later? We're always here!\n📞 +234-812-345-6789";
  }

  // 2. PRODUCT-SPECIFIC RESPONSES (Most Specific - Check First)
  if (lowerMessage.includes("frontal")) {
    return "**Frontals** are premium hairpieces that create a natural-looking hairline from ear to ear! 💁🏾‍♀️\n\n**Features:**\n• 100% imported human hair\n• Lace or silk base options\n• Available in 13x4, 13x6, 13x8 inches\n• Can be tinted to match your skin tone\n• Perfect for versatile styling (ponytails, updos, etc.)\n\n**Price Range:** ₦25,000 - ₦60,000\n\nWould you like to know about installation or maintenance?";
  }

  if (lowerMessage.includes("closure")) {
    return "**Closures** cover a 4x4 inch section - perfect for protective styling! ✨\n\n**Types we offer:**\n• **Lace closures** - Most natural look\n• **Silk base closures** - No bleaching needed\n• **360 closures** - For full perimeter styling\n\n**Benefits:**\n• Protects your natural hair\n• Easy to install\n• Reusable with proper care\n• Available in all textures (straight, wavy, curly)\n\n**Price:** ₦15,000 - ₦35,000";
  }

  if (lowerMessage.includes("wig")) {
    return "We offer both **ready-made wigs** and **custom wig making**! 👑\n\n**Ready-made Wigs:**\n• Available for immediate purchase\n• Various lengths (14-30 inches)\n• Lace front & full lace options\n• Human hair & synthetic blends\n\n**Custom Wigs:**\n• Made to your specifications\n• Choose hair type, length, density\n• Perfect fit guaranteed\n• 7-10 days production time\n\n**Starting Price:** ₦40,000 for ready-made, ₦60,000 for custom";
  }

  if (lowerMessage.includes("bundle")) {
    return '**Hair Bundles** - The foundation of any great install! 💫\n\n**Available Hair Types:**\n• **Brazilian** - Thick, durable, minimal shedding\n• **Peruvian** - Soft, silky, natural wave\n• **Malaysian** - Super straight, glossy finish\n• **Virgin Hair** - Unprocessed, highest quality\n\n**Lengths:** 10", 12", 14", 16", 18", 20", 22", 24", 26", 28", 30"\n\n**Price per bundle:** ₦8,000 - ₦25,000\n\nHow many bundles do you need for your install?';
  }

  // 3. SPECIFIC COMPARISONS & STYLE RECOMMENDATIONS
  // Comparison Questions (e.g., "closure vs frontal")
  if (
    lowerMessage.includes("vs") ||
    lowerMessage.includes("difference between") ||
    lowerMessage.includes("which is better") ||
    lowerMessage.includes("compare")
  ) {
    if (lowerMessage.includes("closure") && lowerMessage.includes("frontal")) {
      return `**Closure vs. Frontal – Here's the breakdown:** ⚖️

| Feature | **Closure (4x4)** | **Frontal (13x4/6)** |
|---------|-------------------|-----------------------|
| **Coverage** | Covers a small section at top/center. | Covers entire hairline ear-to-ear. |
| **Styling** | Limited; best for middle/side parts. | Very versatile; allows ponytails, updos, deep parts. |
| **Look** | Natural but less flexible. | Most natural, undetectable hairline. |
| **Best For** | Protective styling, beginners, budget. | Full glam, versatile styling, any look. |
| **Price** | ₦15,000 – ₦35,000 | ₦25,000 – ₦60,000 |

**Still unsure?** Describe the style you want, and I'll recommend the best option!`;
    }
  }

  // STYLE RECOMMENDATION FOLLOW-UPS (After seeing comparison)
  if (
    lowerMessage.includes("ponytail") ||
    lowerMessage.includes("updo") ||
    lowerMessage.includes("up do") ||
    lowerMessage.includes("slick back") ||
    lowerMessage.includes("versatile") ||
    lowerMessage.includes("any style") ||
    lowerMessage.includes("different style") ||
    lowerMessage.includes("full glam") ||
    lowerMessage.includes("natural hairline") ||
    lowerMessage.includes("undetectable")
  ) {
    return `Based on that style, I **highly recommend a Frontal!** 👑

A **13x4 or 13x6 Frontal** is perfect because:
• It gives you the **entire hairline** to work with, making ponytails, updos, and slick-back styles look flawless.
• The lace melts seamlessly into your skin for that **undetectable, natural look**.
• It's the go-to choice for **maximum versatility and glam**.

**Ready to order or need a price quote?** Message us on WhatsApp at **+234-812-345-6789** with "Frontal" and your preferred length/texture.`;
  }

  if (
    lowerMessage.includes("protective") ||
    lowerMessage.includes("simple") ||
    lowerMessage.includes("easy") ||
    lowerMessage.includes("low maintenance") ||
    lowerMessage.includes("beginner") ||
    lowerMessage.includes("budget") ||
    lowerMessage.includes("cheaper") ||
    lowerMessage.includes("middle part") ||
    lowerMessage.includes("basic")
  ) {
    return `For that, a **Closure is your best bet!** 💡

A **4x4 Lace Closure** is ideal because:
• It's **more affordable and easier** to install, great for beginners or low-maintenance styles.
• It perfectly suits **middle parts, side parts, and simple styles**.
• It's excellent for **protective styling**, covering just a small section while your natural hair rests.

**Want to see closure options?** Chat with us on WhatsApp at **+234-812-345-6789** and ask for "Closure pictures and prices".`;
  }

  // 4. SPECIFIC BUSINESS TOPICS (Shipping, Price, Services, etc.)
  // Shipping questions
  if (lowerMessage.includes("ship") || lowerMessage.includes("deliver")) {
    return "**Shipping Information** 🚚\n\n**Delivery Time:** 7-21 days maximum\n\n**Shipping Costs:**\n• Orders over ₦1,000,000 = FREE shipping\n\n**Important Notes:**\n1. Hair price does NOT include shipping\n2. Shipping cost is calculated after order review\n3. Pay for delivery WHEN hair arrives at your gate\n4. Track your order via WhatsApp\n\nNeed a shipping quote? Send your location!";
  }

  // Price questions
  if (
    lowerMessage.includes("price") ||
    lowerMessage.includes("cost") ||
    lowerMessage.includes("how much")
  ) {
    return "**Pricing Information** 💰\n\nPrices vary by:\n• Hair type (Brazilian, Peruvian, Malaysian)\n• Length\n• Texture (straight, wavy, curly)\n• Quantity\n\n**For exact pricing**, please contact us via:\n📞 **Phone:** +234-812-345-6789\n💬 **WhatsApp:** +234-812-345-6789\n📧 **Email:** info@hairstop.com\n\nWe'll give you the best quote!";
  }

  // Services
  if (
    lowerMessage.includes("service") ||
    lowerMessage.includes("install") ||
    lowerMessage.includes("revamp")
  ) {
    return "**Our Professional Services** ✂️\n\n1. **Hair Installation** - Expert wig/weave installation\n2. **Hair Revamping** - Refresh old or damaged hair\n3. **Custom Wig Making** - Made to your exact specifications\n4. **Hair Maintenance** - Cleaning, conditioning, styling\n5. **Periodic Maintenance Plans** - Discounted packages\n\n**Studio Location:** Lagos, Nigeria\n**Appointment Required:** Yes\n**Service Hours:** Mon-Sat: 9AM-6PM\n\nBook an appointment: +234-812-345-6789";
  }

  // Payment
  if (
    lowerMessage.includes("payment") ||
    lowerMessage.includes("pay") ||
    lowerMessage.includes("bank")
  ) {
    return "**Payment Methods** 💳\n\n**Bank Transfer:**\n🏦 **Bank:** UBA (United Bank for Africa)\n📋 **Account Name:** HAIR STOP\n🔢 **Account Number:** 1028154357\n\n**Other Methods:**\n• POS available at our studio\n• Cash on delivery (Lagos only)\n• Payment plans available\n\n**After Payment:**\n1. Send proof of payment to +234-812-345-6789\n2. Include your name and order details\n3. We'll confirm within 24 hours\n\nNeed help with payment? Call us!";
  }

  // Contact
  if (
    lowerMessage.includes("contact") ||
    lowerMessage.includes("whatsapp") ||
    lowerMessage.includes("call") ||
    lowerMessage.includes("email")
  ) {
    return "**Contact Hair Stop** 📞\n\n**Phone/WhatsApp:** +234-812-345-6789\n**Email:**nCall or WhatsApp for immediate response!";
  }

  // 5. PRODUCT ATTRIBUTES & RECOMMENDATIONS (More General)
  // Hair Texture & Style Questions
  if (
    lowerMessage.includes("texture") ||
    lowerMessage.includes("straight") ||
    lowerMessage.includes("curly") ||
    lowerMessage.includes("wave") ||
    lowerMessage.includes("body") ||
    lowerMessage.includes("type")
  ) {
    return `We carry **all popular textures** so you can achieve your desired look! 💫

**Available Textures:**
• **Straight/Silky** – Classic, sleek, and versatile
• **Deep Wave/Water Wave** – Voluminous, defined curls
• **Loose Wave/Beach Wave** – Natural, effortless body
• **Curly/Kinky Curly** – Coiled and full of bounce
• **Bundles with Closure/Frontal** – Get a complete, matching set

**Pro Tip:** Most textures can be lightly styled with heat tools. For the best match, describe your goal or send us a style picture on WhatsApp (+234-812-345-6789)!`;
  }

  // Quality & "Virgin Hair" Inquiries
  if (
    lowerMessage.includes("quality") ||
    lowerMessage.includes("virgin") ||
    lowerMessage.includes("human hair") ||
    lowerMessage.includes("remy") ||
    lowerMessage.includes("shed") ||
    lowerMessage.includes("tangle")
  ) {
    return `**Quality is our promise!** All Hair Stop hair is **100% unprocessed human hair**. ✅

**What this means for you:**
• **Minimal Shedding & Tangling** – Cuticles are intact and aligned.
• **Can be Dyed & Styled** – Use heat tools and color just like natural hair.
• **Long-Lasting** – With proper care, our hair lasts for multiple installs.
• **Luxury Feel** – Soft, natural shine and movement.`;
  }

  // "Do you have...?" / Availability Questions
  if (
    lowerMessage.includes("do you have") ||
    lowerMessage.includes("available") ||
    lowerMessage.includes("in stock") ||
    lowerMessage.includes("get") ||
    lowerMessage.includes("color")
  ) {
    return `**Availability Check** 🛒

We regularly stock:
• **All standard lengths**
• **Popular colors** (custom tinting)
• **All textures** (Straight, Wave, Curly)
• **Closures & Frontals** (Lace & Silk base)

**For the most current stock, specific colors, or to reserve an item,** please message us directly on WhatsApp at **+234-812-345-6789** with your request. We'll confirm instantly!`;
  }

  // Recommendation & "What should I get?" Questions
  if (
    lowerMessage.includes("recommend") ||
    lowerMessage.includes("suggest") ||
    lowerMessage.includes("what should i") ||
    lowerMessage.includes("choose") ||
    lowerMessage.includes("help me pick")
  ) {
    return `I'd love to help you choose! The perfect product depends on your goal. 🎯

**Quick Guide:**
• **Want a full, versatile hairline?** → Choose a **Frontal** (13x4 or 13x6)
• **Want simple, protective styling?** → Choose a **Closure** (4x4)
• **Want a quick, ready-to-wear style?** → Choose a **Ready-Made Wig**
• **Want a perfect, custom fit?** → Choose **Custom Wig Making**
• **Doing your own install?** → You'll need **Bundles** (3-4 for full head)

**Best next step:** Tell us your budget or show us a style picture on WhatsApp! Our experts give free consultations.`;
  }

  if (
    lowerMessage.includes("not sure") ||
    lowerMessage.includes("undecided") ||
    lowerMessage.includes("confused") ||
    lowerMessage.includes("what do you think") ||
    lowerMessage.includes("help me decide")
  ) {
    return `No problem at all! Many clients start unsure. Here's my best advice: 🤔

**Choose a FRONTAL if:**
✓ You love changing your hairstyle often (ponytails, buns, parting anywhere).
✓ You want the most natural, "leave-out" look.
✓ Your budget is flexible for more versatility.

**Choose a CLOSURE if:**
✓ You prefer simple, quick, and classic styles (middle/side part).
✓ You're new to wearing lace pieces or want an easier install.
✓ You're looking for a great quality option at a lower price point.

**The best way to decide?** Send us a **picture of your goal hairstyle** on WhatsApp! Our experts will give you a free recommendation. 📲`;
  }

  // 6. GENERAL PRODUCT INQUIRY (Most General - Check Last)
  if (
    lowerMessage.includes("product") ||
    lowerMessage.includes("sell") ||
    lowerMessage.includes("offer") ||
    lowerMessage.includes("stock") ||
    lowerMessage.includes("have")
  ) {
    // Check if the question is already about a specific product
    if (
      !lowerMessage.includes("frontal") &&
      !lowerMessage.includes("closure") &&
      !lowerMessage.includes("wig") &&
      !lowerMessage.includes("bundle")
    ) {
      return `We offer a full range of **luxury hair products** at Hair Stop! 💇🏾‍♀️

**Our Signature Collections:**
• **Closures & Frontals** – For seamless, natural-looking installs
• **Ready-Made & Custom Wigs** – For instant or personalized glam
• **Hair Bundles** – Brazilian, Peruvian, Malaysian & Virgin hair

**Why choose us?**
✨ **100% Human Hair** – All our hair is imported, high-quality, and can be styled & colored.
✨ **Luxury Feel** – Foreign-weaved strands for a premium, durable finish.
✨ **Expert Services** – We also install, revamp, and maintain your hair.

**Next step:** Are you interested in a specific product like closures, frontals, wigs, or bundles? Or would you like our price list?`;
    }
  }

  // 7. DEFAULT RESPONSE (Final catch-all)
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
📞 **Phone/WhatsApp:** +234-812-345-6789
📧 **Email:** info@hairstop.com`;
}
