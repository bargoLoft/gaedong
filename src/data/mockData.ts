// ============================================================
// ConSentient — Mock Data (Korean Welfare Context)
// ============================================================

import { MockDataSet, AgentInfo } from '@/types';

export const MOCK_DATASET: MockDataSet = {
  fileName: '2024_복지급여_신청서_김복순.pdf',
  complianceScore: 72,

  // ──────────────────────────────────────────────
  // Section A: Extract Agent Output
  // ──────────────────────────────────────────────
  extractedItems: [
    // General Data — Blue
    { id: 'e1', label: '성명', value: '김복순', category: 'general' },
    { id: 'e2', label: '연락처', value: '010-1234-5678', category: 'general' },
    { id: 'e3', label: '주소', value: '서울특별시 관악구 신림동 123-45', category: 'general' },
    { id: 'e4', label: '이메일', value: 'boksunik@example.com', category: 'general' },
    { id: 'e5', label: '긴급연락처', value: '010-9876-5432 (배우자)', category: 'general' },

    // Sensitive Data — Orange
    { id: 'e6', label: '건강 상태', value: '당뇨병 2형, 고혈압 (만성질환)', category: 'sensitive' },
    { id: 'e7', label: '장애 여부', value: '지체장애 3급', category: 'sensitive' },
    { id: 'e8', label: '소득 수준', value: '월 820,000원 (중위소득 30% 이하)', category: 'sensitive' },
    { id: 'e9', label: '가족 구성', value: '한부모가정 (자녀 1명, 만 11세)', category: 'sensitive' },

    // Unique Identifier — Red
    { id: 'e10', label: '주민등록번호', value: '6****-2******', category: 'unique_id' },
  ],

  // ──────────────────────────────────────────────
  // Section B: Generation Agent Output
  // ──────────────────────────────────────────────
  consentClauses: [
    {
      id: 'c1',
      type: 'purpose',
      title: '1. 개인정보 수집·이용 목적',
      content: `본 기관(사단법인 희망나눔복지센터)은 「사회복지사업법」 제33조의3 및 「개인정보 보호법」 제15조에 따라 아래와 같은 목적으로 귀하의 개인정보를 수집·이용합니다.

▶ 복지급여 신청 자격 심사 및 결정
▶ 복지서비스 제공 및 사례관리
▶ 대상자 확인 및 수급 이력 관리
▶ 관련 법령에 따른 통계 및 보고

수집된 개인정보는 위의 목적 이외의 용도로는 이용되지 않으며, 목적이 변경될 경우 별도 동의를 받겠습니다.`,
    },
    {
      id: 'c2',
      type: 'items',
      title: '2. 수집하는 개인정보 항목',
      content: `【일반 개인정보】
• 성명, 연락처(전화번호, 이메일), 주소, 긴급연락처

【민감정보】 ※ 별도 동의란 참조
• 건강 상태 (질병명, 진단내용)
• 장애 정도 및 유형
• 소득 수준 및 재산 현황
• 가족 구성 및 가구 형태

【고유식별정보】 ※ 법적 근거 검토 필요
• 주민등록번호 (「사회복지사업법」 제33조의3 근거 필요)`,
      relatedRiskId: 'r1',
    },
    {
      id: 'c3',
      type: 'retention',
      title: '3. 개인정보 보유·이용 기간',
      content: `수집된 개인정보는 서비스 목적 달성 후 즉시 파기함을 원칙으로 합니다.

• 복지급여 수급 기간 동안 + 수급 종료 후 5년
  ※ 「사회복지사업법」 제45조에 따른 보조금 정산 보존 기간 적용

단, 관계 법령의 규정에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보유합니다.`,
      relatedRiskId: 'r2',
    },
    {
      id: 'c4',
      type: 'refusal_rights',
      title: '4. 동의 거부 권리 및 불이익',
      content: `귀하는 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.

【동의 거부 시 불이익】
동의 거부 시 복지급여 신청이 제한될 수 있으며, 관련 서비스를 제공받기 어려울 수 있습니다. 단, 서비스 신청과 직접적인 관련이 없는 선택 항목의 경우 동의 거부로 인한 불이익이 없습니다.

【정보주체의 권리】
귀하는 언제든지 개인정보 열람, 정정·삭제, 처리 정지를 요청할 수 있습니다.
• 개인정보 보호 담당자: 복지센터 개인정보담당자 (02-123-4567)
• 이의가 있으시면 개인정보보호위원회(privacy.go.kr)에 신고하실 수 있습니다.`,
    },
    {
      id: 'c5',
      type: 'sensitive_separate',
      title: '【별도 동의】 민감정보 수집·이용 동의',
      content: `「개인정보 보호법」 제23조에 따라 민감정보(건강 상태, 장애 여부, 소득 수준, 가족 구성)는 일반 개인정보와 별도로 동의를 받습니다.

수집 목적: 복지급여 수급 자격 심사 및 맞춤형 복지서비스 제공
보유 기간: 서비스 종료 후 5년

□ 위 민감정보 수집·이용에 동의합니다.
□ 위 민감정보 수집·이용에 동의하지 않습니다. (서비스 이용 제한될 수 있음)`,
      isSensitiveBox: true,
      relatedRiskId: 'r3',
    },
    {
      id: 'c6',
      type: 'legal_representative',
      title: '【법정대리인 동의】 만 14세 미만 아동 개인정보 처리',
      content: `신청 가구 내 만 14세 미만 아동(만 11세 자녀)의 개인정보 처리에 대해 법정대리인(부모/후견인)의 동의가 필요합니다.

「개인정보 보호법」 제22조의2에 따라 만 14세 미만 아동의 개인정보를 처리하기 위해서는 법정대리인의 동의가 필수입니다.

법정대리인 성명: _______________
관계: _______________
서명/날인: _______________          일자: _____ 년 _____ 월 _____ 일`,
      isLegalRepBox: true,
    },
  ],

  // ──────────────────────────────────────────────
  // Section C: Audit Agent Output
  // ──────────────────────────────────────────────
  riskAlerts: [
    {
      id: 'r1',
      severity: 'critical',
      title: '[위험] 주민등록번호 처리 법적 근거 미비',
      description:
        '주민등록번호(고유식별정보)가 신청서에서 감지되었습니다. 「개인정보 보호법」 제24조에 따라 주민등록번호 처리는 법령에서 구체적으로 허용하는 경우에만 가능합니다. 현재 동의서에 명시된 법적 근거(사회복지사업법 §33의3)만으로는 충분하지 않을 수 있습니다.',
      action:
        '권장 조치: 주민등록번호 대신 생년월일로 대체하거나, 법령상 처리 근거(예: 사회복지사업법 시행령 §11의3)를 명확히 적시하세요.',
      relatedClauseId: 'c2',
    },
    {
      id: 'r2',
      severity: 'recommendation',
      title: '[권장] 보유기간 기준치 초과',
      description:
        '동의서에 명시된 보유기간(수급 종료 후 5년)이 행정안전부 표준 가이드라인(동종 사업 기준 1년)을 초과합니다. 과도한 보유기간은 개인정보 최소 수집 원칙(「개인정보 보호법」 §3①)에 위배될 수 있습니다.',
      action:
        '권장 조치: 보조금 정산 요건이 필요한 경우 그 근거 조항을 명시하거나, 보유기간을 사업 종료 후 1년으로 단축하는 것을 검토하세요.',
      relatedClauseId: 'c3',
    },
    {
      id: 'r3',
      severity: 'pass',
      title: '[적합] 민감정보 별도 동의란 구조 검증',
      description:
        '「개인정보 보호법」 제23조 요건에 따라 민감정보(건강 상태, 장애 여부, 소득 수준)에 대한 별도 동의란이 올바르게 구성되었습니다. 일반 개인정보와 명확히 분리되어 있으며, 거부 시 불이익도 적절히 고지되어 있습니다.',
      relatedClauseId: 'c5',
    },
  ],
};

// ──────────────────────────────────────────────
// Agent Pipeline Configuration
// ──────────────────────────────────────────────
export const AGENTS: AgentInfo[] = [
  {
    id: 'extract',
    name: 'Extract Agent',
    emoji: '🔵',
    color: 'blue',
    description: '에이전트 대기 중',
    runningDescription: 'PDF 구조 파싱 및 개인정보 항목 추출 중...',
    status: 'pending',
    durationMs: 2000,
  },
  {
    id: 'generation',
    name: 'Generation Agent',
    emoji: '🟣',
    color: 'purple',
    description: '에이전트 대기 중',
    runningDescription: '개인정보 보호법 준수 동의서 초안 작성 중...',
    status: 'pending',
    durationMs: 2500,
  },
  {
    id: 'audit',
    name: 'Audit Agent',
    emoji: '🔴',
    color: 'red',
    description: '에이전트 대기 중',
    runningDescription: '위험 항목 교차 검증 및 법적 근거 감사 중...',
    status: 'pending',
    durationMs: 2000,
  },
];
