import nodemailer from 'nodemailer';
import env from '@/config/environment';
import logger from '@/config/logger';

/**
 * Email service for sending OTP and notifications
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASS) {
      logger.warn('Email configuration incomplete. Email service will not be available.');
      return;
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: env.EMAIL_HOST,
        port: env.EMAIL_PORT || 587,
        secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: env.EMAIL_USER,
          pass: env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false // For development environments
        }
      });

      logger.info('Email transporter initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Verify transporter connection
   */
  private async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email transporter verification failed:', error);
      return false;
    }
  }

  /**
   * Send OTP email
   */
  async sendOTPEmail(email: string, otp: string, firstName: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not available');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email transporter not connected');
      return false;
    }

    const subject = 'Password Reset OTP - Savings Planner';
    const html = this.generateOTPEmailHTML(firstName, otp);
    const text = this.generateOTPEmailText(firstName, otp);

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM || env.EMAIL_USER,
        to: email,
        subject,
        html,
        text
      });

      logger.info(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not available');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email transporter not connected');
      return false;
    }

    const subject = 'Welcome to Savings Planner!';
    const html = this.generateWelcomeEmailHTML(firstName);
    const text = this.generateWelcomeEmailText(firstName);

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM || env.EMAIL_USER,
        to: email,
        subject,
        html,
        text
      });

      logger.info(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmation(email: string, firstName: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn('Email service not available');
      return false;
    }

    const isConnected = await this.verifyConnection();
    if (!isConnected) {
      logger.error('Email transporter not connected');
      return false;
    }

    const subject = 'Password Reset Successful - Savings Planner';
    const html = this.generatePasswordResetConfirmationHTML(firstName);
    const text = this.generatePasswordResetConfirmationText(firstName);

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM || env.EMAIL_USER,
        to: email,
        subject,
        html,
        text
      });

      logger.info(`Password reset confirmation email sent successfully to ${email}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send password reset confirmation email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Generate OTP email HTML
   */
  private generateOTPEmailHTML(firstName: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 4px; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Savings Planner</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>We received a request to reset your password. Use the OTP below to complete the process:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes</strong></p>
            </div>
            
            <div class="warning">
              <p><strong>Security Notice:</strong></p>
              <ul>
                <li>Never share this OTP with anyone</li>
                <li>Our team will never ask for your OTP</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
            
            <p>Best regards,<br>The Savings Planner Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate OTP email text
   */
  private generateOTPEmailText(firstName: string, otp: string): string {
    return `
Password Reset OTP - Savings Planner

Hello ${firstName},

We received a request to reset your password. Use the OTP below to complete the process:

OTP: ${otp}

This OTP will expire in 10 minutes.

SECURITY NOTICE:
- Never share this OTP with anyone
- Our team will never ask for your OTP
- If you didn't request this, please ignore this email

If you have any questions, please contact our support team.

Best regards,
The Savings Planner Team

This is an automated email. Please do not reply.
    `;
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeEmailHTML(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Savings Planner!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .feature { background: white; border-radius: 8px; padding: 20px; margin: 15px 0; border-left: 4px solid #10B981; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Savings Planner!</h1>
            <p>Your journey to financial freedom starts now</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Welcome to Savings Planner! We're excited to help you achieve your financial goals.</p>
            
            <div class="feature">
              <h3>🚀 What you can do:</h3>
              <ul>
                <li>Track your income and expenses</li>
                <li>Set and monitor savings goals</li>
                <li>Compare saving vs investing strategies</li>
                <li>Get personalized financial tips</li>
                <li>Learn about investment options</li>
              </ul>
            </div>
            
            <div class="feature">
              <h3>💡 Getting Started:</h3>
              <ol>
                <li>Add your monthly income</li>
                <li>Record your regular expenses</li>
                <li>Set your first savings goal</li>
                <li>Explore investment comparisons</li>
              </ol>
            </div>
            
            <p>Ready to start? Log in to your account and begin your financial planning journey!</p>
            
            <p>Best regards,<br>The Savings Planner Team</p>
          </div>
          <div class="footer">
            <p>Thank you for choosing Savings Planner!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email text
   */
  private generateWelcomeEmailText(firstName: string): string {
    return `
Welcome to Savings Planner!

Hello ${firstName},

Welcome to Savings Planner! We're excited to help you achieve your financial goals.

What you can do:
- Track your income and expenses
- Set and monitor savings goals
- Compare saving vs investing strategies
- Get personalized financial tips
- Learn about investment options

Getting Started:
1. Add your monthly income
2. Record your regular expenses
3. Set your first savings goal
4. Explore investment comparisons

Ready to start? Log in to your account and begin your financial planning journey!

Best regards,
The Savings Planner Team

Thank you for choosing Savings Planner!
    `;
  }

  /**
   * Generate password reset confirmation HTML
   */
  private generatePasswordResetConfirmationHTML(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Successful</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .success-box { background: #D1FAE5; border: 2px solid #10B981; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Password Reset Successful</h1>
            <p>Your account is secure</p>
          </div>
          <div class="content">
            <h2>Hello ${firstName},</h2>
            <p>Your password has been successfully reset. Your account is now secure with your new password.</p>
            
            <div class="success-box">
              <h3>🔒 Security Confirmed</h3>
              <p>Your new password is now active and your account is protected.</p>
            </div>
            
            <p>If you did not perform this action, please contact our support team immediately.</p>
            
            <p>You can now log in to your account with your new password.</p>
            
            <p>Best regards,<br>The Savings Planner Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset confirmation text
   */
  private generatePasswordResetConfirmationText(firstName: string): string {
    return `
Password Reset Successful - Savings Planner

Hello ${firstName},

Your password has been successfully reset. Your account is now secure with your new password.

Security Confirmed:
Your new password is now active and your account is protected.

If you did not perform this action, please contact our support team immediately.

You can now log in to your account with your new password.

Best regards,
The Savings Planner Team

This is an automated email. Please do not reply.
    `;
  }

  /**
   * Check if email service is available
   */
  isAvailable(): boolean {
    return this.transporter !== null;
  }

  /**
   * Get service status
   */
  getStatus(): { available: boolean; configured: boolean } {
    return {
      available: this.transporter !== null,
      configured: !!(env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS)
    };
  }
}

// Export singleton instance
export default new EmailService();