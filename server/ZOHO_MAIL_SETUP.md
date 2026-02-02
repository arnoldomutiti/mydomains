# Zoho Mail SMTP Setup for Email Verification

This guide explains how to configure Zoho Mail SMTP for sending OTP verification emails in Domain Dashboard.

---

## Required Environment Variables

Add these to your `server/.env` file:

```env
# Zoho Mail Configuration
EMAIL_SERVICE=zoho
EMAIL_USER=info@domain-dashboard.com
EMAIL_PASSWORD=your_zoho_app_password

# Optional: Custom SMTP settings (defaults shown)
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465
```

---

## Step-by-Step Setup

### Step 1: Log into Zoho Mail

1. Go to [mail.zoho.com](https://mail.zoho.com)
2. Sign in with your account: `info@domain-dashboard.com`

### Step 2: Generate App Password

Since Zoho requires app-specific passwords for third-party apps:

1. Go to [accounts.zoho.com](https://accounts.zoho.com)
2. Click on **Security** in the left sidebar
3. Scroll down to **App Passwords**
4. Click **Generate New Password**
5. Enter a name like `Domain Dashboard SMTP`
6. Copy the generated password (you won't see it again!)

### Step 3: Update Environment Variables

Edit your `server/.env` file:

```env
EMAIL_SERVICE=zoho
EMAIL_USER=info@domain-dashboard.com
EMAIL_PASSWORD=paste_your_app_password_here
```

### Step 4: Restart the Server

```bash
cd server
npm run dev
```

---

## Zoho SMTP Settings Reference

| Setting | Value |
|---------|-------|
| SMTP Server | smtp.zoho.com |
| Port (SSL) | 465 |
| Port (TLS) | 587 |
| Authentication | Required |
| Username | info@domain-dashboard.com |
| Password | App-specific password |

---

## Testing Email Configuration

### Method 1: Try Registration

1. Start the server and frontend
2. Go to Sign Up page
3. Enter test details and click "Create Account"
4. Check if OTP email is received

### Method 2: Server Logs

Watch the server console for email logs:

```
[OTP] Sent OTP to test@example.com
[Email] Sent to test@example.com: <message-id>
```

---

## Troubleshooting

### Error: "Email not configured"

**Cause:** Missing `EMAIL_USER` or `EMAIL_PASSWORD` in `.env`

**Fix:** Ensure both are set in `server/.env`

### Error: "Invalid login" or "Authentication failed"

**Cause:** Using regular password instead of app password

**Fix:**
1. Go to Zoho Account Security
2. Generate a new App Password
3. Use that password in `EMAIL_PASSWORD`

### Error: "Connection timeout"

**Cause:** Firewall blocking port 465 or wrong SMTP host

**Fix:**
- Check if port 465 is open
- Verify `ZOHO_SMTP_HOST=smtp.zoho.com`
- Try port 587 with TLS:
  ```env
  ZOHO_SMTP_PORT=587
  ```

### Error: "Self-signed certificate"

**Cause:** SSL/TLS certificate issue

**Fix:** The code already handles this with `secure: true` for port 465

### OTP Not Received

1. **Check spam folder**
2. **Verify email address** is correct
3. **Check server logs** for errors
4. **Test with a different email** provider

---

## Email Template Preview

The OTP email sent to users looks like this:

```
Subject: Verify Your Email - Domain Dashboard

┌─────────────────────────────────────┐
│     🔐 Email Verification           │
│     (Teal gradient header)          │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│                                     │
│  Hello [Name]!                      │
│                                     │
│  Thank you for signing up for       │
│  Domain Dashboard. To complete      │
│  your registration, please verify   │
│  your email address.                │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Your verification code is: │   │
│  │                             │   │
│  │       1 2 3 4 5 6           │   │
│  │                             │   │
│  │  Expires in 10 minutes      │   │
│  └─────────────────────────────┘   │
│                                     │
│  If you didn't request this code,   │
│  please ignore this email.          │
│                                     │
│  © 2024 Domain Dashboard            │
│                                     │
└─────────────────────────────────────┘
```

---

## Security Notes

1. **Never commit `.env` to git** - It's already in `.gitignore`
2. **Use App Passwords** - Don't use your main Zoho password
3. **OTPs expire** - After 10 minutes for security
4. **Rate limiting** - Consider adding rate limiting in production

---

## Alternative: Zoho Regions

If your Zoho account is in a different region:

| Region | SMTP Host |
|--------|-----------|
| Global | smtp.zoho.com |
| EU | smtp.zoho.eu |
| India | smtp.zoho.in |
| Australia | smtp.zoho.com.au |
| Japan | smtp.zoho.jp |

Update `ZOHO_SMTP_HOST` accordingly:

```env
ZOHO_SMTP_HOST=smtp.zoho.eu
```

---

## Complete .env Example

```env
# Server Configuration
PORT=5000
JWT_SECRET=your_secure_jwt_secret_here

# API Keys
WHOXY_API_KEY=your_whoxy_api_key
PAGESPEED_API_KEY=your_google_pagespeed_api_key

# Zoho Mail Configuration
EMAIL_SERVICE=zoho
EMAIL_USER=info@domain-dashboard.com
EMAIL_PASSWORD=your_zoho_app_password
ZOHO_SMTP_HOST=smtp.zoho.com
ZOHO_SMTP_PORT=465

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Twilio SMS (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Need Help?

- Zoho Mail Support: [help.zoho.com/portal/en/kb/mail](https://help.zoho.com/portal/en/kb/mail)
- Zoho SMTP Docs: [help.zoho.com/portal/en/kb/mail/pop-imap-and-smtp](https://help.zoho.com/portal/en/kb/mail/pop-imap-and-smtp)

---

**Status:** Ready to use
**Email:** info@domain-dashboard.com
**SMTP Host:** smtp.zoho.com
**Port:** 465 (SSL)
