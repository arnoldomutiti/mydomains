# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Domain Dashboard application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Domain Dashboard application running

## Step 1: Create Google OAuth Credentials

1. **Go to Google Cloud Console**
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create a New Project** (or select an existing one)
   - Click on the project dropdown at the top
   - Click "New Project"
   - Enter a project name (e.g., "Domain Dashboard")
   - Click "Create"

3. **Enable Google+ API**
   - In the left sidebar, go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click on it and press "Enable"

4. **Configure OAuth Consent Screen**
   - Go to "APIs & Services" > "OAuth consent screen"
   - Select "External" user type
   - Click "Create"
   - Fill in the required fields:
     - App name: Domain Dashboard
     - User support email: your email
     - Developer contact email: your email
   - Click "Save and Continue"
   - Skip the Scopes page (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"

5. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application" as the application type
   - Give it a name (e.g., "Domain Dashboard Web Client")
   - Under "Authorized JavaScript origins", add:
     ```
     http://localhost:3000
     ```
   - Under "Authorized redirect URIs", add:
     ```
     http://localhost:5000/api/auth/google/callback
     ```
   - Click "Create"

6. **Copy Your Credentials**
   - You'll see a modal with your Client ID and Client Secret
   - **Important:** Copy these values - you'll need them in the next step

## Step 2: Configure Environment Variables

1. Open the file `server/.env` in your project

2. Add your Google OAuth credentials:
   ```env
   GOOGLE_CLIENT_ID=your_actual_client_id_here
   GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
   ```

3. Replace `your_actual_client_id_here` and `your_actual_client_secret_here` with the values from Step 1

## Step 3: Restart Your Application

1. **Stop the backend server** (press Ctrl+C in the terminal)

2. **Restart the backend server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Ensure frontend is running:**
   ```bash
   npm start
   ```

## Step 4: Test Google Authentication

1. Open your browser and go to `http://localhost:3000`

2. On the login page, you should see a "Continue with Google" button

3. Click the button:
   - You'll be redirected to Google's login page
   - Sign in with your Google account
   - Grant permissions to the app
   - You'll be redirected back to the app and automatically logged in

## How It Works

1. **User clicks "Continue with Google"**
   - The app redirects to Google's OAuth authorization page

2. **User authorizes the app**
   - Google authenticates the user and asks for permission

3. **Google redirects back to your app**
   - Google sends an authorization code to your callback URL

4. **Backend exchanges code for user info**
   - Your server exchanges the code for the user's profile
   - Creates or finds the user in your database
   - Generates a JWT token

5. **User is logged in**
   - The frontend receives the token
   - Stores it in localStorage
   - User can now access their domains

## Security Notes

- The `.env` file is in `.gitignore` - never commit it to version control
- Client Secret should be kept private and secure
- In production, use HTTPS for all URLs
- Change the redirect URIs to match your production domain

## Troubleshooting

### Error: "redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches: `http://localhost:5000/api/auth/google/callback`
- No trailing slashes
- Check for typos

### Error: "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google+ API
- Configure the OAuth consent screen
- Add your email as a test user

### Can't see Google button
- Check browser console for errors
- Make sure frontend is running on port 3000
- Clear browser cache and refresh

### Authentication doesn't work
- Verify environment variables are set correctly
- Restart the backend server after adding credentials
- Check backend logs for errors

## Production Deployment

When deploying to production:

1. Update the authorized origins in Google Console:
   ```
   https://yourdomain.com
   ```

2. Update the redirect URI:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

3. Update the callback URL in `server/server.js`:
   ```javascript
   callbackURL: "https://yourdomain.com/api/auth/google/callback"
   ```

4. Update CORS origin in `server/server.js`:
   ```javascript
   app.use(cors({
     origin: 'https://yourdomain.com',
     credentials: true
   }));
   ```

5. Set `secure: true` for cookies in production

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport.js Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)
