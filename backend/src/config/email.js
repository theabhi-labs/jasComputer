// src/config/email.js
import SibApiV3Sdk from '@sendinblue/client';
import cron from 'node-cron';
import Student from '../models/Student.js';

const brevoConfig = {
  apiKey: process.env.BREVO_API_KEY,
  senderEmail: process.env.BREVO_SENDER_EMAIL,
  senderName: process.env.BREVO_SENDER_NAME || 'JAS Computer Institute'
};

// Initialize Brevo API client
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, brevoConfig.apiKey);

let apiWorking = true;
let emailQueue = [];
let isProcessing = false;

console.log('📧 Email Service Initialized');
console.log('📧 Sender:', brevoConfig.senderEmail);

// Queue processor for rate limiting
const processQueue = async () => {
  if (isProcessing || emailQueue.length === 0) return;
  isProcessing = true;
  
  while (emailQueue.length > 0) {
    const { to, subject, htmlContent, resolve, reject } = emailQueue.shift();
    try {
      const result = await sendEmailDirect({ to, subject, htmlContent });
      resolve(result);
    } catch (error) {
      reject(error);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  isProcessing = false;
};

// Direct email send function
const sendEmailDirect = async ({ to, subject, htmlContent }) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.sender = {
      email: brevoConfig.senderEmail,
      name: brevoConfig.senderName
    };
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email sent to ${to}: ${response.messageId}`);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.response?.body?.message || error.message);
    return { success: false, error: error.message };
  }
};

// Public send email with queue
export const sendEmail = async ({ to, subject, htmlContent }) => {
  const otpMatch = htmlContent.match(/<div class="otp-code">(\d+)<\/div>/) || htmlContent.match(/<span[^>]*>(\d+)<\/span>/);
  if (otpMatch) {
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log(`║   🔐 VERIFICATION CODE                               ║`);
    console.log(`║   To: ${to.padEnd(40)}║`);
    console.log(`║   OTP: ${otpMatch.padEnd(43)}║`);
    console.log(`║   Valid for 15 minutes                               ║`);
    console.log('╚════════════════════════════════════════════════════╝\n');
  }

  if (!apiWorking) {
    console.log(`⚠️ Email disabled - using console OTP for ${to}`);
    return { success: true, messageId: 'console-mode' };
  }

  return new Promise((resolve, reject) => {
    emailQueue.push({ to, subject, htmlContent, resolve, reject });
    processQueue();
  });
};

// ==================== COMMON STYLES & WRAPPERS ====================
const getEmailWrapper = (title, content, color = "#1e3a8a") => `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, ${color} 0%, #3b82f6 100%); padding: 35px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">${title}</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">JAS Computer Institute & Training Center</p>
    </div>
    <div style="padding: 30px; color: #334155; line-height: 1.6;">
      ${content}
      <p style="margin-top: 30px;">Best regards,<br><strong style="color: #1e3a8a;">JAS Institute Team</strong></p>
    </div>
    <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} JAS Computer Institute & Training Center. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

// ==================== ADMIN CREATED STUDENT EMAIL ====================

export const sendWelcomeEmail = async (email, name, enrollmentId, courseName, isNewRegistration, defaultPassword, additionalInfo) => {
  const subject = '🎓 Welcome! Your Account is Created - JAS Computer Institute';
  const content = `
    <h2 style="color: #1e293b;">Hello ${name},</h2>
    <p>Welcome to <strong>JAS Computer Institute & Training Center</strong>. Your student account has been successfully created.</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1e3a8a; font-size: 16px;">📋 Login Credentials:</h3>
      <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>🆔 Enrollment ID:</strong> <span style="color: #2563eb; font-weight: bold;">${enrollmentId}</span></p>
      <p style="margin: 5px 0;"><strong>🔐 Default Password:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${defaultPassword}</code></p>
      <p style="margin: 5px 0;"><strong>📚 Course:</strong> ${courseName}</p>
    </div>

    ${additionalInfo?.paymentStatus === 'completed' ? `
      <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; color: #065f46; font-size: 14px;">
        ✅ <strong>Admission Status:</strong> Confirmed & Paid.
      </div>
    ` : `
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; color: #92400e; font-size: 14px;">
        ⚠️ <strong>Payment Pending:</strong> Please complete your fee payment to finalize admission.
      </div>
    `}

    <div style="text-align: center; margin-top: 30px;">
      <a href="${additionalInfo?.dashboardLink || 'http://localhost:3000/student/dashboard'}" style="background: #1e3a8a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">Login to Dashboard</a>
    </div>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('WELCOME ABOARD', content) });
};

// Send payment confirmation email
export const sendPaymentConfirmation = async (email, name, enrollmentId, amount, paymentMethod, courseName) => {
  const subject = '💰 Payment Confirmed - JAS Computer Institute';
  const content = `
    <h2>Payment Successful, ${name}!</h2>
    <p>Your payment has been successfully recorded for the course enrollment.</p>
    
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 25px; border-radius: 16px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #64748b; font-size: 14px;">Amount Received</p>
      <h1 style="margin: 5px 0; color: #059669; font-size: 36px;">₹${amount.toLocaleString()}</h1>
      <div style="margin-top: 15px; border-top: 1px solid #dcfce7; padding-top: 15px; text-align: left; font-size: 14px;">
        <p><strong>Course:</strong> ${courseName}</p>
        <p><strong>ID:</strong> ${enrollmentId}</p>
        <p><strong>Method:</strong> ${paymentMethod}</p>
      </div>
    </div>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('PAYMENT SUCCESSFUL', content, "#059669") });
};

