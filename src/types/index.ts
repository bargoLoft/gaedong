// ============================================================
// ConSentient — Core TypeScript Type Definitions
// ============================================================

export type DataCategory = 'general' | 'sensitive' | 'unique_id';

export interface ExtractedItem {
  id: string;
  label: string;
  value: string;
  category: DataCategory;
  highlighted?: boolean;
}

export type ConsentClauseType =
  | 'purpose'
  | 'items'
  | 'retention'
  | 'refusal_rights'
  | 'sensitive_separate'
  | 'legal_representative';

export interface ConsentClause {
  id: string;
  title: string;
  content: string;
  type: ConsentClauseType;
  relatedRiskId?: string;
  isSensitiveBox?: boolean;
  isLegalRepBox?: boolean;
}

export type RiskSeverity = 'critical' | 'recommendation' | 'pass';

export interface RiskAlert {
  id: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  action?: string;
  relatedClauseId?: string;
}

export type AgentStatusType = 'pending' | 'running' | 'completed';

export interface AgentInfo {
  id: 'extract' | 'generation' | 'audit';
  name: string;
  emoji: string;
  color: string;
  description: string;
  runningDescription: string;
  status: AgentStatusType;
  durationMs: number;
}

export type AppStep = 1 | 2 | 3;

export interface MockDataSet {
  fileName: string;
  extractedItems: ExtractedItem[];
  consentClauses: ConsentClause[];
  riskAlerts: RiskAlert[];
  complianceScore: number;
}
