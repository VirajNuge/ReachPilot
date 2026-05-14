SendGrid setup

1. Install the package:

   npm install @sendgrid/mail

2. Environment variables:

   - SENDGRID_API_KEY: your SendGrid API key
   - EMAIL_FROM: the verified sender email address (e.g. no-reply@yourdomain.com)
   - NEXT_PUBLIC_APP_ORIGIN: https://your-app-url.com (optional, used for reset links)

3. Notes:

   - The mailer will attempt to require('@sendgrid/mail') at runtime and fall back to console logging if the SDK is unavailable.
   - Verify the sender email in SendGrid before sending in production.
