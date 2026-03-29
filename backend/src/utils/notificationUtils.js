// backend/src/utils/notificationUtils.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email notification
 */
export const sendEmail = async ({ to, subject, message, template, data }) => {
  try {
    // If using template, render HTML template
    let htmlContent = message;
    
    if (template && data) {
      htmlContent = renderTemplate(template, data);
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@coachingms.com',
      to,
      subject,
      html: htmlContent,
    };
    
    const info = await emailTransporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Render email template
 */
const renderTemplate = (template, data) => {
  const templates = {
    fee_reminder: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Fee Payment Reminder</h2>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>This is a reminder that your fee payment is pending.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Course:</strong> ${data.courseName}</p>
          <p><strong>Pending Amount:</strong> ₹${data.pendingAmount.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
        <p>Please make the payment at your earliest convenience to avoid late fees.</p>
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/fees" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Pay Now
        </a>
        <p style="margin-top: 20px; color: #666;">Thank you,<br/>Coaching Management System</p>
      </div>
    `,
    
    payment_confirmation: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Payment Confirmation</h2>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>Your payment has been successfully received.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
          <p><strong>Receipt No:</strong> ${data.receiptNo}</p>
          <p><strong>Payment Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
          <p><strong>Payment Mode:</strong> ${data.paymentMode}</p>
          <p><strong>Remaining Balance:</strong> ₹${data.remainingBalance.toLocaleString()}</p>
        </div>
        <p>Thank you for your payment.</p>
        <p style="margin-top: 20px; color: #666;">Best regards,<br/>Coaching Management System</p>
      </div>
    `,
    
    fee_created: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Fee Structure Created</h2>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>Your fee structure has been created successfully.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Total Fees:</strong> ₹${data.totalFees.toLocaleString()}</p>
          <p><strong>Payable Amount:</strong> ₹${data.netPayable.toLocaleString()}</p>
          <p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>
          ${data.admissionFee ? `<p><strong>Admission Fee:</strong> ₹${data.admissionFee.toLocaleString()}</p>` : ''}
          ${data.courseFee ? `<p><strong>Course Fee:</strong> ₹${data.courseFee.toLocaleString()}</p>` : ''}
        </div>
        <p>Please make the payment before the due date.</p>
        <p style="margin-top: 20px; color: #666;">Thank you,<br/>Coaching Management System</p>
      </div>
    `,
    
    admission_fee_paid: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Admission Fee Paid</h2>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>Your admission fee has been successfully received.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
          <p><strong>Receipt No:</strong> ${data.receiptNo}</p>
          <p><strong>Payment Date:</strong> ${new Date(data.paymentDate).toLocaleDateString()}</p>
        </div>
        <p>You are now officially enrolled in your course.</p>
        <p style="margin-top: 20px; color: #666;">Best regards,<br/>Coaching Management System</p>
      </div>
    `,
    
    installment_paid: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Installment Payment Received</h2>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>Your installment payment has been successfully received.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Installment:</strong> ${data.installmentNumber}</p>
          <p><strong>Amount:</strong> ₹${data.amount.toLocaleString()}</p>
          <p><strong>Receipt No:</strong> ${data.receiptNo}</p>
          <p><strong>Remaining Balance:</strong> ₹${data.remainingBalance.toLocaleString()}</p>
        </div>
        <p>Thank you for your payment.</p>
        <p style="margin-top: 20px; color: #666;">Best regards,<br/>Coaching Management System</p>
      </div>
    `,
  };
  
  return templates[template] || `<p>${data.message || 'Notification from Coaching Management System'}</p>`;
};

/**
 * Send bulk email notifications
 */
export const sendBulkEmails = async (recipients, subject, message, template, data) => {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient.email,
      subject,
      message,
      template,
      data: { ...data, studentName: recipient.name }
    });
    results.push({ recipient: recipient.email, ...result });
  }
  
  return results;
};

// Export for backward compatibility
export const sendBulkNotifications = sendBulkEmails;