// ==================== REGISTRATION FLOW EMAILS ====================

export const sendVerificationOTP = async (email, name, otp) => {
  const subject = 'Verify Your Email - JAS Computer Institute';
  const content = `
    <h2>Verify Your Identity</h2>
    <p>Dear ${name}, please use the code below to verify your email address. This code is valid for 15 minutes.</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 42px; font-weight: 800; letter-spacing: 10px; color: #1e3a8a; background: #f1f5f9; padding: 15px 30px; border-radius: 10px; border: 2px dashed #3b82f6;">${otp}</span>
    </div>
    <p style="font-size: 13px; color: #64748b; text-align: center;">If you didn't request this, please ignore this email.</p>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('EMAIL VERIFICATION', content) });
};

// ==================== OTHER EMAIL FUNCTIONS ====================

export const sendPasswordResetOTP = async (email, name, otp) => {
  const subject = 'Password Reset - JAS Computer Institute';
  const content = `
    <h2>Reset Password</h2>
    <p>Hi ${name}, forgot your password? No worries. Use this OTP to reset it:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; color: #ef4444; background: #fef2f2; padding: 10px 20px; border-radius: 8px;">${otp}</span>
    </div>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('PASSWORD RESET', content, "#ef4444") });
};

export const sendPasswordChangedEmail = async (email, name) => {
  const subject = 'Security Alert: Password Changed';
  const content = `
    <h2>Password Updated</h2>
    <p>Hello ${name}, your account password for <strong>JAS Computer Institute</strong> was changed successfully. If this wasn't you, contact us immediately.</p>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('SECURITY UPDATE', content, "#334155") });
};

export const sendFeeReminder = async (email, name, dueAmount, dueDate, daysLeft) => {
  const subject = daysLeft === 1 ? '⚠️ URGENT: Fee Due Tomorrow!' : '⏰ Fee Reminder - JAS Computer Institute';
  const content = `
    <h2>Fee Payment Reminder</h2>
    <p>Dear ${name}, this is a friendly reminder regarding your pending course fee.</p>
    <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: 20px; border-radius: 12px; margin: 20px 0;">
      <p><strong>Due Amount:</strong> <span style="color: #b45309; font-size: 20px; font-weight: bold;">₹${dueAmount}</span></p>
      <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
    </div>
    <p>Please clear the dues to ensure uninterrupted access to your classes.</p>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('FEE REMINDER', content, "#d97706") });
};

export const sendCertificateIssued = async (email, name, certificateDetails) => {
  const subject = '🎓 Certificate Issued - JAS Computer Institute';
  const content = `
    <h2>Congratulations, ${name}!</h2>
    <p>Your hard work has paid off. We are proud to issue your certificate for <strong>${certificateDetails.courseName}</strong>.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="http://localhost:3000/verify/${certificateDetails.id}" style="background: #1e3a8a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Certificate</a>
    </div>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('CERTIFICATE ISSUED', content, "#1e3a8a") });
};

export const sendBirthdayWish = async (email, name) => {
  const subject = '🎂 Happy Birthday from JAS Computer Institute!';
  const content = `
    <h2 style="text-align: center;">Happy Birthday, ${name}! 🎂</h2>
    <p style="text-align: center;">The entire team at <strong>JAS Computer Institute & Training Center</strong> wishes you a day filled with joy and a year filled with success and new skills!</p>
  `;
  return await sendEmail({ to: email, subject, htmlContent: getEmailWrapper('HAPPY BIRTHDAY', content, "#db2777") });
};

// ==================== BIRTHDAY CRON JOB ====================

export const startBirthdayCron = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('🎂 Running birthday wish cron job...');
    const students = await Student.find({
      $expr: {
        $and: [
          { $eq: [{ $month: '$dateOfBirth' }, new Date().getMonth() + 1] },
          { $eq: [{ $dayOfMonth: '$dateOfBirth' }, new Date().getDate()] }
        ]
      },
      status: 'active',
      emailVerified: true
    }).select('name email');
    
    for (const student of students) {
      await sendBirthdayWish(student.email, student.name);
      console.log(`🎂 Birthday wish sent to ${student.name} (${student.email})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  });
  console.log('✅ Birthday cron job scheduled (daily at 8 AM)');
};

// ==================== COMPATIBILITY EXPORTS ====================
export const sendOTPEmail = sendVerificationOTP;
export const sendFeeReminderEmail = sendFeeReminder;

// ==================== DEFAULT EXPORT ====================
export default {
  sendVerificationOTP,
  sendWelcomeEmail,
  sendPaymentConfirmation,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendFeeReminder,
  sendCertificateIssued,
  sendBirthdayWish,
  sendOTPEmail,
  sendFeeReminderEmail,
  startBirthdayCron,
  sendEmail
};