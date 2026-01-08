# Email & SMS Notification Setup Guide

This guide will help you configure email and SMS notifications for your Domain Dashboard application.

## Overview

The Domain Dashboard now supports:
- **Email Notifications** - Receive alerts via email
- **SMS Notifications** - Receive alerts via text message
- **Automated Daily Checks** - Runs every day at 9 AM
- **SSL Certificate Expiry Alerts** - Get notified when SSL certificates are expiring
- **Domain Expiry Alerts** - Get notified when domains are expiring

## What Gets Monitored?

### Domain Expiry
- Domains expiring within 30 days
- Already expired domains

### SSL Certificate Expiry
- SSL certificates expiring within 30 days
- Urgent alerts for certificates expiring within 7 days
- Already expired SSL certificates

## Setup Instructions

### Step 1: Email Notifications (Gmail Example)

#### Option A: Using Gmail App Password (Recommended)

1. **Enable 2-Factor Authentication** on your Google Account:
   - Go to [https://myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create an App Password**:
   - Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Name it "Domain Dashboard"
   - Click "Generate"
   - Copy the 16-character password

3. **Update `.env` file**:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your.email@gmail.com
   EMAIL_PASSWORD=your_16_char_app_password
   ```

#### Option B: Using Other Email Providers

**For Outlook/Hotmail**:
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
```

**For Custom SMTP**:
```env
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@yourdomain.com
EMAIL_PASSWORD=your_password
```

### Step 2: SMS Notifications (Twilio)

1. **Sign up for Twilio**:
   - Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
   - Create a free account (includes $15 trial credit)

2. **Get your credentials**:
   - Go to [https://console.twilio.com/](https://console.twilio.com/)
   - Find your **Account SID** and **Auth Token**

3. **Get a phone number**:
   - In Twilio Console, go to Phone Numbers → Buy a Number
   - Choose a number with SMS capabilities
   - Copy your Twilio phone number (format: +1234567890)

4. **Update `.env` file**:
   ```env
   TWILIO_ACCOUNT_SID=your_account_sid_here
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Step 3: Restart Your Server

After updating the `.env` file, restart your backend server:

```bash
cd server
npm run dev
```

You should see:
```
Server running on port 5000
[Cron] Daily notification job scheduled for 9 AM
```

## Testing Notifications

### Via Frontend (Coming Soon)
The notification settings page will include test buttons for both email and SMS.

### Via API

**Test Email**:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type": "email"}'
```

**Test SMS**:
```bash
curl -X POST http://localhost:5000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"type": "sms"}'
```

## How It Works

### Automatic Daily Checks (9 AM)

The system runs a cron job every day at 9 AM that:

1. **Checks all users** with notifications enabled
2. **Scans their domains** for:
   - Domain expiry dates
   - SSL certificate expiry dates
3. **Sends notifications** if:
   - Any domain expires within 30 days
   - Any SSL certificate expires within 30 days
4. **Email format**:
   - Professional HTML email with table of expiring items
   - Separate emails for domain and SSL expiry
5. **SMS format**:
   - Summary message with total count
   - Directs user to check email for details

### Real-time Notifications

The notification dropdown in the app shows:
- Domain expiry warnings (30 days or less)
- SSL expiry warnings (30 days or less)
- Urgent badges for expired items

## Notification Preferences

Users can control:
- ✅ **Email Notifications** - On/Off
- ✅ **SMS Notifications** - On/Off
- 📱 **Phone Number** - For SMS alerts

Default settings:
- Email notifications: **Enabled**
- SMS notifications: **Disabled** (requires phone number)

## Troubleshooting

### Email Not Sending

**Gmail "Less secure app" error**:
- Solution: Use App Password (see Step 1)

**"Invalid credentials" error**:
- Check EMAIL_USER and EMAIL_PASSWORD in `.env`
- Make sure there are no extra spaces
- For Gmail, use App Password, not your regular password

**"Connection refused" error**:
- Check EMAIL_SERVICE is correct
- Try EMAIL_PORT=587 or EMAIL_PORT=465

### SMS Not Sending

**"Account not found" error**:
- Verify TWILIO_ACCOUNT_SID is correct
- Check for typos or extra spaces

**"Invalid phone number" error**:
- Phone numbers must include country code: +1234567890
- No spaces or dashes

**"Unverified number" error (Trial accounts)**:
- Twilio trial accounts can only send to verified numbers
- Verify your phone in Twilio Console → Phone Numbers → Verified Caller IDs

### Cron Job Not Running

**Check server logs**:
- You should see: `[Cron] Daily notification job scheduled for 9 AM`
- At 9 AM, you should see: `[Cron] Running scheduled notification check...`

**Test immediately** (for development):
Change the cron schedule in `server.js`:
```javascript
// Run every minute for testing
cron.schedule('* * * * *', async () => {
```

## Security Notes

- Never commit `.env` file to version control
- Keep your Twilio Auth Token secret
- Use App Passwords for email instead of main password
- In production, use environment variables

## Cost Information

### Email (Gmail)
- **Free** - No cost for personal use

### SMS (Twilio)
- **Trial**: $15 credit (can send ~500-750 SMS)
- **Paid**: $0.0075 - $0.02 per SMS depending on country
- Monthly cost estimate: $1-5 for typical usage

## Advanced Configuration

### Custom Notification Schedule

Edit `server/server.js` to change when notifications run:

```javascript
// Every day at 9 AM (default)
cron.schedule('0 9 * * *', async () => {

// Every day at 6 PM
cron.schedule('0 18 * * *', async () => {

// Twice daily (9 AM and 6 PM)
cron.schedule('0 9,18 * * *', async () => {

// Every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
```

### Custom Expiry Thresholds

Change when notifications are sent (default: 30 days):

In `server.js`, line ~437 and ~476:
```javascript
// Default: 30 days
if (diffDays <= 30 && diffDays > 0)

// Change to 60 days
if (diffDays <= 60 && diffDays > 0)

// Change to 7 days (1 week)
if (diffDays <= 7 && diffDays > 0)
```

## Support

For issues:
- Check the logs in your terminal
- Verify all credentials in `.env`
- Test with the test endpoints first
- Check Twilio/Gmail console for delivery status

## Next Steps

1. Configure your email/SMS credentials
2. Restart the server
3. Test notifications using the test endpoints
4. Wait for 9 AM or modify cron schedule for immediate testing
5. Check your email/phone for test notifications

---

**Note**: The frontend notification settings UI is under development and will be available soon for easier configuration!
