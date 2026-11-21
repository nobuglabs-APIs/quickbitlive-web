/**
 * QuickBit Live API TypeScript Schema Definitions
 * Derived directly from OpenAPI 3.1.0 specification (https://api.quickbit.live/openapi.json)
 */

export type ProjectType =
  | 'saas'
  | 'ecommerce'
  | 'banking'
  | 'news'
  | 'social'
  | 'healthtech'
  | 'edtech'
  | 'fintech'
  | 'gaming'
  | 'marketplace'
  | 'logistics'
  | 'telecom'
  | 'govtech'
  | 'insurance'
  | 'real_estate'
  | 'media'
  | 'enterprise'
  | 'nonprofit'
  | 'other';

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export type IrisSkin =
  | 'default'
  | 'saas'
  | 'golden'
  | 'detective'
  | 'astronaut'
  | 'cyberpunk'
  | 'steampunk'
  | 'doctor'
  | 'gamer'
  | 'singer'
  | 'electrician'
  | 'model'
  | 'christmas'
  | 'death'
  | 'reaper'
  | 'halloween'
  | 'toy'
  | 'wizard'
  | string;

export type IrisTone = 'friendly' | 'professional' | 'witty' | 'empathetic' | 'concise' | string;
export type IrisFormality = 'casual' | 'formal' | 'balanced' | string;

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  email_verified?: boolean;
  is_active?: boolean;
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  website?: string | null;
  created_at?: string;
}

