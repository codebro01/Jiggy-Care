export interface EmailJobData {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
  }>;
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  CAMPAIGN_CREATED = 'campaign-created',
  CAMPAIGN_APPROVED = 'campaign-approved',
  CAMPAIGN_REJECTED = 'campaign-rejected',
  PASSWORD_RESET = 'password-reset',
  EMAIL_VERIFICATION = 'email-verification',
  APPOINTMENT_SUMMARY = 'appointment-summary',
  CONSULTANT_APPOINTMENT_SUMMARY = 'consultant-appointment-summary',
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface WelcomeTemplateData {
  name: string;
  email: string;
}

export interface CampaignCreatedTemplateData {
  campaignName: string;
  packageType: string;
  startDate: string;
}

export interface CampaignApprovedTemplateData {
  campaignName: string;
  campaignId: string;
}
export interface appointmentSummaryTemplateData {
  invoiceNo: string;
  appointmentDate: Date;
  amountPaid: number;
  consultantName: string; 
  invoiceStatus: string;
}
export interface consultantAppointmentSummaryTemplateData {
  consultantName: string;
  patientName: string;
  appointmentDate: Date;
  appointmentId: string; 
  notes?: string;
}



export interface PasswordResetTemplateData {
  resetCode: string;
}

export interface EmailVerificationTemplateData {
  verificationCode: string;
  name: string;
}

export type EmailTemplateData =
  | WelcomeTemplateData
  | CampaignCreatedTemplateData
  | CampaignApprovedTemplateData
  | PasswordResetTemplateData
  | EmailVerificationTemplateData;
