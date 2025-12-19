// UPDATED VERSION - Dec 18, 2025
const { Resend } = require('resend');

  // Initialize Resend with API key
  const resend = new Resend(process.env.RESEND_API_KEY);

  const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  /**
   * Send verification email
   * @param {string} email - User's email
   * @param {string} token - Verification token
   * @param {string} username - User's username
   */
  const sendVerificationEmail = async (email, token, username) => {
    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Verify Your QuickQuest Account',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
              .code { background: #e2e8f0; padding: 3px 8px; border-radius: 4px; font-family: monospace; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Welcome to QuickQuest!</h1>
              </div>
              <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">Hi ${username},</h2>
                <p style="font-size: 16px; color: #475569;">Thanks for signing up! We're excited to have you on board.</p>
                <p style="font-size: 16px; color: #475569;">Please verify your email address to get started:</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                <p style="color: #64748b; font-size: 14px; margin-top: 30px;">Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all;"><a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a></p>
                <p style="color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">This link expires in 24 hours.</p>
                <p style="color: #cbd5e1; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2024 QuickQuest. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Verification email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  };

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @param {string} token - Reset token
   * @param {string} username - User's username
   */
  const sendPasswordResetEmail = async (email, token, username) => {
    console.log('🔵 Attempting to send reset email to:', email);
    
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Reset Your QuickQuest Password',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .code-box { background: white; border: 2px solid #667eea; padding: 20px; margin: 25px 0; border-radius: 8px; text-align: center; }
              .code { font-size: 32px; font-weight: 700; color: #667eea; letter-spacing: 3px; font-family: 'Courier New', monospace; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Password Reset Request</h1>
              </div>
              <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">Hi ${username},</h2>
                <p style="font-size: 16px; color: #475569;">We received a request to reset your password. Use this code to reset your password:</p>
                
                <div class="code-box">
                  <div style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Your Reset Code</div>
                  <div class="code">${token}</div>
                </div>

                <p style="color: #64748b; font-size: 14px; text-align: center;">Copy this code and paste it into the password reset form on QuickQuest.</p>
                
                <div class="warning">
                  <strong style="color: #856404;">⚠️ Security Notice:</strong><br>
                  <span style="color: #856404; font-size: 14px;">This code expires in 1 hour. If you didn't request this password reset, please ignore this email and your password will remain unchanged.</span>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 QuickQuest. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      // Check if email actually sent
      if (result.error) {
        console.error('❌ Resend returned error:', result.error);
        throw new Error('Failed to send password reset email: ' + result.error.message);
      }

      console.log(`✅ Password reset email sent to ${email}, ID:`, result.id);
      return result;
    } catch (error) {
      console.error('❌ Error sending password reset email:', error.message);
      throw error;
    }
  };

  /**
   * Send welcome email after verification
   * @param {string} email - User's email
   * @param {string} username - User's username
   */
  const sendWelcomeEmail = async (email, username) => {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: '🎉 Welcome to QuickQuest!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .feature { background: white; padding: 18px; margin: 12px 0; border-radius: 6px; border-left: 4px solid #667eea; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 14px 32px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 You're All Set!</h1>
              </div>
              <div class="content">
                <h2 style="color: #1e293b; margin-top: 0;">Hi ${username},</h2>
                <p style="font-size: 16px; color: #475569;">Your email is verified! Welcome to QuickQuest - the escrow-protected marketplace.</p>
                <h3 style="color: #334155; font-size: 18px;">What you can do now:</h3>
                <div class="feature">
                  <strong style="color: #1e293b; font-size: 15px;">💼 Post Tasks</strong><br>
                  <span style="color: #64748b; font-size: 14px;">Need something done? Post a task and let workers bid on it.</span>
                </div>
                <div class="feature">
                  <strong style="color: #1e293b; font-size: 15px;">💪 Accept Tasks</strong><br>
                  <span style="color: #64748b; font-size: 14px;">Browse available tasks and start earning money.</span>
                </div>
                <div class="feature">
                  <strong style="color: #1e293b; font-size: 15px;">🔒 Payment Protection</strong><br>
                  <span style="color: #64748b; font-size: 14px;">All payments held in escrow until work is completed.</span>
                </div>
                <div style="text-align: center;">
                  <a href="${FRONTEND_URL}" class="button">Get Started</a>
                </div>
              </div>
              <div class="footer">
                <p>© 2024 QuickQuest. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error);
      // Don't throw - welcome email is not critical
    }
  };

  module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
  };

