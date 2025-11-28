/**
 * Email Service
 * 
 * This module handles all email sending functionality for the application.
 * Email integration will be added later.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface PasswordResetEmailOptions {
  to: string;
  name?: string;
  resetToken: string;
  resetUrl: string;
}

export interface EmailVerificationOptions {
  to: string;
  name?: string;
  verificationToken: string;
  verificationUrl: string;
}

/**
 * Send a password reset email
 * TODO: Implement email sending functionality
 */
export async function sendPasswordResetEmail(
  options: PasswordResetEmailOptions
): Promise<boolean> {
  const { to, name, resetToken, resetUrl } = options;
  
  // TODO: Implement actual email sending logic here
  // For now, just log the details
  console.log('Password reset email would be sent to:', to);
  console.log('Reset URL:', resetUrl);
  console.log('Reset Token:', resetToken);
  
  // Simulate successful email sending
  return true;
}

/**
 * Send an email verification email
 * TODO: Implement email sending functionality
 */
export async function sendEmailVerificationEmail(
  options: EmailVerificationOptions
): Promise<boolean> {
  const { to, name, verificationToken, verificationUrl } = options;
  
  // TODO: Implement actual email sending logic here
  console.log('Email verification would be sent to:', to);
  console.log('Verification URL:', verificationUrl);
  console.log('Verification Token:', verificationToken);
  
  // Simulate successful email sending
  return true;
}

/**
 * Send a generic email
 * TODO: Implement email sending functionality
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const { to, subject, html, text } = options;
  
  // TODO: Implement actual email sending logic here
  console.log('Email would be sent to:', to);
  console.log('Subject:', subject);
  
  // Simulate successful email sending
  return true;
}

/**
 * Generate password reset email HTML template
 */
export function generatePasswordResetEmailHtml(
  name: string | undefined,
  resetUrl: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <h1 style="margin: 0; color: #2563eb; font-size: 28px; font-weight: bold;">AutomaPost</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 20px 40px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
              ${name ? `<p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">Hi ${name},</p>` : ''}
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 16px; color: #2563eb; font-size: 14px; line-height: 1.5; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                © ${new Date().getFullYear()} AutomaPost. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate password reset email plain text version
 */
export function generatePasswordResetEmailText(
  name: string | undefined,
  resetUrl: string
): string {
  return `
Reset Your Password

${name ? `Hi ${name},` : 'Hi,'}

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.

© ${new Date().getFullYear()} AutomaPost. All rights reserved.
  `.trim();
}
