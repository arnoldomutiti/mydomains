/**
 * Email Templates for Domain Dashboard
 * Brand: domain-dashboard.com
 *
 * Professional HTML email templates with consistent branding
 */

// Brand Colors
const BRAND = {
  primary: '#0F766E',       // Main teal
  primaryLight: '#0D9488',  // Light teal
  primaryDark: '#065F59',   // Dark teal
  accent: '#2563eb',        // Blue for buttons/links
  accentHover: '#1d4ed8',   // Darker blue
  success: '#16a34a',       // Green
  warning: '#f59e0b',       // Amber
  danger: '#dc2626',        // Red
  textPrimary: '#111827',   // Dark text
  textSecondary: '#4b5563', // Gray text
  textMuted: '#9ca3af',     // Light gray text
  background: '#f3f4f6',    // Light gray bg
  cardBg: '#ffffff',        // White
  border: '#e5e7eb',        // Border color
  logoUrl: 'https://domain-dashboard.com/images/domain-dashboard-logo.png',
  website: 'https://domain-dashboard.com',
  supportEmail: 'info@domain-dashboard.com'
};

/**
 * Base email template wrapper
 */
function baseTemplate(content, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Domain Dashboard</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: ${BRAND.background};
    }
    a {
      color: ${BRAND.accent};
    }
    /* Mobile styles */
    @media screen and (max-width: 600px) {
      .mobile-padding {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .mobile-full-width {
        width: 100% !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.background}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Preheader text (hidden) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${BRAND.background};">
    <tr>
      <td align="center" style="padding: 40px 20px;">

        <!-- Main container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: ${BRAND.cardBg}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">

          <!-- Header with logo -->
          <tr>
            <td style="background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); padding: 30px 40px; text-align: center;">
              <img src="${BRAND.logoUrl}" alt="Domain Dashboard" width="50" height="50" style="display: inline-block; margin-bottom: 10px; border-radius: 8px;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                Domain Dashboard
              </h1>
            </td>
          </tr>

          <!-- Content area -->
          <tr>
            <td class="mobile-padding" style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${BRAND.background}; padding: 30px 40px; border-top: 1px solid ${BRAND.border};">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 10px 0; color: ${BRAND.textSecondary}; font-size: 14px;">
                      <a href="${BRAND.website}" style="color: ${BRAND.primary}; text-decoration: none; font-weight: 600;">domain-dashboard.com</a>
                    </p>
                    <p style="margin: 0 0 10px 0; color: ${BRAND.textMuted}; font-size: 12px;">
                      Your centralized domain management solution
                    </p>
                    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 12px;">
                      &copy; ${new Date().getFullYear()} Domain Dashboard. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Main container -->

        <!-- Unsubscribe link (optional) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
          <tr>
            <td align="center" style="padding: 20px;">
              <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 12px;">
                Questions? Contact us at <a href="mailto:${BRAND.supportEmail}" style="color: ${BRAND.textMuted};">${BRAND.supportEmail}</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
}

/**
 * Primary button component
 */
function primaryButton(text, url) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 8px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%);">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Secondary button component
 */