export interface OrganizationUpdate {
  name?: string | null;
  logo_url?: string | null;
  description?: string | null;
  website?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  organization_id?: string;
  logo_url?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  project_type: ProjectType;
  custom_project_type?: string | null;
  url?: string | null;
  description?: string | null;
  max_users?: number | null;
  industry?: string | null;
  region?: string | null;
  mission?: string | null;
  vision?: string | null;
  values?: string | null;
  founded_year?: number | null;
  company_size?: string | null;
  logo_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectCreate {
  name: string;
  project_type?: ProjectType;
  custom_project_type?: string | null;
  url?: string | null;
  description?: string | null;
  max_users?: number | null;
  industry?: string | null;
  region?: string | null;
  mission?: string | null;
  vision?: string | null;
  values?: string | null;
  founded_year?: number | null;
  company_size?: string | null;
}

export interface ProjectUpdate {
  name?: string | null;
  project_type?: ProjectType | null;
  custom_project_type?: string | null;
  url?: string | null;
  description?: string | null;
  max_users?: number | null;
  industry?: string | null;
  region?: string | null;
  mission?: string | null;
  vision?: string | null;
  values?: string | null;
  founded_year?: number | null;
  company_size?: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user?: User | null;
  organization?: Organization | null;
  workspace?: Workspace | null;
  two_factor_required?: boolean;
  email?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface VerifyTwoFactorRequest {
  email: string;
  code: string;
}

export interface ResendTwoFactorRequest {
  email: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UpdateMeRequest {
  full_name?: string | null;
  avatar_url?: string | null;
}

export interface WorkspaceCreate {
  name: string;
  logo_url?: string | null;
  description?: string | null;
}

export interface WorkspaceUpdate {
  name?: string | null;
  logo_url?: string | null;
  description?: string | null;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  email?: string;
  full_name?: string | null;
  user?: User;
  created_at?: string;
}

export interface MemberInvite {
  email: string;
  role?: WorkspaceMemberRole | string;
}

export interface InviteInfo {
  id: string;
  workspace_id: string;
  email: string;
  role: WorkspaceMemberRole | string;
  token?: string;
  created_at?: string;
  expires_at?: string;
}

export interface ApiKeyCreate {
  name: string;
  project_id: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  workspace_id: string;
  project_id?: string | null;
  key?: string | null;
  active: boolean;
  created_at?: string;
}

export interface SignalRequest {
  project_id: string;
  source: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface Signal {
  id: string;
  project_id: string;
  workspace_id?: string;
  source: string;
  content: string;
  metadata?: Record<string, any>;
  cluster_id?: string | null;
  sentiment?: string | null;
  classification?: string | null;
  received_at?: string | null;
  created_at?: string | null;
  updated_at?: string;
}

export interface Cluster {
  id: string;
  project_id?: string;
  workspace_id?: string;
  title?: string;
  name?: string;
  topic?: string;
  summary?: string;
  description?: string;
  signal_count?: number;
  count?: number;
  signals?: Signal[];
  signal_ids?: string[];
  related_signals?: Signal[] | string[];
  evidence?: Array<Signal | string | Record<string, any>>;
  sentiment?: string;
  confidence?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Insight {
  id: string;
  project_id?: string;
  workspace_id?: string;
  type?: string;
  title: string;
  description?: string;
  content?: string;
  confidence?: number;
  evidence_count?: number;
  signals_count?: number;
  evidence?: Array<{ text?: string; source?: string; signal_id?: string } | string>;
  impact?: 'high' | 'medium' | 'low' | string;
  sentiment?: string;
  recommendations?: string[];
  created_at?: string;
}

export interface Recommendation {
  id: string;
  project_id?: string;
  workspace_id?: string;
  title: string;
  description?: string;
  category?: string;
  priority?: number | string;
  demand?: number | string;
  demand_score?: number | string;
  impact?: string;
  confidence?: number;
  status?: string;
  rationale?: string;
  mrr_impact?: string | number;
  effort?: string | number;
  action?: string;
  reason?: string;
  expected_impact?: number;
  risk?: number;
  created_at?: string;
}

export interface Decision {
  id: string;
  project_id?: string;
  workspace_id?: string;
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'executed' | 'resolved' | string;
  solved?: boolean | null;
  outcome?: string | null;
  recommendation_id?: string;
  created_at?: string;
  executed_at?: string;
  rank?: number;
  score?: number;
  priority?: 'high' | 'medium' | 'low' | string;
  confidence?: number;
  version?: number;
  reason?: string;
  root_cause?: string | null;
  rationale?: string | null;
  narrative?: {
    title?: string;
    executive_summary?: string;
    what_happened?: string;
    why_it_matters?: string;
    recommended_action?: string;
    confidence_statement?: string;
    risks?: string[];
  } | null;
  recommendation?: {
    id?: string;
    title?: string;
    priority?: 'high' | 'medium' | 'low' | string;
    action?: string;
    reason?: string;
    confidence?: number;
  } | null;
}

export interface DecisionOutcomeRequest {
  solved: boolean;
  outcome?: string | null;
}

export interface HistoryItem {
  id: string;
  project_id?: string | null;
  cluster_title?: string | null;
  decision_reason?: string | null;
  problem_key: string;
  action?: string | null;
  solved?: boolean;
  outcome?: string | null;
  attempts?: number;
  successes?: number;
  success_rate?: number;
  confidence?: number;
  resolved_at?: string | null;
  created_at?: string | null;
  [key: string]: any;
}

export interface Snapshot {
  total_signals?: number;
  active_clusters?: number;
  insights_count?: number;
  recommendations_count?: number;
  resolved_decisions?: number;
  health_score?: number;
  key_findings?: string[];
  recent_activity?: Array<{
    type: string;
    timestamp: string;
    description: string;
  }>;
  summary?: string;
  [key: string]: any;
}

export interface TrendItem {
  date?: string;
  period?: string;
  count?: number;
  volume?: number;
  sentiment_score?: number;
  topic?: string;
  [key: string]: any;
}

export interface PatternItem {
  id?: string;
  pattern_name?: string;
  frequency?: number;
  description?: string;
  first_seen?: string;
  last_seen?: string;
  [key: string]: any;
}

export interface CaseItem {
  id: string;
  title?: string;
  summary?: string;
  description?: string;
  status?: string;
  severity?: 'high' | 'medium' | 'low' | string;
  root_cause?: string;
  signals_count?: number;
  created_at?: string;
  [key: string]: any;
}

export interface EventItem {
  id?: string;
  event_type?: string;
  description?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
  [key: string]: any;
}

export interface IrisColors {
  primary?: string;
  primaryDark?: string;
  body?: string;
  screen?: string;
  screenGlow?: string;
  shadow?: string;
  groundShadow?: string;
  pink?: string;
  yellow?: string;
  orange?: string;
}

export interface IrisPersonality {
  greeting?: string;
  tone?: IrisTone;
  formality?: IrisFormality;
  language?: string;
}

export interface IrisAnimations {
  idle?: boolean;
  particles?: boolean;
  blink?: boolean;
}

export interface IrisConfig {
  skin?: IrisSkin;
  colors?: IrisColors;
  personality?: IrisPersonality;
  mood_default?: 'happy' | 'neutral' | 'playful' | 'cool' | string;
  animations?: IrisAnimations;
  custom_css?: string | null;
}

export interface IrisConfigResponse {
  project_id?: string;
  iris: IrisConfig | null;
  message?: string;
}

export interface RAGQueryRequest {
  project_id: string;
  question: string;
  k?: number;
}

export interface RAGQueryResponse {
  answer?: string;
  context?: string;
  sources?: Array<Record<string, any>>;
  lang?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  filename: string;
  title?: string;
  file_size?: number;
  status?: 'pending' | 'processing' | 'indexed' | 'ready' | 'failed' | string;
  chunks_count?: number;
  created_at?: string;
}

export interface ApiError {
  status: number;
  message: string;
  detail?: string | any;
}
