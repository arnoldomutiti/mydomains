const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter configuration
const createEmailTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || 'gmail';

  // Zoho Mail requires custom SMTP configuration
  if (emailService.toLowerCase() === 'zoho') {
    return nodemailer.createTransport({
      host: process.env.ZOHO_SMTP_HOST || 'smtp.zoho.com',
      port: parseInt(process.env.ZOHO_SMTP_PORT) || 465,
      secure: true, // use SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Default configuration for other services (Gmail, Outlook, etc.)
  return nodemailer.createTransport({
    service: emailService,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Twilio client configuration
const createTwilioClient = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return null;
};

// Send email notification
async function sendEmailNotification(to, subject, html) {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('[Email] Email credentials not configured');
      return { success: false, error: 'Email not configured' };
    }

    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `Domain Dashboard <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Email] Error sending email:', error.message);
    return { success: false, error: error.message };
  }
}

// Send SMS notification
async function sendSMSNotification(to, message) {
  try {
    const client = createTwilioClient();

    if (!client) {
      console.log('[SMS] Twilio credentials not configured');
      return { success: false, error: 'SMS not configured' };
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    console.log(`[SMS] Sent to ${to}: ${result.sid}`);
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('[SMS] Error sending SMS:', error.message);
    return { success: false, error: error.message };
  }
}

// Generate email HTML for domain expiry
function generateDomainExpiryEmail(domains) {
  const domainList = domains.map(d => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${d.name}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${d.daysUntilExpiry} days
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${d.expiryDate}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">⚠️ Domain Expiry Alert</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>The following domains in your portfolio are expiring soon:</p>

          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Days Remaining</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${domainList}
            </tbody>
          </table>

          <p>Please renew these domains to avoid losing them.</p>
          <p><strong>Domain Dashboard</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Domain Dashboard</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Generate email HTML for SSL expiry
function generateSSLExpiryEmail(domains) {
  const domainList = domains.map(d => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${d.name}</strong>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${d.daysUntilExpiry} days
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        ${d.expiryDate}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; }
        th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; }
        .footer { margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔒 SSL Certificate Expiry Alert</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>The following SSL certificates are expiring soon:</p>

          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Days Remaining</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              ${domainList}
            </tbody>
          </table>

          <p>Please renew these SSL certificates to maintain secure connections.</p>
          <p><strong>Domain Dashboard</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Domain Dashboard</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  sendEmailNotification,
  sendSMSNotification,
  generateDomainExpiryEmail,
  generateSSLExpiryEmail
};
