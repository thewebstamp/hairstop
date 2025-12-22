// lib/email.ts
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendWelcomeEmail({
  to,
  name,
  verificationToken,
}: {
  to: string;
  name: string;
  verificationToken: string;
}) {
  const storeName = "Hair Stop";
  const storeEmail = "noreply@hairstop.ng";

  const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"${storeName}" <${process.env.EMAIL_FROM || storeEmail}>`,
    to,
    subject: `Welcome to ${storeName}! Verify Your Email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Welcome to ${storeName}, ${name}! 🎉</h2>
        
        <p>Thank you for creating an account with Hair Stop. We're excited to have you join our community of hair enthusiasts!</p>
        
        <p>To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${verificationLink}
        </p>
        
        <p>This verification link will expire in 24 hours.</p>
        
        <p>Once verified, you can:</p>
        <ul>
          <li>Save your favorite hair products</li>
          <li>Track your orders</li>
          <li>Write reviews and earn rewards</li>
          <li>Get exclusive offers and discounts</li>
        </ul>
        
        <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          If you didn't create an account with Hair Stop, please ignore this email.
        </p>
      </div>
    `,
  };

  // In production, send actual email
  if (process.env.NODE_ENV === "production") {
    return await transporter.sendMail(mailOptions);
  } else {
    // In development, log the email
    console.log("Welcome email details:", {
      to,
      verificationLink,
    });
    return { message: "Email logged in development" };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetToken,
}: {
  to: string;
  name: string;
  resetToken: string;
}) {
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"Hair Stop" <${process.env.EMAIL_FROM || "noreply@hairstop.ng"}>`,
    to,
    subject: "Reset Your Hair Stop Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Password Reset Request</h2>
        
        <p>Hello ${name},</p>
        
        <p>We received a request to reset your password for your Hair Stop account.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this link in your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${resetLink}
        </p>
        
        <p><strong>This link will expire in 1 hour.</strong></p>
        
        <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          For security reasons, never share this link with anyone. Hair Stop will never ask for your password.
        </p>
      </div>
    `,
  };

  if (process.env.NODE_ENV === "production") {
    return await transporter.sendMail(mailOptions);
  } else {
    console.log("Reset email details:", {
      to,
      resetLink,
    });
    return { message: "Email logged in development" };
  }
}

export async function sendOrderConfirmationEmail({
  to,
  name,
  orderNumber,
  orderId,
  totalAmount,
}: {
  to: string;
  name: string;
  orderNumber: string;
  orderId: number;
  totalAmount: number;
}) {
  const paymentLink = `${process.env.NEXTAUTH_URL}/checkout/payment/${orderId}`;
  const orderLink = `${process.env.NEXTAUTH_URL}/orders/${orderId}`;

  const mailOptions = {
    from: `"Hair Stop" <${process.env.EMAIL_FROM || "noreply@hairstop.ng"}>`,
    to,
    subject: `Order Confirmation - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Order Confirmed! 🎉</h2>
        
        <p>Hello ${name},</p>
        
        <p>Your order <strong>#${orderNumber}</strong> has been created successfully.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Amount to Pay:</strong> ₦${totalAmount.toLocaleString()}</p>
          <p><strong>Payment Method:</strong> Bank Transfer</p>
          <p><strong>Bank:</strong> UBA (United Bank for Africa)</p>
          <p><strong>Account Number:</strong> 1028154357</p>
          <p><strong>Account Name:</strong> HAIR STOP</p>
          <p><strong>Reference:</strong> ${orderNumber}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${paymentLink}" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Complete Payment
          </a>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
          <li>This payment link <strong>never expires</strong></li>
          <li>You can close the browser and return anytime</li>
          <li>Your progress is automatically saved</li>
          <li>Bookmark this email for easy access</li>
        </ul>
        
        <p>You can also view your order anytime:</p>
        <p>
          <a href="${orderLink}" 
             style="color: #8B5A2B; text-decoration: underline;">
            View Order Details
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          Need help? Contact support@hairstop.ng or reply to this email.
        </p>
      </div>
    `,
  };

  // Production vs Development handling
  if (process.env.NODE_ENV === "production") {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      // Log but don't throw - we don't want to break the order process
      return {
        message: "Failed to send email, but order was created successfully",
        error,
      };
    }
  } else {
    // Development mode - log instead of sending
    console.log("📧 Order Confirmation Email (Development Mode):", {
      to,
      name,
      orderNumber,
      orderId,
      totalAmount: `₦${totalAmount.toLocaleString()}`,
      paymentLink,
      orderLink,
      subject: mailOptions.subject,
      preview: `Email would be sent with subject: "${mailOptions.subject}"`,
      environment: process.env.NODE_ENV,
    });

    // Return a mock success response
    return {
      message: "Email logged in development mode - would be sent in production",
      preview: {
        subject: mailOptions.subject,
        recipient: to,
        orderNumber,
        paymentLink,
      },
    };
  }
}
