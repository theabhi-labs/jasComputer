import SibApiV3Sdk from '@sendinblue/client';

const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY,
  senderEmail: process.env.BREVO_SENDER_EMAIL,
  senderName: process.env.BREVO_SENDER_NAME
};

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoConfig.apiKey);

// Email templates
export const emailTemplates = {
  WELCOME: 'welcome_template_id',
  VERIFY_EMAIL: 'verify_email_template_id',
  FORGOT_PASSWORD: 'forgot_password_template_id',
  PAYMENT_CONFIRMATION: 'payment_confirmation_template_id',
  FEE_REMINDER: 'fee_reminder_template_id',
  CERTIFICATE_ISSUED: 'certificate_issued_template_id',
  ATTENDANCE_ALERT: 'attendance_alert_template_id'
};

// Send email function
export const sendEmail = async ({ to, subject, htmlContent, templateId, params }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    
    sendSmtpEmail.to = Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }];
    sendSmtpEmail.sender = {
      email: brevoConfig.senderEmail,
      name: brevoConfig.senderName
    };
    
    if (templateId) {
      sendSmtpEmail.templateId = templateId;
      sendSmtpEmail.params = params;
    } else {
      sendSmtpEmail.subject = subject;
      sendSmtpEmail.htmlContent = htmlContent;
    }
    
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent:', response.messageId);
    return { success: true, messageId: response.messageId };
    
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to Coaching MS!</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>Thank you for registering with Coaching MS. Your account has been created successfully.</p>
            <p>You can now login to access your dashboard, view courses, and track your progress.</p>
            <a href="${process.env.FRONTEND_URL}/login" class="button">Login Now</a>
            <p style="margin-top: 20px;">Best regards,<br/>Coaching MS Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Coaching MS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail({
    to: email,
    subject: 'Welcome to Coaching MS',
    htmlContent
  });
};

// Send OTP email
export const sendOTPEmail = async (email, otp, type = 'verification') => {
  const subject = type === 'password_reset' 
    ? 'Password Reset OTP - Coaching MS' 
    : 'Email Verification OTP - Coaching MS';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #1e40af); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; text-align: center; }
        .otp-code { background: #f3f4f6; padding: 20px; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; border-radius: 8px; margin: 20px 0; font-family: monospace; }
        .warning { color: #ef4444; font-size: 12px; margin-top: 10px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>🔐 Verification Code</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>Your OTP for ${type === 'password_reset' ? 'password reset' : 'email verification'} is:</p>
            <div class="otp-code">${otp}</div>
            <p>This OTP is valid for <strong>15 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <div class="warning">
              ⚠️ Never share this OTP with anyone. Our team will never ask for this code.
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2024 Coaching MS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail({
    to: email,
    subject,
    htmlContent
  });
};

// Send fee reminder email
export const sendFeeReminderEmail = async (email, name, dueAmount, dueDate) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px 20px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; }
        .content { padding: 40px 30px; text-align: center; }
        .amount { font-size: 32px; font-weight: bold; color: #f59e0b; }
        .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container">
          <div class="header">
            <h1>💰 Fee Payment Reminder</h1>
          </div>
          <div class="content">
            <h2>Dear ${name},</h2>
            <p>This is a reminder that your fee payment is due soon.</p>
            <p class="amount">₹${dueAmount.toLocaleString()}</p>
            <p>Due Date: <strong>${new Date(dueDate).toLocaleDateString()}</strong></p>
            <a href="${process.env.FRONTEND_URL}/dashboard/my-fees" class="button">Pay Now</a>
            <p style="margin-top: 20px;">Please make the payment at your earliest convenience to avoid any late fees.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Coaching MS. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail({
    to: email,
    subject: 'Fee Payment Reminder - Coaching MS',
    htmlContent
  });
};