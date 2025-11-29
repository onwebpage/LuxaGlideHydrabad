import { Resend } from 'resend';

// For Render deployment, use RESEND_API_KEY and RESEND_FROM_EMAIL environment variables
// For Replit, it uses the connector system
let resendClient: Resend | null = null;
let fromEmail: string | null = null;

async function getResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  // First try direct environment variables (for Render/external deployment)
  if (process.env.RESEND_API_KEY) {
    if (!resendClient) {
      resendClient = new Resend(process.env.RESEND_API_KEY);
      fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    }
    return { client: resendClient, fromEmail: fromEmail! };
  }

  // Fall back to Replit connector system
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!hostname || !xReplitToken) {
    console.warn('Email service not configured - set RESEND_API_KEY and RESEND_FROM_EMAIL');
    throw new Error('Email service not configured');
  }

  const connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  
  return {
    client: new Resend(connectionSettings.settings.api_key),
    fromEmail: connectionSettings.settings.from_email
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(data: EmailData): Promise<void> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    
    console.log(`Email sent to ${data.to}: ${data.subject}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendNewOrderEmail(orderData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: string;
  items: Array<{ productName: string; quantity: number; price: string }>;
}): Promise<void> {
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
        <h1 style="color: #111827; margin-bottom: 20px;">Order Confirmation</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${orderData.customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your order! We've received your order and will process it shortly.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${orderData.totalAmount}</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">We'll send you another email when your order ships.</p>
        <p style="font-size: 14px; color: #6b7280;">If you have any questions, please don't hesitate to contact us.</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: orderData.customerEmail,
    subject: `Order Confirmation - ${orderData.orderNumber}`,
    html,
  });
}

export async function sendVendorApprovedEmail(vendorData: {
  email: string;
  businessName: string;
  vendorName: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <h1 style="color: #166534; margin-bottom: 20px;">Vendor Application Approved!</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${vendorData.vendorName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your vendor application for <strong>${vendorData.businessName}</strong> has been approved.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">What's Next?</h2>
          <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 10px;">You can now add products to your vendor account</li>
            <li style="margin-bottom: 10px;">Start listing your products for sale</li>
            <li style="margin-bottom: 10px;">Manage your inventory and orders</li>
            <li style="margin-bottom: 10px;">Track your sales and performance</li>
          </ul>
        </div>

        <p style="font-size: 16px; margin-top: 20px;">Log in to your vendor dashboard to get started!</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Welcome to our platform. We're excited to have you on board!</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: vendorData.email,
    subject: 'Your Vendor Application Has Been Approved!',
    html,
  });
}

export async function sendOrderShippedEmail(orderData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNumber?: string;
}): Promise<void> {
  const trackingInfo = orderData.trackingNumber 
    ? `<p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>` 
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #eff6ff; padding: 30px; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h1 style="color: #1e40af; margin-bottom: 20px;">Your Order Has Shipped!</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${orderData.customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Good news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Shipping Details</h2>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
          ${trackingInfo}
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">You'll receive another email when your order is delivered.</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you for your order!</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: orderData.customerEmail,
    subject: `Your Order Has Shipped - ${orderData.orderNumber}`,
    html,
  });
}

export async function sendOrderDeliveredEmail(orderData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f0fdf4; padding: 30px; border-radius: 8px; border-left: 4px solid #22c55e;">
        <h1 style="color: #166534; margin-bottom: 20px;">Order Delivered!</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${orderData.customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Your order has been successfully delivered!</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Order Details</h2>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderData.orderNumber}</p>
        </div>

        <p style="font-size: 16px; margin-top: 20px;">We hope you enjoy your purchase!</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you for shopping with us!</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: orderData.customerEmail,
    subject: `Your Order Has Been Delivered - ${orderData.orderNumber}`,
    html,
  });
}

export async function sendPasswordResetEmail(userData: {
  email: string;
  name: string;
  resetToken: string;
  resetUrl: string;
}): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #fef2f2; padding: 30px; border-radius: 8px; border-left: 4px solid #ef4444;">
        <h1 style="color: #991b1b; margin-bottom: 20px;">Password Reset Request</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${userData.name},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${userData.resetUrl}" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Reset Password</a>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 14px; color: #6b7280; margin: 0;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 14px; color: #3b82f6; word-break: break-all; margin: 10px 0;">${userData.resetUrl}</p>
        </div>

        <p style="font-size: 14px; color: #991b1b; margin-top: 30px;"><strong>Important:</strong> This link will expire in 1 hour.</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userData.email,
    subject: 'Password Reset Request',
    html,
  });
}

export async function sendInvoiceEmail(invoiceData: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: string;
  items: Array<{ productName: string; quantity: number; price: string }>;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
}): Promise<void> {
  const itemsHtml = invoiceData.items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${item.price}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px;">
        <h1 style="color: #111827; margin-bottom: 20px;">Invoice - ${invoiceData.orderNumber}</h1>
        <p style="font-size: 16px; margin-bottom: 20px;">Hello ${invoiceData.customerName},</p>
        <p style="font-size: 16px; margin-bottom: 20px;">Please find your invoice details below:</p>
        
        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Invoice Details</h2>
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${invoiceData.orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 15px;">Shipping Address</h3>
          <p style="margin: 2px 0;">${invoiceData.shippingAddress.fullName}</p>
          <p style="margin: 2px 0;">${invoiceData.shippingAddress.addressLine1}</p>
          ${invoiceData.shippingAddress.addressLine2 ? `<p style="margin: 2px 0;">${invoiceData.shippingAddress.addressLine2}</p>` : ''}
          <p style="margin: 2px 0;">${invoiceData.shippingAddress.city}, ${invoiceData.shippingAddress.state} ${invoiceData.shippingAddress.postalCode}</p>
        </div>

        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; font-size: 16px; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="padding: 8px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                <th style="padding: 8px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 18px; font-weight: 600; margin: 0;"><strong>Total:</strong> ₹${invoiceData.totalAmount}</p>
          </div>
        </div>

        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">Thank you for your business!</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: invoiceData.customerEmail,
    subject: `Invoice for Order ${invoiceData.orderNumber}`,
    html,
  });
}
