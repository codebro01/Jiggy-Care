import { SevenDayFollowUpTemplateData } from '../types/types';

export class EmailTemplate {
  getWelcomeTemplate(data: { name: string; email: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .button { display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Banatrics!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Thank you for joining us. We're excited to have you on board!</p>
              <p>Your account has been successfully created with email: <strong>${data.email}</strong></p>
              <a href="https://" class="button">Get Started</a>
              <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignCreatedTemplate(data: {
    campaignName: string;
    packageType: string;
    startDate: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info-box { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Campaign Created Successfully! 🚀</h1>
            </div>
            <div class="content">
              <h2>Campaign Details</h2>
              <div class="info-box">
                <p><strong>Campaign Name:</strong> ${data.campaignName}</p>
                <p><strong>Package Type:</strong> ${data.packageType.toUpperCase()}</p>
                <p><strong>Start Date:</strong> ${new Date(data.startDate).toLocaleDateString()}</p>
              </div>
              <p>Your campaign is now under review. We'll notify you once it's approved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getCampaignApprovedTemplate(data: {
    campaignName: string;
    campaignId: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <div style="background: #4CAF50; color: white; padding: 20px; text-align: center;">
              <h1>Campaign Approved!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
              <h2>Great News!</h2>
              <p>Your campaign <strong>"${data.campaignName}"</strong> has been approved and is now live!</p>
              <a href="https://yourapp.com/campaigns/${data.campaignId}" style="display: inline-block; padding: 12px 24px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                View Campaign
              </a>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getPasswordResetTemplate(data: { resetCode: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Reset Your Password</h2>
            <p>You requested to reset your password. Here is your OTP:</p>
               <h1 style="display: inline-block; padding: 12px 24px; background: #0e0e0fff; color: white; text-decoration: none; margin: 20px 0;">
              ${data.resetCode}
            </h1>
            <p>This code will expire in 15 Minutes</p>
            <p><small>If you didn't request this, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getEmailVerificationTemplate(data: {
    verificationCode: string;
    name: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Verify Your Email Address</h2>

            <p>Hi ${data.name},</p>
            <p>Use the OTP Below to verify your email</p>
            <h1 style="display: inline-block; padding: 12px 24px; background: #0e0e0fff; color: white; text-decoration: none; margin: 20px 0;">
              ${data.verificationCode}
            </h1>
            <p><small>If you didn't create an account, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getLoginOtp(data: { verificationCode: string; name: string }): string {
    return `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2>Verify Your Email Address</h2>

            <p>Hi ${data.name},</p>
            <p>Use the OTP Below to login to your account</p>
            <h1 style="display: inline-block; padding: 12px 24px; background: #0e0e0fff; color: white; text-decoration: none; margin: 20px 0;">
              ${data.verificationCode}
            </h1>
            <p><small>If you didn't create an account, please ignore this email.</small></p>
          </div>
        </body>
      </html>
    `;
  }

  getAppointmentSummaryTemplate(data: {
    invoiceNo: string;
    appointmentDate: Date;
    amountPaid: number;
    consultantName: string;
    invoiceStatus: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
            .header { background: #2c3e50; color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .invoice-id { color: #ecf0f1; font-size: 14px; margin-top: 10px; }
            .content { padding: 30px 20px; }
            .invoice-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
            .detail-row:last-child { border-bottom: none; }
            .detail-label { font-weight: 600; color: #555; }
            .detail-value { color: #333; text-align: right; }
            .amount-section { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .amount-label { font-size: 14px; color: #666; margin-bottom: 8px; }
            .amount-value { font-size: 32px; font-weight: bold; color: #2e7d32; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .status-paid { background: #4CAF50; color: white; }
            .status-pending { background: #FF9800; color: white; }
            .status-failed { background: #f44336; color: white; }
            .status-active { background: #2196F3; color: white; }
            .status-completed { background: #4CAF50; color: white; }
            .status-paused { background: #9E9E9E; color: white; }
            .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
            .button { display: inline-block; padding: 12px 30px; background: #2c3e50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Summary</h1>
              <h3 class="invoice-id">Invoice No  #${data.invoiceNo}</h3>
            </div>
            
            <div class="content">
              <p>Your appointment is with ${data.consultantName}</p>
              
              <div class="amount-section">
                <div class="amount-label">Amount Paid</div>
                <div class="amount-value">₦${data.amountPaid.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              
              <div class="invoice-details">
  
                <div class="detail-row">
                  <span class="detail-label">Apointment Date</span>
                  <span class="detail-value">: ${new Date(data.appointmentDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Apointment Time</span>
                  <span class="detail-value">: ${new Date(data.appointmentDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Invoice Status</span>
                  <span class="detail-value">
                    <span class="status-badge status-${data.invoiceStatus?.toLowerCase()}">: ${data.invoiceStatus}</span>
                  </span>
                </div>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                If you have any questions about this invoice, please contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Jigicare. All rights reserved.</p>
              <p>This is an automated invoice notification.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getConsultantAppointmentSummaryTemplate(data: {
    consultantName: string;
    patientName: string;
    appointmentDate: Date;
    notes?: string;
  }): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
          .header { background: #2c3e50; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .appointment-id { color: #ecf0f1; font-size: 14px; margin-top: 10px; }
          .content { padding: 30px 20px; }
          .appointment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #555; }
          .detail-value { color: #333; text-align: right; }
          .time-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .time-label { font-size: 14px; color: #666; margin-bottom: 8px; }
          .time-value { font-size: 32px; font-weight: bold; color: #1565c0; }
          .time-date { font-size: 16px; color: #1976d2; margin-top: 8px; }
          .notes-section { background: #fff8e1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .notes-title { font-weight: 600; color: #555; margin-bottom: 8px; }
          .badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; }
          .badge-upcoming { background: #2196F3; color: white; }
          .badge-online { background: #4CAF50; color: white; }
          .badge-in-person { background: #9C27B0; color: white; }
          .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
          .alert-banner { background: #fff3e0; border: 1px solid #ffb74d; border-radius: 8px; padding: 15px 20px; margin: 20px 0; text-align: center; color: #e65100; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Upcoming Appointment</h1>
          </div>

          <div class="content">
            <p>Dear <strong>${data.consultantName}</strong>,</p>
            <p>You have an upcoming appointment scheduled. Please review the details below and ensure you are prepared ahead of time.</p>

            <div class="alert-banner">
               Reminder: Please be available 5 minutes before the scheduled time
            </div>

            <div class="time-section">
              <div class="time-label">Appointment Time</div>
              <div class="time-value">
                ${new Date(data.appointmentDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </div>
              <div class="time-date">
                ${new Date(data.appointmentDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            <div class="appointment-details">
              <div class="detail-row">
                <span class="detail-label">Patient Name</span>
                <span class="detail-value">${data.patientName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Appointment Date</span>
                <span class="detail-value">${new Date(data.appointmentDate).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Appointment Time</span>
                <span class="detail-value">${new Date(data.appointmentDate).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status</span>
                <span class="detail-value">
                  <span class="badge badge-upcoming">Upcoming</span>
                </span>
              </div>
            </div>

            ${
              data.notes
                ? `
            <div class="notes-section">
              <div class="notes-title">📋 Patient Notes</div>
              <p style="margin: 0; color: #555; font-size: 14px;">${data.notes}</p>
            </div>
            `
                : ''
            }

            <p style="margin-top: 30px; font-size: 14px; color: #666;">
              If you need to reschedule or have any concerns, please contact our support team as soon as possible.
            </p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Jigicare. All rights reserved.</p>
            <p>This is an automated appointment notification.</p>
          </div>
        </div>
      </body>
    </html>
  `;
  }

  getTwoDayFollowUpTemplate(data: {
    patientName: string;
    doctorName: string;
    consultationDate: Date;
  }): string {
    return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: #1a6b4a; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { color: #a8d5b5; font-size: 14px; margin-top: 8px; }
        .content { padding: 30px 20px; }
        .checklist { background: #f0faf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a6b4a; }
        .checklist-title { font-weight: 600; color: #1a6b4a; margin-bottom: 12px; font-size: 16px; }
        .checklist-item { display: flex; align-items: flex-start; padding: 8px 0; color: #444; font-size: 14px; }
        .checklist-item span { margin-left: 10px; }
        .consultation-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; text-align: right; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; padding: 14px 32px; background: #1a6b4a; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px; }
        .cta-button-outline { display: inline-block; padding: 14px 32px; background: white; color: #1a6b4a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px; border: 2px solid #1a6b4a; }
        .alert-banner { background: #e8f5e9; border: 1px solid #81c784; border-radius: 8px; padding: 15px 20px; margin: 20px 0; text-align: center; color: #2e7d32; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hello <strong>${data.patientName}</h1>
        </div>

        <div class="content">
          <p>
            We hope you're feeling better today. It’s been few days since your consultation with us, and we wanted to check in on your progress.

Hope there has been improvements in your symptoms?
Are you following the treatment plan and hope it has been helpful?

Your health matters to us, and staying consistent with your treatment is key to recovery. If you have any concerns, side effects, or questions, please don’t hesitate to reach out through the app, we are here for you.


          </p>

          <div class="alert-banner">
Wishing you a smooth and speedy recovery.
The JigiCare Team          </div>

          <div class="consultation-info">
            <div class="detail-row">
              <span class="detail-label">Consultation Date</span>
              <span class="detail-value">
                ${new Date(data.consultationDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div class="checklist">
            <div class="checklist-title">📋 Quick Check-In</div>
            <div class="checklist-item">✅ <span>Are your symptoms improving since your consultation?</span></div>
            <div class="checklist-item">💊 <span>Have you been following your prescribed medication or treatment plan?</span></div>
            <div class="checklist-item">⚠️ <span>Have you experienced any new or worsening symptoms?</span></div>
          </div>

          <p style="font-size: 14px; color: #555;">
            If anything is bothering you or your condition has not improved, please do not wait — 
            book a follow-up consultation with your doctor right away.
          </p>

          <div class="cta-section">
            <a href="#" class="cta-button">Book a Follow-Up</a>
            <a href="#" class="cta-button-outline">I'm Feeling Better ✓</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Jigicare. All rights reserved.</p>
          <p>This is an automated follow-up notification from your care team.</p>
        </div>
      </div>
    </body>
  </html>
`;
  }

  getSevenDayFollowUpTemplate(data: SevenDayFollowUpTemplateData): string {
    return `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 650px; margin: 0 auto; padding: 20px; background: #ffffff; }
        .header { background: #1565c0; color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { color: #90caf9; font-size: 14px; margin-top: 8px; }
        .content { padding: 30px 20px; }
        .recovery-card { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .recovery-label { font-size: 14px; color: #666; margin-bottom: 6px; }
        .recovery-days { font-size: 48px; font-weight: bold; color: #1565c0; }
        .recovery-sub { font-size: 14px; color: #1976d2; margin-top: 6px; }
        .consultation-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #555; }
        .detail-value { color: #333; text-align: right; }
        .checklist { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1565c0; }
        .checklist-title { font-weight: 600; color: #1565c0; margin-bottom: 12px; font-size: 16px; }
        .checklist-item { display: flex; align-items: flex-start; padding: 8px 0; color: #444; font-size: 14px; }
        .checklist-item span { margin-left: 10px; }
        .cta-section { text-align: center; margin: 30px 0; }
        .cta-button { display: inline-block; padding: 14px 32px; background: #1565c0; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px; }
        .cta-button-outline { display: inline-block; padding: 14px 32px; background: white; color: #1565c0; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px; border: 2px solid #1565c0; }
        .alert-banner { background: #fff3e0; border: 1px solid #ffb74d; border-radius: 8px; padding: 15px 20px; margin: 20px 0; text-align: center; color: #e65100; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #777; font-size: 13px; border-top: 1px solid #e0e0e0; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hello <strong>${data.patientName}</strong>,</h1>
          <p>7-Day Post-Consultation Recovery Review</p>
        </div>

        <div class="content">
          <p>
It’s been a week since your consultation, and we wanted to check in on how you're doing.

Hope your symptoms have improved/fully resolved?
If you need further medical support or clarification, kindly reach out. 

Your continued well-being is important to us. If you're not feeling fully recovered or would like a follow-up consultation, you can easily book one through the app.

We are always here to support you every step of the way.
       </p>

          <div class="recovery-card">
            <div class="recovery-label">Days Since Your Consultation</div>
            <div class="recovery-days">7</div>
            <div class="recovery-sub">
              ${new Date(data.consultationDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div class="consultation-info">
            <div class="detail-row">
              <span class="detail-label">Consultation Date</span>
              <span class="detail-value">
                ${new Date(data.consultationDate).toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div class="checklist">
            <div class="checklist-title">📋 Recovery Evaluation</div>
            <div class="checklist-item">🔍 <span>Have you fully recovered, or are symptoms still present?</span></div>
            <div class="checklist-item">💊 <span>Have you completed your full medication course as prescribed?</span></div>
            <div class="checklist-item">🩺 <span>Do you feel you need to speak with a doctor again?</span></div>
            <div class="checklist-item">📈 <span>Has your overall health improved since your consultation?</span></div>
          </div>

          <div class="alert-banner">
            ⚠️ If symptoms persist or have worsened, please book a follow-up consultation immediately
          </div>

          <p style="font-size: 14px; color: #555;">
            Your health and wellbeing matter to us. Whether you have fully recovered or still need support, 
            our doctors are always here for you.
          </p>

          <div class="cta-section">
            <a href="#" class="cta-button">Book a Follow-Up</a>
            <a href="#" class="cta-button-outline">I've Fully Recovered ✓</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Jigicare. All rights reserved.</p>
          <p>This is an automated follow-up notification from your care team.</p>
        </div>
      </div>
    </body>
  </html>
`;
  }
}
