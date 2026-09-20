// Simple mailer wrapper that supports SendGrid when SENDGRID_API_KEY is provided.
// Falls back to console logging in development.
import type { MailDataRequired } from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'no-reply@reachpilot.example';

let sg: typeof import('@sendgrid/mail') | null = null;
if (SENDGRID_API_KEY) {
  try {
    // Dynamically require so the code still loads when package isn't installed
    // (useful for environments where the dependency hasn't been added yet)
    sg = require('@sendgrid/mail');
    sg!.setApiKey(SENDGRID_API_KEY);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('SendGrid module not available or failed to initialize:', err);
    sg = null;
  }
}

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (sg) {
    const msg: MailDataRequired = {
      to,
      from: FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    };
    try {
      // @ts-ignore - send has varied typings across versions
      await sg.send(msg as any);
      return true;
    } catch (err: unknown) {
      // eslint-disable-next-line no-console
      console.error('SendGrid send failed:', err);
      return false;
    }
  }

  // Fallback: Log the email to console in development
  // eslint-disable-next-line no-console
  console.info('sendEmail fallback — email not sent (no provider configured)');
  // eslint-disable-next-line no-console
  console.info('to:', to, 'subject:', subject, 'html:', html);
  return false;
}

// Helper for install instructions
export function mailerInstructions() {
  return {
    provider: 'sendgrid',
    install: 'npm i @sendgrid/mail',
    env: ['SENDGRID_API_KEY', 'EMAIL_FROM', 'NEXT_PUBLIC_APP_ORIGIN'],
  };
}
