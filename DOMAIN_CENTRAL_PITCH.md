# Domain Central

**Never lose a domain again.**

Domain Central is a powerful domain portfolio management platform that automatically tracks WHOIS data, SSL certificates, and expiration dates for all your domains in one clean dashboard.

---

## What It Does

Domain Central monitors your entire domain portfolio 24/7 and alerts you before anything expires. Add any domain once, and we'll:

- **Track expiration dates** automatically via WHOIS data
- **Monitor SSL certificates** and renewal deadlines
- **Send notifications** 30 days before domains or certificates expire
- **Check website performance** with PageSpeed metrics
- **Organize everything** in a beautiful, searchable dashboard

---

## The Problem

Domain owners face constant risks:
- **Lost domains**: Forgetting renewal dates means losing valuable assets
- **Security gaps**: Expired SSL certificates expose users to threats
- **Scattered data**: Checking registrars, SSL status, and performance across multiple platforms
- **No visibility**: Manual tracking spreadsheets that quickly become outdated

**One missed renewal can cost thousands in recovery fees or permanent domain loss.**

---

## The Solution

Domain Central consolidates everything into one platform:

### 🎯 Intelligent Tracking
Add domains in bulk and get instant WHOIS data including registrar, creation date, expiry date, and status. Our cache system serves data for popular domains instantly.

### 🔔 Smart Notifications
Automated daily checks at 9 AM send email and SMS alerts for:
- Domains expiring in 30 days
- SSL certificates expiring in 30 days
- Already expired assets (urgent warnings)

### 📊 Complete Visibility
See your entire portfolio at a glance:
- Sort by expiry date, registrar, or SSL status
- Filter by expiration windows (30/60/90 days)
- Search across all domain names and registrars
- View detailed WHOIS data, contact info, and nameservers

### 🔒 Security Insights
Real-time SSL certificate validation shows:
- Certificate issuer and validity period
- Days remaining until expiration
- Certificate fingerprint and technical details

### ⚡ Performance Monitoring
Google PageSpeed integration tracks Core Web Vitals:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Speed Index with color-coded scores

---

## Who It's For

**Domain Investors**: Manage portfolios of 10-10,000+ domains without spreadsheets

**Agencies & Freelancers**: Track client domains and never miss a renewal deadline

**Business Owners**: Protect your brand by monitoring all company domains in one place

**Developers**: Monitor SSL certificates and performance metrics for your projects

**Security Teams**: Ensure all corporate domains maintain valid SSL certificates

---

## Key Features

### 📦 Instant Data for Popular Sites
Pre-cached WHOIS data for the top 50 websites (Google, Facebook, Amazon, etc.) loads in <100ms instead of 2-5 seconds.

### 🔐 Secure & Private
- Google OAuth or email/password authentication
- Multi-tenant architecture with complete data isolation
- JWT tokens with 24-hour expiry
- Secure password hashing (bcryptjs)

### 📧 Flexible Notifications
- Email alerts (Gmail, Outlook, custom SMTP)
- SMS alerts via Twilio integration
- Customizable per-user settings
- Test notification buttons to verify setup

### 💾 Import & Export
- Bulk import from CSV/Excel files
- Export your entire portfolio with one click
- Duplicate detection prevents errors

### 🎨 Beautiful Experience
- Dark/light mode with persistent preference
- Responsive design (desktop, tablet, mobile)
- Real-time search with instant results
- Clean, modern interface

---

## How It Works

### 1. **Add Your Domains**
Import domains individually, in bulk, or via CSV. Domain Central fetches WHOIS data automatically using the Whoxy API.

### 2. **Set Up Notifications**
Configure email and SMS alerts in settings. Test them instantly to ensure they work.

### 3. **Monitor Dashboard**
View your portfolio sorted by urgency. The notification bell shows how many domains need attention.

### 4. **Get Alerted**
Receive automated emails/texts 30 days before expiration. Never miss another renewal deadline.

### 5. **Take Action**
Click through to your registrar or view detailed WHOIS data to renew before it's too late.

