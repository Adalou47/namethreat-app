export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type MspsRow = {
  id: string;
  name: string | null;
  website: string | null;
  logo_url: string | null;
  white_label_domain: string | null;
  white_label_name: string | null;
  billing_status: string | null;
  subscription_plan: string | null;
  country: string | null;
  phone: string | null;
  tax_id: string | null;
  tax_country: string | null;
  tax_exempt: boolean | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type OrganisationsRow = {
  id: string;
  msp_id: string | null;
  name: string | null;
  domain: string | null;
  country: string | null;
  timezone: string | null;
  language: string | null;
  industry: string | null;
  size_band: string | null;
  customer_type: "msp_managed" | "direct_smb" | "direct_midmarket" | "enterprise" | null;
  compliance_frameworks: Json | null;
  subscription_plan: string | null;
  subscription_seats: number | null;
  current_seats_used: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  white_label_name: string | null;
  tax_id: string | null;
  tax_country: string | null;
  tax_exempt: boolean | null;
  billing_status: string | null;
  onboarding_complete: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UsersRow = {
  id: string;
  clerk_user_id: string;
  organisation_id: string | null;
  msp_id: string | null;
  email: string | null;
  full_name: string | null;
  job_title: string | null;
  department: string | null;
  country: string | null;
  language: string | null;
  phone: string | null;
  role: string | null;
  risk_score: number | null;
  is_imported: boolean | null;
  entra_id: string | null;
  google_id: string | null;
  manager_id: string | null;
  last_trained_at: string | null;
  last_phished_at: string | null;
  last_active: string | null;
  onboarding_complete: boolean | null;
  is_active: boolean | null;
  preferred_contact: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PhishingCampaignsRow = {
  id: string;
  organisation_id: string | null;
  msp_id: string | null;
  name: string | null;
  status: string | null;
  template_id: string | null;
  sending_domain_id: string | null;
  target_country: string | null;
  target_department: string | null;
  target_difficulty: string | null;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  total_targets: number | null;
  total_sent: number | null;
  total_opened: number | null;
  total_clicked: number | null;
  total_reported: number | null;
  open_rate: number | null;
  click_rate: number | null;
  report_rate: number | null;
  created_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type PhishingResultsRow = {
  id: string;
  campaign_id: string;
  user_id: string;
  organisation_id: string;
  email_sent_at: string | null;
  email_opened_at: string | null;
  link_clicked_at: string | null;
  credentials_submitted_at: string | null;
  reported_at: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
};

export type PhishingTemplatesRow = {
  id: string;
  name: string | null;
  category: string | null;
  target_country: string | null;
  target_industry: string | null;
  language: string | null;
  subject: string | null;
  sender_name: string | null;
  preview_text: string | null;
  body_html: string | null;
  landing_page_html: string | null;
  difficulty: string | null;
  is_global: boolean | null;
  is_published: boolean | null;
  tags: Json | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SendingDomainsRow = {
  id: string;
  domain: string | null;
  registrar: string | null;
  registered_at: string | null;
  expires_at: string | null;
  status: string | null;
  warming_started_at: string | null;
  activated_at: string | null;
  aws_identity_arn: string | null;
  spf_configured: boolean | null;
  dmarc_configured: boolean | null;
  daily_send_limit: number | null;
  emails_sent_today: number | null;
  emails_sent_total: number | null;
  last_used_at: string | null;
  last_checked_at: string | null;
  reputation_score: number | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CampaignDeliveriesRow = {
  id: string;
  campaign_id: string | null;
  user_id: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  credentials_submitted: boolean | null;
  reported_at: string | null;
  outcome: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type CoursesRow = {
  id: string;
  name: string | null;
  description: string | null;
  industry: string | null;
  language: string | null;
  country: string | null;
  difficulty: string | null;
  duration_minutes: number | null;
  thumbnail_url: string | null;
  is_published: boolean | null;
  version: string | null;
  created_by: string | null;
  last_reviewed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type NotificationsRow = {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  type: string | null;
  title: string | null;
  body: string | null;
  read_at: string | null;
  action_url: string | null;
  created_at: string | null;
};

export type RiskScoreEventsRow = {
  id: string;
  user_id: string | null;
  organisation_id: string | null;
  event_type: string | null;
  score_impact: number | null;
  score_before: number | null;
  score_after: number | null;
  reference_id: string | null;
  reference_type: string | null;
  notes: string | null;
  created_at: string | null;
};

export type ReportsRow = {
  id: string;
  organisation_id: string | null;
  report_type: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string | null;
  generated_at: string | null;
  generated_by_user_id: string | null;
  file_url: string | null;
  report_data_json: Json | null;
  created_at: string | null;
  updated_at: string | null;
};

export type IntegrationsRow = {
  id: string;
  organisation_id: string | null;
  integration_type: string | null;
  status: string | null;
  config_json: Json | null;
  last_used_at: string | null;
  connected_at: string | null;
  connected_by_user_id: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type SyncLogsRow = {
  id: string;
  organisation_id: string | null;
  integration_id: string | null;
  sync_type: string | null;
  users_added: number | null;
  users_updated: number | null;
  users_deactivated: number | null;
  status: string | null;
  error_log: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      msps: {
        Row: MspsRow;
        Insert: {
          id?: string;
          name?: string | null;
          website?: string | null;
          logo_url?: string | null;
          white_label_domain?: string | null;
          white_label_name?: string | null;
          billing_status?: string | null;
          subscription_plan?: string | null;
          country?: string | null;
          phone?: string | null;
          tax_id?: string | null;
          tax_country?: string | null;
          tax_exempt?: boolean | null;
          notes?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<MspsRow>;
        Relationships: [];
      };
      organisations: {
        Row: OrganisationsRow;
        Insert: {
          id?: string;
          msp_id?: string | null;
          name?: string | null;
          domain?: string | null;
          country?: string | null;
          timezone?: string | null;
          language?: string | null;
          industry?: string | null;
          size_band?: string | null;
          customer_type?: "msp_managed" | "direct_smb" | "direct_midmarket" | "enterprise" | null;
          compliance_frameworks?: Json | null;
          subscription_plan?: string | null;
          subscription_seats?: number | null;
          current_seats_used?: number | null;
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          white_label_name?: string | null;
          tax_id?: string | null;
          tax_country?: string | null;
          tax_exempt?: boolean | null;
          billing_status?: string | null;
          onboarding_complete?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<OrganisationsRow>;
        Relationships: [];
      };
      users: {
        Row: UsersRow;
        Insert: {
          id?: string;
          clerk_user_id: string;
          organisation_id?: string | null;
          msp_id?: string | null;
          email?: string | null;
          full_name?: string | null;
          job_title?: string | null;
          department?: string | null;
          country?: string | null;
          language?: string | null;
          phone?: string | null;
          role?: string | null;
          risk_score?: number | null;
          is_imported?: boolean | null;
          entra_id?: string | null;
          google_id?: string | null;
          manager_id?: string | null;
          last_trained_at?: string | null;
          last_phished_at?: string | null;
          last_active?: string | null;
          onboarding_complete?: boolean | null;
          is_active?: boolean | null;
          preferred_contact?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<UsersRow>;
        Relationships: [];
      };
      phishing_campaigns: {
        Row: PhishingCampaignsRow;
        Insert: { [K in keyof PhishingCampaignsRow]?: PhishingCampaignsRow[K] };
        Update: Partial<PhishingCampaignsRow>;
        Relationships: [];
      };
      phishing_results: {
        Row: PhishingResultsRow;
        Insert: { [K in keyof PhishingResultsRow]?: PhishingResultsRow[K] };
        Update: Partial<PhishingResultsRow>;
        Relationships: [];
      };
      phishing_templates: {
        Row: PhishingTemplatesRow;
        Insert: { [K in keyof PhishingTemplatesRow]?: PhishingTemplatesRow[K] };
        Update: Partial<PhishingTemplatesRow>;
        Relationships: [];
      };
      sending_domains: {
        Row: SendingDomainsRow;
        Insert: { [K in keyof SendingDomainsRow]?: SendingDomainsRow[K] };
        Update: Partial<SendingDomainsRow>;
        Relationships: [];
      };
      campaign_deliveries: {
        Row: CampaignDeliveriesRow;
        Insert: { [K in keyof CampaignDeliveriesRow]?: CampaignDeliveriesRow[K] };
        Update: Partial<CampaignDeliveriesRow>;
        Relationships: [];
      };
      courses: {
        Row: CoursesRow;
        Insert: {
          id?: string;
          name?: string | null;
          description?: string | null;
          industry?: string | null;
          language?: string | null;
          country?: string | null;
          difficulty?: string | null;
          duration_minutes?: number | null;
          thumbnail_url?: string | null;
          is_published?: boolean | null;
          version?: string | null;
          created_by?: string | null;
          last_reviewed_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<CoursesRow>;
        Relationships: [];
      };
      notifications: {
        Row: NotificationsRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          organisation_id?: string | null;
          type?: string | null;
          title?: string | null;
          body?: string | null;
          read_at?: string | null;
          action_url?: string | null;
          created_at?: string | null;
        };
        Update: Partial<NotificationsRow>;
        Relationships: [];
      };
      risk_score_events: {
        Row: RiskScoreEventsRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          organisation_id?: string | null;
          event_type?: string | null;
          score_impact?: number | null;
          score_before?: number | null;
          score_after?: number | null;
          reference_id?: string | null;
          reference_type?: string | null;
          notes?: string | null;
          created_at?: string | null;
        };
        Update: Partial<RiskScoreEventsRow>;
        Relationships: [];
      };
      reports: {
        Row: ReportsRow;
        Insert: {
          id?: string;
          organisation_id?: string | null;
          report_type?: string | null;
          period_start?: string | null;
          period_end?: string | null;
          status?: string | null;
          generated_at?: string | null;
          generated_by_user_id?: string | null;
          file_url?: string | null;
          report_data_json?: Json | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<ReportsRow>;
        Relationships: [];
      };
      integrations: {
        Row: IntegrationsRow;
        Insert: {
          id?: string;
          organisation_id?: string | null;
          integration_type?: string | null;
          status?: string | null;
          config_json?: Json | null;
          last_used_at?: string | null;
          connected_at?: string | null;
          connected_by_user_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<IntegrationsRow>;
        Relationships: [];
      };
      sync_logs: {
        Row: SyncLogsRow;
        Insert: {
          id?: string;
          organisation_id?: string | null;
          integration_id?: string | null;
          sync_type?: string | null;
          users_added?: number | null;
          users_updated?: number | null;
          users_deactivated?: number | null;
          status?: string | null;
          error_log?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
        };
        Update: Partial<SyncLogsRow>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

