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
  customer_type: "msp" | "direct" | null;
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
          customer_type?: "msp" | "direct" | null;
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
        Insert: {
          id?: string;
          organisation_id?: string | null;
          msp_id?: string | null;
          name?: string | null;
          status?: string | null;
          template_id?: string | null;
          sending_domain_id?: string | null;
          target_country?: string | null;
          target_department?: string | null;
          target_difficulty?: string | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          total_targets?: number | null;
          total_sent?: number | null;
          total_opened?: number | null;
          total_clicked?: number | null;
          total_reported?: number | null;
          open_rate?: number | null;
          click_rate?: number | null;
          report_rate?: number | null;
          created_by_user_id?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<PhishingCampaignsRow>;
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