function secondaryButton(text, url) {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="border-radius: 8px; border: 2px solid ${BRAND.primary};">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 30px; color: ${BRAND.primary}; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Info box component
 */
function infoBox(content, type = 'info') {
  const colors = {
    info: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
    success: { bg: '#f0fdf4', border: '#bbf7d0', text: '#166534' },
    warning: { bg: '#fffbeb', border: '#fde68a', text: '#92400e' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' }
  };
  const color = colors[type] || colors.info;

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="background-color: ${color.bg}; border: 1px solid ${color.border}; border-radius: 8px; padding: 16px;">
          <p style="margin: 0; color: ${color.text}; font-size: 14px; line-height: 1.5;">
            ${content}
          </p>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Divider component
 */
function divider() {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        <td style="padding: 20px 0;">
          <hr style="border: none; border-top: 1px solid ${BRAND.border}; margin: 0;">
        </td>
      </tr>
    </table>
  `;
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Welcome Email - Sent after successful registration
 */
function welcomeEmail(userName) {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700; text-align: center;">
      Welcome to Domain Dashboard! 🎉
    </h2>

    <p style="margin: 0 0 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <p style="margin: 0 0 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Thank you for joining Domain Dashboard! We're excited to help you take control of your domain portfolio.
    </p>

    <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      With Domain Dashboard, you can:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px;">✓</span>
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Track all your domains in one place</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px;">✓</span>
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Get expiry alerts before it's too late</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px;">✓</span>
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Monitor SSL certificate status</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 12px 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="width: 40px; vertical-align: top;">
                <span style="display: inline-block; width: 28px; height: 28px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; text-align: center; line-height: 28px; color: #fff; font-size: 14px;">✓</span>
              </td>
              <td style="vertical-align: middle;">
                <p style="margin: 0; color: ${BRAND.textPrimary}; font-size: 15px; font-weight: 500;">Analyze website performance metrics</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div style="text-align: center; margin-bottom: 30px;">
      ${primaryButton('Go to Dashboard', BRAND.website)}
    </div>

    ${infoBox('💡 <strong>Pro Tip:</strong> Start by adding your first domain to get instant insights about its expiry date, SSL status, and performance scores.', 'info')}

    <p style="margin: 30px 0 0 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      If you have any questions, feel free to reach out to our support team.
    </p>

    <p style="margin: 20px 0 0 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Happy domain managing!<br>
      <strong style="color: ${BRAND.primary};">The Domain Dashboard Team</strong>
    </p>
  `;

  return baseTemplate(content, 'Welcome to Domain Dashboard! Start managing your domains today.');
}

/**
 * Email Verification (OTP) Template
 */
function verificationEmail(otpCode, expiryMinutes = 10) {
  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">🔐</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        Verify Your Email
      </h2>

      <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
        Enter this code to complete your registration
      </p>
    </div>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
      <tr>
        <td align="center">
          <div style="display: inline-block; background-color: ${BRAND.background}; border: 2px dashed ${BRAND.primary}; border-radius: 12px; padding: 20px 40px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: ${BRAND.primary}; font-family: 'Courier New', monospace;">
              ${otpCode}
            </span>
          </div>
        </td>
      </tr>
    </table>

    ${infoBox(`⏱️ This code will expire in <strong>${expiryMinutes} minutes</strong>. If you didn't request this code, please ignore this email.`, 'warning')}

    ${divider()}

    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.6; text-align: center;">
      If you're having trouble, copy and paste this code directly into the verification field on our website.
    </p>
  `;

  return baseTemplate(content, `Your verification code is ${otpCode}. Valid for ${expiryMinutes} minutes.`);
}

/**
 * Password Reset Email Template
 */
function passwordResetEmail(resetLink, userName, expiryMinutes = 30) {
  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.warning} 0%, #fbbf24 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">🔑</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        Reset Your Password
      </h2>
    </div>

    <p style="margin: 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      We received a request to reset your password for your Domain Dashboard account. Click the button below to create a new password:
    </p>

    <div style="text-align: center; margin-bottom: 30px;">
      ${primaryButton('Reset Password', resetLink)}
    </div>

    ${infoBox(`⏱️ This link will expire in <strong>${expiryMinutes} minutes</strong>. After that, you'll need to request a new password reset.`, 'warning')}

    ${divider()}

    <p style="margin: 0 0 15px 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>

    <p style="margin: 0 0 20px 0; word-break: break-all;">
      <a href="${resetLink}" style="color: ${BRAND.accent}; font-size: 13px;">${resetLink}</a>
    </p>

    ${infoBox('🛡️ <strong>Security Notice:</strong> If you didn\'t request this password reset, please ignore this email. Your password will remain unchanged.', 'info')}
  `;

  return baseTemplate(content, 'Reset your Domain Dashboard password');
}

/**
 * Domain Expiry Alert Email Template
 */
function domainExpiryEmail(domains, userName) {
  const domainRows = domains.map(domain => `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border};">
        <strong style="color: ${BRAND.textPrimary};">${domain.name}</strong>
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border}; text-align: center;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; ${getDaysStyle(domain.daysRemaining)}">
          ${domain.daysRemaining} days
        </span>
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border}; text-align: right; color: ${BRAND.textSecondary};">
        ${domain.expiryDate}
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.warning} 0%, #fbbf24 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">⚠️</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        Domain Expiry Alert
      </h2>

      <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
        ${domains.length} domain${domains.length > 1 ? 's are' : ' is'} expiring soon
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <p style="margin: 0 0 25px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      The following domain${domains.length > 1 ? 's require' : ' requires'} your attention:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; border: 1px solid ${BRAND.border}; border-radius: 8px; overflow: hidden;">
      <tr style="background-color: ${BRAND.background};">
        <th style="padding: 12px 15px; text-align: left; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Domain</th>
        <th style="padding: 12px 15px; text-align: center; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Time Left</th>
        <th style="padding: 12px 15px; text-align: right; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Expiry Date</th>
      </tr>
      ${domainRows}
    </table>

    <div style="text-align: center; margin-bottom: 30px;">
      ${primaryButton('View All Domains', BRAND.website)}
    </div>

    ${infoBox('💡 <strong>Tip:</strong> Renew your domains early to avoid any service interruptions or risk of losing them.', 'info')}
  `;

  return baseTemplate(content, `Alert: ${domains.length} domain${domains.length > 1 ? 's' : ''} expiring soon`);
}

/**
 * SSL Certificate Expiry Alert Email Template
 */
function sslExpiryEmail(certificates, userName) {
  const certRows = certificates.map(cert => `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border};">
        <strong style="color: ${BRAND.textPrimary};">${cert.domain}</strong>
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border}; text-align: center;">
        <span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; ${getDaysStyle(cert.daysRemaining)}">
          ${cert.daysRemaining} days
        </span>
      </td>
      <td style="padding: 12px 15px; border-bottom: 1px solid ${BRAND.border}; text-align: right; color: ${BRAND.textSecondary};">
        ${cert.expiryDate}
      </td>
    </tr>
  `).join('');

  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.danger} 0%, #ef4444 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">🔒</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        SSL Certificate Alert
      </h2>

      <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
        ${certificates.length} certificate${certificates.length > 1 ? 's are' : ' is'} expiring soon
      </p>
    </div>

    <p style="margin: 0 0 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <p style="margin: 0 0 25px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      The following SSL certificate${certificates.length > 1 ? 's require' : ' requires'} renewal:
    </p>

    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px; border: 1px solid ${BRAND.border}; border-radius: 8px; overflow: hidden;">
      <tr style="background-color: ${BRAND.background};">
        <th style="padding: 12px 15px; text-align: left; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Domain</th>
        <th style="padding: 12px 15px; text-align: center; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Time Left</th>
        <th style="padding: 12px 15px; text-align: right; color: ${BRAND.textSecondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Expiry Date</th>
      </tr>
      ${certRows}
    </table>

    <div style="text-align: center; margin-bottom: 30px;">
      ${primaryButton('View SSL Status', BRAND.website)}
    </div>

    ${infoBox('🛡️ <strong>Important:</strong> Expired SSL certificates will cause browsers to show security warnings, which can damage your site\'s reputation and user trust.', 'danger')}
  `;

  return baseTemplate(content, `Alert: ${certificates.length} SSL certificate${certificates.length > 1 ? 's' : ''} expiring soon`);
}

