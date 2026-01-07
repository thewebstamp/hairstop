//lib/email-admin.ts
import nodemailer from "nodemailer";
import pool from "./db";

// Create transporter for admin emails
const adminTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send order status update email to customer
export async function sendOrderStatusEmail({
  to,
  name,
  orderNumber,
  orderId,
  oldStatus,
  newStatus,
  notes,
}: {
  to: string;
  name: string;
  orderNumber: string;
  orderId: number;
  oldStatus: string;
  newStatus: string;
  notes?: string;
}) {
  const statusMessages: Record<string, string> = {
    processing: "Your order is now being processed.",
    shipped: "Your order has been shipped!",
    delivered: "Your order has been delivered.",
    cancelled: "Your order has been cancelled.",
  };

  const message = statusMessages[newStatus] || `Your order status has been updated to ${newStatus}.`;

  const orderLink = `${process.env.NEXTAUTH_URL}/orders/${orderId}`;
  
  const mailOptions = {
    from: `"Hair Stop" <${process.env.EMAIL_FROM || "hairstopwigsandextentions@gmail.com"}>`,
    to,
    subject: `Order Update - #${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Order Status Updated</h2>
        
        <p>Hello ${name},</p>
        
        <p>The status of your order <strong>#${orderNumber}</strong> has been updated:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Previous Status:</strong> ${oldStatus}</p>
          <p><strong>New Status:</strong> ${newStatus}</p>
          <p><strong>Update:</strong> ${message}</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>You can view your order details anytime:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${orderLink}" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <p>If you have any questions about this update, please contact our support team.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };

  try {
    if (process.env.NODE_ENV === "production") {
      return await adminTransporter.sendMail(mailOptions);
    } else {
      console.log("Order status email (development):", {
        to,
        orderNumber,
        status: newStatus,
      });
      return { message: "Email logged in development" };
    }
  } catch (error) {
    console.error("Error sending order status email:", error);
    throw error;
  }
}

// Send admin notification for new orders
export async function sendAdminNotificationEmail({
  orderNumber,
  orderId,
  customerName,
  newStatus,
}: {
  orderNumber: string;
  orderId: number;
  customerName: string;
  newStatus?: string;
}) {
  const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS 
    ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',') 
    : [process.env.ADMIN_EMAIL || 'hairstopwigsandextentions@gmail.com'];

  const subject = newStatus 
    ? `Order #${orderNumber} Status Updated to ${newStatus}`
    : `New Order Received - #${orderNumber}`;

  const message = newStatus
    ? `Order #${orderNumber} status has been updated to ${newStatus}.`
    : `A new order #${orderNumber} has been placed by ${customerName}.`;

  const adminOrderLink = `${process.env.NEXTAUTH_URL}/admin/orders/${orderId}`;
  
  const mailOptions = {
    from: `"Hair Stop Admin" <${process.env.EMAIL_FROM || "hairstopwigsandextentions@gmail.com"}>`,
    to: adminEmails.join(', '),
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">${subject}</h2>
        
        <p>${message}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${orderNumber}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          ${newStatus ? `<p><strong>New Status:</strong> ${newStatus}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${adminOrderLink}" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Order in Admin Panel
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated notification from Hair Stop Admin System.
        </p>
      </div>
    `,
  };

  try {
    if (process.env.NODE_ENV === "production") {
      return await adminTransporter.sendMail(mailOptions);
    } else {
      console.log("Admin notification email (development):", {
        to: adminEmails,
        orderNumber,
        customerName,
        newStatus,
      });
      return { message: "Admin email logged in development" };
    }
  } catch (error) {
    console.error("Error sending admin notification:", error);
    throw error;
  }
}

// Send low stock alert to admin
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendLowStockAlert(products: any[]) {
  const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS 
    ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',') 
    : [process.env.ADMIN_EMAIL || 'hairstopwigsandextentions@gmail.com'];

  if (products.length === 0) return;

  const productList = products.map(product => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.category_name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.stock}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₦${product.price.toLocaleString()}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Hair Stop Inventory" <${process.env.EMAIL_FROM || "hairstopwigsandextentions@gmail.com"}>`,
    to: adminEmails.join(', '),
    subject: `Low Stock Alert - ${products.length} Product${products.length > 1 ? 's' : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Low Stock Alert ⚠️</h2>
        
        <p>The following products are running low on stock:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Category</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Stock</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${productList}
          </tbody>
        </table>
        
        <p><strong>Action Required:</strong> Please restock these items to avoid running out.</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXTAUTH_URL}/admin/products" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            Manage Products
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated alert from Hair Stop Inventory System.
        </p>
      </div>
    `,
  };

  try {
    if (process.env.NODE_ENV === "production") {
      return await adminTransporter.sendMail(mailOptions);
    } else {
      console.log("Low stock alert (development):", {
        products: products.map(p => p.name),
        stock: products.map(p => p.stock),
      });
      return { message: "Low stock alert logged in development" };
    }
  } catch (error) {
    console.error("Error sending low stock alert:", error);
    throw error;
  }
}

// Send daily sales report
export async function sendDailySalesReport({
  date,
  totalOrders,
  totalRevenue,
  topProducts,
  newCustomers,
}: {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topProducts: any[];
  newCustomers: number;
}) {
  const adminEmails = process.env.ADMIN_NOTIFICATION_EMAILS 
    ? process.env.ADMIN_NOTIFICATION_EMAILS.split(',') 
    : [process.env.ADMIN_EMAIL || 'hairstopwigsandextentions@gmail.com'];

  const topProductsList = topProducts.map((product, index) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${product.quantity_sold}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">₦${product.revenue.toLocaleString()}</td>
    </tr>
  `).join('');

  const mailOptions = {
    from: `"Hair Stop Reports" <${process.env.EMAIL_FROM || "hairstopwigsandextentions@gmail.com"}>`,
    to: adminEmails.join(', '),
    subject: `Daily Sales Report - ${date}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #8B5A2B;">Daily Sales Report 📊</h2>
        <h3>${date}</h3>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8B5A2B;">${totalOrders}</div>
              <div style="font-size: 14px; color: #666;">Total Orders</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8B5A2B;">₦${totalRevenue.toLocaleString()}</div>
              <div style="font-size: 14px; color: #666;">Total Revenue</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #8B5A2B;">${newCustomers}</div>
              <div style="font-size: 14px; color: #666;">New Customers</div>
            </div>
          </div>
        </div>
        
        <h4>Top Selling Products</h4>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">#</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Product</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Quantity Sold</th>
              <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${topProductsList}
          </tbody>
        </table>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${process.env.NEXTAUTH_URL}/admin/analytics" 
             style="background-color: #8B5A2B; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 4px; font-weight: bold;">
            View Detailed Analytics
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        
        <p style="color: #666; font-size: 12px;">
          This is an automated daily report from Hair Stop.
        </p>
      </div>
    `,
  };

  try {
    if (process.env.NODE_ENV === "production") {
      return await adminTransporter.sendMail(mailOptions);
    } else {
      console.log("Daily sales report (development):", {
        date,
        totalOrders,
        totalRevenue,
        topProductsCount: topProducts.length,
        newCustomers,
      });
      return { message: "Daily report logged in development" };
    }
  } catch (error) {
    console.error("Error sending daily report:", error);
    throw error;
  }
}