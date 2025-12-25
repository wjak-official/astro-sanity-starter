# Admin Dashboard Guide

## Overview

The Astro Sanity Starter now includes a production-ready admin dashboard with the following features:

- **Authentication**: Secure login/logout with session management
- **Setup Wizard**: Interactive wizard for configuring Sanity projects
- **Environment Manager**: Visual editor for environment variables
- **Embedded Studio**: Access Sanity Studio directly in the dashboard
- **Activity Tracking**: Monitor actions and changes
- **Dashboard**: Quick overview of content and analytics

## Getting Started

### 1. Access the Admin Dashboard

Navigate to `/admin` in your browser. You'll be redirected to the login page.

**Default Credentials:**
- Username: `admin`
- Password: `password123`

> **Security Note:** Change these credentials by setting `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables.

### 2. Using the Setup Wizard

If you haven't configured your Sanity project yet, use the Setup Wizard:

1. Navigate to `/admin/setup-wizard` or click "Setup Wizard" from the dashboard
2. Enter your Sanity API token (get one from [sanity.io/manage](https://www.sanity.io/manage))
3. Choose to create a new project or use an existing one
4. Optionally import sample data to get started quickly
5. Complete the wizard and start managing your content

### 3. Environment Configuration

Manage your environment variables visually:

1. Go to `/admin/settings`
2. Enter your Sanity configuration:
   - Project ID
   - Dataset (usually "production")
   - API Token
3. Test the connection
4. Save the configuration

The settings will be automatically synced to your `.env` file.

### 4. Content Management

Access the embedded Sanity Studio at `/admin/studio` to edit your content directly within the dashboard.

## Features

### Authentication System

- **Session-based authentication** using JWT tokens
- **Protected routes**: All admin pages require authentication
- **Secure logout**: Clears session and redirects to login

### Setup Wizard

- **Multi-step wizard** for easy configuration
- **Project creation**: Create new Sanity projects via API
- **Existing project support**: Connect to your existing Sanity projects
- **Sample data import**: Import starter content automatically

### Environment Manager

- **Visual editor** for environment variables
- **Masked inputs** for sensitive values (API tokens)
- **Connection testing**: Test your Sanity credentials before saving
- **Auto-sync**: Automatically updates `.env` file

### Embedded Studio

- **In-dashboard editing**: Access Sanity Studio without leaving the admin panel
- **Seamless integration**: Full Studio functionality embedded via iframe
- **Configuration detection**: Automatically shows setup instructions if not configured

### Activity Feed

- **Real-time tracking** of admin actions
- **Event logging**: Login, logout, configuration changes, content updates
- **Persistent storage**: Activity history saved locally in `.admin-activity.json`
- **Note**: Activity logs are stored in plain JSON format. For production systems with sensitive operations, consider implementing database-backed logging with proper access controls.

## Environment Variables

```env
# Sanity Configuration
SANITY_PROJECT_ID="your-project-id"
SANITY_DATASET="production"
SANITY_TOKEN="your-api-token"

# Admin Authentication
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="password123"
SESSION_SECRET="your-secret-key"
```

## Security Considerations

**CRITICAL:** The following security measures MUST be implemented before deploying to production:

1. **Set Strong Credentials**
   - **REQUIRED**: Set `ADMIN_USERNAME` to a unique, non-default value
   - **REQUIRED**: Set `ADMIN_PASSWORD` to a strong password (minimum 12 characters, mixed case, numbers, special characters)
   - Never use the default credentials (`admin`/`password123`) in production

2. **Configure Session Secret**
   - **REQUIRED**: Set `SESSION_SECRET` to a cryptographically secure random string (minimum 32 characters)
   - Generate with: `openssl rand -base64 32` or use a password generator
   - Never commit the session secret to version control

3. **Production Environment**
   - The application will refuse to start in production without proper credentials and session secret
   - Set `NODE_ENV=production` to enforce security requirements
   - Always use HTTPS in production for secure session cookies
   
4. **Token Security**
   - Keep your Sanity API token secure and never commit it to version control
   - Use environment variables for all sensitive values
   - Rotate tokens periodically

5. **Additional Measures**
   - Consider implementing rate limiting for login attempts
   - Add IP whitelisting if accessing from known locations
   - Use a proper authentication service (Auth0, Firebase Auth, etc.) for production
   - Regularly audit the activity logs for suspicious behavior

## API Endpoints

The admin dashboard includes several API endpoints:

- `/admin/api/auth/login` - User authentication
- `/admin/api/auth/logout` - End session
- `/admin/api/auth/session` - Check session status
- `/admin/api/env/load` - Load environment configuration
- `/admin/api/env/save` - Save environment configuration
- `/admin/api/env/test-connection` - Test Sanity connection
- `/admin/api/setup/create-project` - Create new Sanity project
- `/admin/api/setup/import-data` - Import sample data
- `/admin/api/activity/feed` - Get activity logs

## Troubleshooting

### Cannot log in
- Check that `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly
- Clear your browser cookies and try again

### Sanity connection fails
- Verify your project ID, dataset, and token are correct
- Ensure the token has read/write permissions
- Check your network connection

### Studio doesn't load
- Make sure you've configured your Sanity project in Settings
- Check that your project ID is correct
- Try running Studio locally: `cd studio && sanity dev`

## Development

To run the development server with the admin dashboard:

```bash
npm run dev
```

Then navigate to `http://localhost:3000/admin`

## Production Deployment

For production deployment:

1. Set all required environment variables on your hosting platform
2. Use strong credentials for `ADMIN_USERNAME` and `ADMIN_PASSWORD`
3. Generate a secure `SESSION_SECRET` (at least 32 characters)
4. Ensure HTTPS is enabled
5. Build and deploy: `npm run build`

## Support

For issues or questions:
- Check the [Sanity documentation](https://www.sanity.io/docs)
- Review the [Astro documentation](https://docs.astro.build)
- Open an issue on GitHub