/**
 * General Notification Email Template
 */
function notificationEmail(title, message, actionText = null, actionUrl = null, type = 'info') {
  const icons = {
    info: { emoji: 'ℹ️', gradient: `linear-gradient(135deg, ${BRAND.accent} 0%, #60a5fa 100%)` },
    success: { emoji: '✅', gradient: `linear-gradient(135deg, ${BRAND.success} 0%, #22c55e 100%)` },
    warning: { emoji: '⚠️', gradient: `linear-gradient(135deg, ${BRAND.warning} 0%, #fbbf24 100%)` },
    error: { emoji: '❌', gradient: `linear-gradient(135deg, ${BRAND.danger} 0%, #ef4444 100%)` }
  };
  const icon = icons[type] || icons.info;

  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: ${icon.gradient}; border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">${icon.emoji}</span>
      </div>

      <h2 style="margin: 0 0 20px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        ${title}
      </h2>
    </div>

    <div style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      ${message}
    </div>

    ${actionText && actionUrl ? `
      <div style="text-align: center; margin-bottom: 20px;">
        ${primaryButton(actionText, actionUrl)}
      </div>
    ` : ''}
  `;

  return baseTemplate(content, title);
}

/**
 * Account Deactivation Warning Email
 */
function accountWarningEmail(userName, daysRemaining, reason = 'inactivity') {
  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.danger} 0%, #ef4444 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">⚠️</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        Account Action Required
      </h2>
    </div>

    <p style="margin: 20px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <p style="margin: 0 0 25px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Your Domain Dashboard account will be deactivated in <strong style="color: ${BRAND.danger};">${daysRemaining} days</strong> due to ${reason}.
    </p>

    ${infoBox('To keep your account active and retain all your domain tracking data, simply log in to your account.', 'warning')}

    <div style="text-align: center; margin: 30px 0;">
      ${primaryButton('Log In Now', BRAND.website)}
    </div>

    <p style="margin: 0; color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.6; text-align: center;">
      If you no longer wish to use Domain Dashboard, you can ignore this email and your account will be automatically deactivated.
    </p>
  `;

  return baseTemplate(content, `Your Domain Dashboard account requires attention`);
}