---

## Technical Stack

**Frontend**: React 19.2.3, Lucide Icons, XLSX for Excel import/export

**Backend**: Node.js, Express, SQLite with multi-tenant support

**APIs**: Whoxy (WHOIS data), Google PageSpeed Insights, Logo.dev (registrar logos)

**Notifications**: Nodemailer (email), Twilio (SMS), node-cron (daily automation)

**Authentication**: JWT tokens, Google OAuth 2.0, bcryptjs password hashing

---

## What Makes It Different

### ⚡ Speed
Cached data for popular domains loads instantly. Advanced filtering and search return results in milliseconds.

### 🧠 Intelligence
Smart notifications filter out top 50 domains (Google, Facebook, etc.) that don't need monitoring. Get alerts that actually matter.

### 🎯 Simplicity
One dashboard for WHOIS, SSL, and performance. No switching between registrar dashboards or third-party tools.

### 🔒 Privacy
Your data stays yours. Multi-tenant architecture ensures complete isolation between users.

### 💰 Cost-Effective
Self-hosted solution with no per-domain fees. Use your own API keys and notification services.

---

## Quick Start

```bash
# Install dependencies
npm install
cd server && npm install

# Configure API keys in server/.env
WHOXY_API_KEY=your_key_here
PAGESPEED_API_KEY=your_key_here

# Start backend and frontend
cd server && npm run dev
npm start
```

Open `http://localhost:3000` and start adding domains.

---

## Real-World Impact

**Before Domain Central**:
- Sarah lost a $5,000 domain because it expired while she was traveling
- Mike's e-commerce site lost customer trust when his SSL certificate expired
- TechCorp managed 200+ domains across 8 registrars using outdated spreadsheets

**After Domain Central**:
- Sarah gets SMS alerts 30 days before expiration, even when offline
- Mike receives email warnings and renewed his SSL with 2 weeks to spare
- TechCorp sees all 200 domains in one dashboard, sorted by urgency

---

## Security & Reliability

✅ **Automated Daily Checks**: Cron job runs at 9 AM every day to check all domains

✅ **Multi-Channel Alerts**: Email AND SMS ensure you never miss critical notifications

✅ **Cache System**: Top 50 domains cached daily at 8 AM for instant access

✅ **Data Isolation**: Each user's domains are completely separate and secure

✅ **Password Security**: Industry-standard bcrypt hashing with salt rounds

✅ **Token Expiry**: 24-hour JWT tokens prevent unauthorized long-term access

---

## Use Cases

### Domain Portfolio Management
Track hundreds or thousands of domains across multiple registrars. Sort by expiry date to prioritize renewals.

### Client Domain Tracking
Agencies and freelancers can monitor client domains to provide proactive renewal reminders and maintain relationships.

### Brand Protection
Ensure all company domains stay active and secure. Monitor SSL certificates for customer-facing websites.

### Development Projects
Track domains, SSL certificates, and performance metrics for all your side projects or client work.

### Domain Investment
Manage acquisition dates, expiry tracking, and registrar information for domain portfolios worth thousands of dollars.

---

## Pricing Model

**Free & Open Source**: Self-hosted solution with no licensing fees

**Your API Keys**: Bring your own Whoxy and PageSpeed API keys

**Your Infrastructure**: Host on your own server or cloud provider

**Optional Services**: Email (free with Gmail) and SMS (Twilio pay-as-you-go)

---

## Get Started

1. Clone the repository
2. Add your API keys to `server/.env`
3. Run `npm install` and `npm start`
4. Add your first domain
5. Set up notifications
6. Never lose a domain again

---

## Support & Documentation

📚 **Full README**: Detailed setup and API documentation

📖 **Technical Docs**: Cache system, notification setup, database schema

🛠️ **Troubleshooting**: Common issues and solutions

🚀 **Quick Start**: Get running in under 5 minutes

---

**Domain Central: One dashboard. All your domains. Zero missed renewals.**

---

*Built with React and Node.js. Open source and self-hosted for complete control and privacy.*
