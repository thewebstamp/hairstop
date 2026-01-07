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

// In lib/email.ts - MODIFY the existing sendWelcomeEmail function:

export async function sendWelcomeEmail({
  to,
  name,
  verificationToken, // Make this parameter optional by adding ?
}: {
  to: string;
  name: string;
  verificationToken?: string; // Add ? to make it optional
}) {
  const storeName = "Hair Stop";
  const storeEmail = "hairstopwigsandextentions@gmail.com";

  // Create login link
  const loginLink = `${process.env.NEXTAUTH_URL}/auth/login`;

  // Determine email content based on whether we have a verification token
  let emailContent = "";

  if (verificationToken) {
    // Old logic - if verification token is provided (for backward compatibility)
    const verificationLink = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verificationToken}`;
    emailContent = `
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
    `;
  } else {
    // New logic - no verification needed
    emailContent = `
      <p>Your account is now active and ready to use! 🎉</p>
      
      <p>You can login immediately and start exploring our premium hair products:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginLink}" 
           style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; font-weight: bold;">
          Login to Your Account
        </a>
      </div>
    `;
  }

  const mailOptions = {
    from: `"${storeName}" <${process.env.EMAIL_FROM || storeEmail}>`,
    to,
    subject: verificationToken
      ? `Welcome to ${storeName}! Verify Your Email`
      : `Welcome to ${storeName}, ${name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Welcome to ${storeName}, ${name}! 🎉</h2>
        
        <p>Thank you for creating an account with Hair Stop. We're excited to have you join our community of hair enthusiasts!</p>
        
        ${emailContent}
        
        <p>With your account, you can:</p>
        <ul>
          <li>Browse and purchase our premium hair products</li>
          <li>Save your favorite items for later</li>
          <li>Track your orders in real-time</li>
          <li>Write reviews</li>
          <li>Get exclusive offers and discounts</li>
        </ul>
        
        <p><strong>Need help?</strong></p>
        <p>Contact our support team at hairstopwigsandextentions@gmail.com</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          ${
            verificationToken
              ? "If you didn't create an account with Hair Stop, please ignore this email."
              : "You're receiving this email because you created an account at Hair Stop."
          }
        </p>
        
        <p style="color: #666; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} Hair Stop. All rights reserved.
        </p>
      </div>
    `,
  };

  // Production vs Development handling
  if (process.env.NODE_ENV === "production") {
    try {
      return await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return {
        message: "Failed to send email, but account was created successfully",
        error,
      };
    }
  } else {
    // Development mode - log instead of sending
    console.log("📧 Welcome Email (Development Mode):", {
      to,
      name,
      subject: mailOptions.subject,
      hasVerification: !!verificationToken,
      loginLink: verificationToken ? "N/A (verification required)" : loginLink,
      preview: `Email would be sent with subject: "${mailOptions.subject}"`,
    });

    return {
      message: "Email logged in development mode - would be sent in production",
      preview: {
        subject: mailOptions.subject,
        recipient: to,
        hasVerification: !!verificationToken,
      },
    };
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
    from: `"Hair Stop" <${process.env.EMAIL_FROM || "hairstopwigsandextentions@gmail.com"}>`,
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
          Need help? hairstopwigsandextentions@gmail.com
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