/**
 * Weekly Summary Email Template
 */
function weeklySummaryEmail(userName, stats) {
  const content = `
    <div style="text-align: center;">
      <div style="display: inline-block; width: 70px; height: 70px; background: linear-gradient(135deg, ${BRAND.primary} 0%, ${BRAND.primaryLight} 100%); border-radius: 50%; margin-bottom: 20px;">
        <span style="display: block; line-height: 70px; font-size: 32px;">📊</span>
      </div>

      <h2 style="margin: 0 0 10px 0; color: ${BRAND.textPrimary}; font-size: 28px; font-weight: 700;">
        Your Weekly Summary
      </h2>

      <p style="margin: 0 0 30px 0; color: ${BRAND.textSecondary}; font-size: 16px;">
        Here's how your domains are doing
      </p>
    </div>

    <p style="margin: 0 0 25px 0; color: ${BRAND.textSecondary}; font-size: 16px; line-height: 1.6;">
      Hi ${userName || 'there'},
    </p>

    <!-- Stats Grid -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 30px;">
      <tr>
        <td width="50%" style="padding: 10px;">
          <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: 700; color: ${BRAND.primary};">${stats.totalDomains || 0}</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">Total Domains</p>
          </div>
        </td>
        <td width="50%" style="padding: 10px;">
          <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: 700; color: ${BRAND.success};">${stats.healthyDomains || 0}</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">Healthy</p>
          </div>
        </td>
      </tr>
      <tr>
        <td width="50%" style="padding: 10px;">
          <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: 700; color: ${BRAND.warning};">${stats.expiringSoon || 0}</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">Expiring Soon</p>
          </div>
        </td>
        <td width="50%" style="padding: 10px;">
          <div style="background-color: ${BRAND.background}; border-radius: 12px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 32px; font-weight: 700; color: ${BRAND.danger};">${stats.sslIssues || 0}</p>
            <p style="margin: 0; font-size: 14px; color: ${BRAND.textSecondary};">SSL Issues</p>
          </div>
        </td>
      </tr>
    </table>

    ${stats.expiringSoon > 0 ? infoBox(`⚠️ You have <strong>${stats.expiringSoon}</strong> domain${stats.expiringSoon > 1 ? 's' : ''} expiring within 30 days. Review them now to avoid service interruption.`, 'warning') : infoBox('✅ All your domains are in good standing. Keep up the great work!', 'success')}

    <div style="text-align: center; margin: 30px 0;">
      ${primaryButton('View Dashboard', BRAND.website)}
    </div>
  `;

  return baseTemplate(content, `Your weekly domain summary is ready`);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get styling for days remaining badge
 */
function getDaysStyle(days) {
  if (days <= 7) {
    return `background-color: #fef2f2; color: ${BRAND.danger};`;
  } else if (days <= 30) {
    return `background-color: #fffbeb; color: #b45309;`;
  } else {
    return `background-color: #f0fdf4; color: ${BRAND.success};`;
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Brand constants
  BRAND,

  // Templates
  welcomeEmail,
  verificationEmail,
  passwordResetEmail,
  domainExpiryEmail,
  sslExpiryEmail,
  notificationEmail,
  accountWarningEmail,
  weeklySummaryEmail,

  // Components (for custom templates)
  baseTemplate,
  primaryButton,
  secondaryButton,
  infoBox,
  divider
};
