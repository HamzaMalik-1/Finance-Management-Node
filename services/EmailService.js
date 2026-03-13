import nodemailer from 'nodemailer';

const generateDebtEmailTemplate = (debtData) => {
  const isLent = debtData.type === 'lent';
  const symbol = debtData.currencySymbol || '$';
  const amount = parseFloat(debtData.amount || 0).toLocaleString();
  const contactName = debtData.contactPerson?.name || 'Valued User';
  const description = debtData.description || "No description provided.";
  
  // Branding Colors
  const accentColor = isLent ? '#10b981' : '#f43f5e'; // Emerald for Lent, Rose for Borrowed
  const typeLabel = isLent ? "Receivable Entry" : "Payable Liability";

  return `
    <div style="background-color: #09090b; color: #ffffff; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px 20px; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #09090b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
        
        <div style="padding: 40px 40px 20px 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 6px; font-style: italic; color: #ffffff; text-transform: uppercase;">FINANCE.IO</h1>
          <p style="margin: 5px 0 0 0; font-size: 10px; font-weight: 700; color: #52525b; text-transform: uppercase; letter-spacing: 2px;">Secure Ledger Notification</p>
        </div>

        <div style="padding: 0 40px 40px 40px;">
          <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 20px; padding: 32px; text-align: center; margin-bottom: 30px;">
            <span style="display: inline-block; padding: 4px 12px; background-color: ${accentColor}20; color: ${accentColor}; border-radius: 100px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">
              ${typeLabel}
            </span>
            <h2 style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: -2px; color: #ffffff;">${symbol}${amount}</h2>
            <p style="margin: 8px 0 0 0; font-size: 14px; color: #a1a1aa;">Record established with <b>${contactName}</b></p>
          </div>

          <div style="border-top: 1px solid #27272a; padding-top: 24px;">
            <h4 style="margin: 0 0 16px 0; font-size: 10px; font-weight: 900; color: #52525b; text-transform: uppercase; letter-spacing: 1px;">Information Details</h4>
            
            <div style="margin-bottom: 12px; display: flex; justify-content: space-between;">
              <span style="font-size: 13px; color: #71717a;">Date:</span>
              <span style="font-size: 13px; font-weight: 700; color: #e4e4e7; float: right;">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div style="clear: both;"></div>

            <div style="margin-top: 12px; padding: 16px; background-color: #000000; border-radius: 12px; border-left: 4px solid #4f46e5;">
              <p style="margin: 0; font-size: 13px; font-style: italic; color: #d4d4d8;">"${description}"</p>
            </div>
          </div>

          <div style="margin-top: 40px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/debts/${debtData.id}" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 14px; font-size: 14px; font-weight: 800; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);">
              Access Timeline
            </a>
          </div>
        </div>

        <div style="padding: 30px; border-top: 1px solid #27272a; background-color: #09090b; text-align: center;">
          <p style="margin: 0; font-size: 11px; color: #3f3f46;">
            This is an automated encrypted message from FINANCE.IO.<br>
            Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  `;
};

export const sendDebtNotification = async (email, debtData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const isLent = debtData.type === 'lent';
  const subject = `FINANCE.IO | ${isLent ? 'Receivable' : 'Payable'} Notification`;

  try {
    await transporter.sendMail({
      from: '"FINANCE.IO" <noreply@finance.io>',
      to: email,
      subject: subject,
      html: generateDebtEmailTemplate(debtData)
    });
    return { success: true };
  } catch (error) {
    console.error("Email Service Error:", error);
    throw error;
  }
};