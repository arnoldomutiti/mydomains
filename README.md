# Domain Dashboard

A modern, full-stack web application for managing and monitoring domain portfolios. Track WHOIS data, SSL certificates, domain expiration dates, registrar information, and website performance metrics all in one place. Features automated email & SMS notifications, Google OAuth integration, advanced filtering, and comprehensive domain management tools.

![Domain Dashboard](https://img.shields.io/badge/React-19.2.3-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![SQLite](https://img.shields.io/badge/Database-SQLite-lightgrey)

## Features

### 🔐 Authentication & User Management
- **Email/Password Authentication**: Secure registration and login with JWT tokens
- **Google OAuth Integration**: One-click sign-in with Google accounts
- **Multi-tenant Architecture**: Complete data isolation per user
- **Session Management**: 24-hour token expiry with secure password hashing (bcryptjs)
- **Password Strength Validation**: Real-time password validation during registration

### 📧 Automated Notifications
- **Email Notifications**: Receive domain and SSL expiry alerts via email (Gmail, Outlook, Custom SMTP)
- **SMS Notifications**: Text message alerts via Twilio integration
- **Scheduled Daily Checks**: Automated cron job runs every day at 9 AM
- **Smart Alerts**:
  - Domain expiry warnings (30 days advance)
  - SSL certificate expiry notifications (30 days advance)
  - Urgent badges for expired items
- **Test Notifications**: Built-in test buttons to verify email/SMS configuration
- **Customizable Settings**: Toggle notifications on/off per user

### 🎯 Domain Management
- **Bulk Domain Import**: Add multiple domains at once (unlimited)
- **CSV/Excel Import**: Import domains from spreadsheets
- **CSV/Excel Export**: Export your domain portfolio with all details
- **Duplicate Detection**: Prevents adding the same domain twice
- **Quick Add Button**: Fast domain addition from top navigation
- **WHOIS Data Integration**: Automatic fetching of domain registration details via Whoxy API
- **Domain Tracking**: Monitor creation dates, expiry dates, and domain status
- **Registrar Information**: View registrar details with clickable logos
- **Delete Domains**: Easy removal of domains with confirmation dialog
- **Real-time Search**: Instant search across domain names, registrars, and status

### 🔍 Advanced Filtering & Sorting
- **Domain Expiry Filters**:
  - All Domains
  - Expiring in 30 days
  - Expiring in 60 days
  - Expiring in 90 days
  - Expired only
- **SSL Certificate Filters**:
  - All Certificates
  - Expiring in 30 days
  - Valid (30+ days)
  - Expired
- **Sorting Options**:
  - Registrar (A-Z or Z-A)
  - Expiry Date (Soonest or Latest)
  - SSL Expiry (Soonest first)
- **Filter Indicators**: Visual feedback when filters are active
- **Reset Filters**: One-click reset to default view

### 🔒 Security & Performance Monitoring
- **SSL Certificate Checking**: Real-time SSL certificate validation and expiry monitoring
- **SSL Details**: View issuer, validity period, days remaining, and certificate fingerprint
- **PageSpeed Insights**: Mobile performance metrics (FCP, LCP, CLS, Speed Index)
- **Performance Scoring**: Visual score indicators with color coding
- **Domain Status Tracking**: Monitor active, expired, and expiring domains
- **Notification Dropdown**: Quick access to all expiring domains and SSL certificates

### 🎨 User Experience
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Empty States**: Helpful prompts when no domains exist or search returns no results
- **Loading States**: Progress indicators during domain addition and data fetching
- **Error Handling**: Clear error messages and retry options
- **Detailed Domain View**: Comprehensive domain information including:
  - Registrant, Administrative, and Technical contacts
  - Name servers with copy functionality
  - Domain status and security settings (DNSSEC)
  - SSL certificate details with renewal alerts
  - Performance metrics with visualization
  - WHOIS raw data access

### 🔗 External Tools Integration
Quick access to popular security and analysis tools:
- SSL Labs Test
- VirusTotal
- Shodan
- PageSpeed Insights
- Web Check
- Internet Archive
- URLScan
- Sucuri SiteCheck

## Tech Stack

### Frontend
- **React 19.2.3** - UI framework
- **Lucide React** - Icon library for beautiful UI elements
- **XLSX (SheetJS)** - Excel/CSV import and export
- **Create React App** - Build tooling

### Backend
- **Node.js + Express** - Server framework
- **SQLite3** - Lightweight database with multi-tenant support
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Secure password hashing
- **Passport.js** - Authentication middleware
- **passport-google-oauth20** - Google OAuth strategy
- **Axios** - HTTP client for API calls
- **node-cron** - Scheduled task automation
- **Nodemailer** - Email notification service
- **Twilio** - SMS notification service
- **express-session** - Session management

### External APIs
- **Whoxy API** - Comprehensive WHOIS data lookups
- **Google PageSpeed Insights API** - Performance and Core Web Vitals metrics
- **Logo.dev** - Automatic registrar logo fetching
- **Google OAuth 2.0** - Social authentication

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd domain-dashboard
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure environment variables**

   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   JWT_SECRET=your_secret_key_here

   # API Keys
   WHOXY_API_KEY=your_whoxy_api_key_here
   PAGESPEED_API_KEY=your_google_pagespeed_api_key_here

   # Google OAuth (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here

   # Email Notifications (Optional - Gmail example)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_email_password_or_app_password

   # SMS Notifications (Optional - Twilio)
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

   **Get API Keys:**
   - **Whoxy API** (Required): [https://www.whoxy.com/](https://www.whoxy.com/)
   - **PageSpeed API** (Required): [https://developers.google.com/speed/docs/insights/v5/get-started](https://developers.google.com/speed/docs/insights/v5/get-started)
   - **Google OAuth** (Optional): [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - **Twilio SMS** (Optional): [https://www.twilio.com/console](https://www.twilio.com/console)

   **Note**: Email and SMS notifications are optional. The app works fully without them, but you won't receive automated expiry alerts. See [NOTIFICATION_SETUP.md](server/NOTIFICATION_SETUP.md) for detailed setup instructions.

5. **Start the application**

   Open two terminal windows:

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm start
   ```

6. **Access the application**

   Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
domain-dashboard/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/                    # React frontend
│   ├── App.js             # Main application component
│   ├── App.css            # Application styles
│   ├── index.js           # React entry point
│   └── index.css          # Global styles
├── server/                # Node.js backend
│   ├── server.js          # Express server
│   ├── database.js        # SQLite configuration
│   ├── database.sqlite    # SQLite database
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── package.json           # Frontend dependencies
└── README.md             # Project documentation
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Domains
- `GET /api/domains` - Fetch user's domains (authenticated)
- `POST /api/domains` - Add new domain (authenticated)
- `DELETE /api/domains/:id` - Delete domain (authenticated)

### External Data
- `GET /api/whois/:domain` - Fetch WHOIS data
- `GET /api/ssl/:domain` - Check SSL certificate status
- `GET /api/pagespeed/:domain` - Fetch PageSpeed metrics

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
)
```

### Domains Table
```sql
CREATE TABLE domains (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT,
    created_date TEXT,
    expiry_date TEXT,
    registrar TEXT,
    status TEXT,
    full_details TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
)
```

## Usage

### Adding Domains
1. Click "Add New Domain" button
2. Enter domain names (up to 5 at once)
3. Press Enter or click "Add Another Domain" for multiple entries
4. Click "Add Domains" to import

The system will:
- Fetch WHOIS data from Whoxy API
- Extract registrar, creation date, expiry date
- Store domain details in the database
- Display success/error status for each domain

### Viewing Domain Details
1. Click "View Details" on any domain card
2. View comprehensive information including:
   - WHOIS data
   - SSL certificate status
   - PageSpeed performance metrics
   - Contact information
   - Name servers

### Monitoring Expiring Domains
- Bell icon in navigation shows notification count
- Click to view domains expiring within 30 days
- Expired domains highlighted in red

## Security Features

- Password hashing with bcryptjs (8 salt rounds)
- JWT authentication with 24-hour token expiry
- Protected API endpoints
- SQL injection prevention
- CORS enabled for cross-origin requests

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Development Mode with Auto-Reload
```bash
# Backend
cd server
npm run dev

# Frontend
npm start
```

## Troubleshooting

### API Key Issues
- Ensure `.env` file is in the `server` directory
- Verify API keys are valid
- Check API quota limits

### Database Issues
- Delete `server/database.sqlite` to reset database
- Restart backend server to recreate tables

### SSL Check Failures
- Ensure domain has HTTPS enabled
- Check if domain is accessible on port 443
- Some domains may block certificate checks

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Whoxy](https://www.whoxy.com/) - WHOIS API provider
- [Google PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/about) - Performance metrics
- [Logo.dev](https://logo.dev/) - Registrar logo service
- [Lucide Icons](https://lucide.dev/) - Icon library

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API provider documentation

## Roadmap

- [ ] Email notifications for expiring domains
- [ ] Domain renewal reminders
- [ ] Bulk domain operations
- [ ] Export domain data (CSV, JSON)
- [ ] Domain analytics and reports
- [ ] Multi-user support with teams
- [ ] Domain transfer tracking
- [ ] Integration with domain registrars
- [ ] Subdomain discovery via Certificate Transparency
- [ ] DNS record monitoring

---

Built with ❤️ using React and Node.js
