export type ExamLevel = "UG" | "PG" | "UG & PG";

export type ExamCategory =
  | "Engineering"
  | "University admissions"
  | "Medical & health"
  | "Postgraduate study";

export type ExamApplicationCode =
  | "open"
  | "opening-soon"
  | "closed"
  | "not-published";

export type ExamDateKind =
  | "registration-open"
  | "registration-close"
  | "admit-card"
  | "examination"
  | "result"
  | "counselling"
  | "admission";

export type ExamDateStatus = "upcoming" | "past" | "not-published";

export interface ExamDate {
  id: string;
  kind: ExamDateKind;
  label: string;
  date: string | null;
  endDate?: string | null;
  status: ExamDateStatus;
  note?: string;
  isDemo: boolean;
}

export type EligibilityFieldKey =
  | "educationLevel"
  | "percentage"
  | "stream"
  | "passingYear"
  | "category"
  | (string & {});

export type EligibilityRuleOperator =
  | "equals"
  | "one-of"
  | "at-least"
  | "between"
  | "is-true";

export interface EligibilityRule {
  id: string;
  field: EligibilityFieldKey;
  operator: EligibilityRuleOperator;
  value: string | number | boolean | (string | number | boolean)[];
  label: string;
  required: boolean;
  note?: string;
  isDemo: boolean;
}

export type EligibilityFieldType = "select" | "boolean";

export interface EligibilityFieldOption {
  value: string;
  label: string;
}

export interface EligibilityField {
  id: EligibilityFieldKey;
  label: string;
  type: EligibilityFieldType;
  options?: EligibilityFieldOption[];
  required: boolean;
  helpText?: string;
}

export type ExamSourceKind =
  | "official-notice"
  | "application-portal"
  | "counselling-portal";

export type ExamSourceVerification = "verified" | "needs-review" | "demo";

export interface ExamSource {
  id: string;
  title: string;
  publisher: string;
  url: string | null;
  kind: ExamSourceKind;
  verificationStatus: ExamSourceVerification;
  note?: string;
  isDemo: boolean;
}

export interface ExamApplicationStatus {
  code: ExamApplicationCode;
  label: string;
  note?: string;
}

export interface Exam {
  id: string;
  slug: string;
  name: string;
  shortName?: string;
  category: ExamCategory;
  level: ExamLevel;
  summary: string;
  description: string;
  conductingBody: string;
  applicationStatus: ExamApplicationStatus;
  dates: ExamDate[];
  eligibilityRules: EligibilityRule[];
  eligibilityFields: EligibilityField[];
  sources: ExamSource[];
  verificationStatus: ExamSourceVerification;
  verificationNote: string;
  isDemo: boolean;
}

export interface EligibilityProfile {
  educationLevel: string;
  percentage: number | null;
  stream: string;
  passingYear: number | null;
  category: string;
  examSpecific: Record<string, string | boolean>;
}

export type EligibilityResultStatus =
  | "eligible"
  | "not-eligible"
  | "insufficient-information";

export interface EligibilityResult {
  status: EligibilityResultStatus;
  reasons: string[];
  missingFields: EligibilityFieldKey[];
  evaluatedRuleIds: string[];
  disclaimer: string;
}
