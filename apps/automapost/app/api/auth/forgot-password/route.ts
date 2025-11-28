import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import {
  sendPasswordResetEmail,
  generatePasswordResetEmailHtml,
  generatePasswordResetEmailText,
} from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user by email
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
      })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    // (Don't reveal whether the email exists in the system)
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set token expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Update user with reset token
    await db
      .update(users)
      .set({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: expiresAt,
      })
      .where(eq(users.id, user.id));

    // Build reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    request.headers.get('origin') || 
                    'http://localhost:3000';
    
    // Extract locale from the request if available
    const referer = request.headers.get('referer') || '';
    const localeMatch = referer.match(/\/([a-z]{2})\//) || referer.match(/\/([a-z]{2}-[a-z]{2})\//);
    const locale = localeMatch ? localeMatch[1] : 'en';
    
    const resetUrl = `${baseUrl}/${locale}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail({
      to: user.email,
      name: user.name || undefined,
      resetToken,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
