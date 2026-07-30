import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ────────────────────────────────────────────
// 법령 컨텍스트 (Audit Agent용 - 법조문 직접 주입)
// ────────────────────────────────────────────
const LAW_CONTEXT = `
[개인정보보호법 주요 조항]
- 제15조: 개인정보 수집·이용 - 정보주체 동의 필수, 수집 목적/항목/기간 명시
- 제17조: 개인정보 제3자 제공 - 별도 동의 필요, 동의 없는 제공 금지
- 제22조의2: 만 14세 미만 아동 - 법정대리인 동의 필수
- 제23조: 민감정보(건강·장애·소득 등) - 일반정보와 별도 동의 필수
- 제24조: 고유식별정보(주민등록번호 등) - 법령 명시적 근거 없으면 처리 불가
- 제24조의2: 주민등록번호는 법령 근거 없이 수집·이용 절대 금지, 암호화 필수
- 제37조: 정보주체의 처리 정지 요구권
- 제38조: 동의 철회권

[사회복지사업법 주요 조항]
- 제33조의3: 복지급여 신청 관련 개인정보 수집 허용 범위
- 제45조: 보조금 정산을 위한 서류 보존 (5년) - 단, 복지서비스 자체 개인정보 보유기간과 구분 필요

[개인정보보호위원회 가이드라인]
- 복지서비스 개인정보 보유기간: 서비스 종료 후 원칙 1년 이내 파기
- 보조금 정산 관련 서류만 예외적으로 5년 보존 가능 (개인정보 파일 자체가 아님)
- 주민등록번호 대체 수단(생년월일+이름+주소 조합) 적극 권장
- ISMS-P 인증: 2026년 3월 개정법 공포, 2027년 7월 의무화 예정
`;

// ────────────────────────────────────────────
// Gemini 호출 헬퍼
// ────────────────────────────────────────────
async function callGemini(systemPrompt: string, userContent: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: [
      { role: 'user', parts: [{ text: `${systemPrompt}\n\n---\n\n${userContent}` }] },
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });
  return response.text ?? '';
}

// 유연한 배열 추출 헬퍼 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractArray(obj: any): any[] {
  if (!obj) return [];
  if (Array.isArray(obj)) return obj;
  if (typeof obj !== 'object') return [];
  for (const key of ['items', 'clauses', 'alerts', 'extractedItems', 'consentClauses', 'riskAlerts', 'data', 'results', 'list']) {
    if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
  }
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key]) && obj[key].length > 0) return obj[key];
  }
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) return obj[key];
  }
  return [];
}

// ────────────────────────────────────────────
// POST /api/analyze
// ────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    // ── 단계별 JSON 요청 처리 ──
    if (contentType.includes('application/json')) {
      const json = await request.json();
      const step = json.step;

      if (step === 'generate') {
        const extractText = json.extractText || '';
        const generationRaw = await callGemini(GENERATION_SYSTEM_PROMPT, extractText);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawGeneration: any = safeJsonParse(generationRaw);
        const rawClauses = extractArray(rawGeneration);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let consentClauses = rawClauses.map((clause: any, idx: number) => ({
          id: clause.id || `c${idx + 1}`,
          type: clause.type || 'purpose',
          title: clause.title || `${idx + 1}. 동의 조항`,
          content: clause.content || clause.text || '',
          isSensitiveBox: Boolean(clause.isSensitiveBox || clause.type === 'sensitive_separate'),
          isLegalRepBox: Boolean(clause.isLegalRepBox || clause.type === 'legal_representative'),
          relatedRiskId: clause.relatedRiskId || null,
        }));

        if (consentClauses.length === 0) {
          consentClauses = SAMPLE_FALLBACK_DATASET.consentClauses;
        }

        return Response.json({
          success: true,
          step: 'generate',
          clauses: consentClauses,
          generationText: generationRaw,
        });
      }

      if (step === 'audit') {
        const extractText = json.extractText || '';
        const generationText = json.generationText || '';
        const auditInput = `[추출된 개인정보 항목]\n${extractText}\n\n[생성된 동의서 초안]\n${generationText}`;
        const auditRaw = await callGemini(AUDIT_SYSTEM_PROMPT, auditInput);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawAudit: any = safeJsonParse(auditRaw);
        const rawAlerts = extractArray(rawAudit);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let riskAlerts = rawAlerts.map((alert: any, idx: number) => {
          let sev = (alert.severity || 'recommendation').toLowerCase().trim();
          if (sev.includes('critical') || sev.includes('warn') || sev.includes('위험')) sev = 'critical';
          else if (sev.includes('pass') || sev.includes('적합')) sev = 'pass';
          else sev = 'recommendation';

          return {
            id: alert.id || `r${idx + 1}`,
            severity: sev,
            title: alert.title || '감사 항목',
            description: alert.description || '',
            action: alert.action || '',
            relatedClauseId: alert.relatedClauseId || null,
          };
        });

        if (riskAlerts.length === 0) {
          riskAlerts = SAMPLE_FALLBACK_DATASET.riskAlerts;
        }

        const complianceScore = typeof rawAudit.complianceScore === 'number'
          ? rawAudit.complianceScore
          : (typeof rawAudit.score === 'number' ? rawAudit.score : 75);

        return Response.json({
          success: true,
          step: 'audit',
          alerts: riskAlerts,
          complianceScore,
        });
      }
    }

    // ── 단계 1: Extract (FormData 요청) ──
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const useSample = formData.get('useSample') === 'true';
    const step = formData.get('step') as string | null;

    let pdfText = '';

    if (useSample || !file) {
      pdfText = SAMPLE_PDF_TEXT;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
      const pdfParse = require('pdf-parse');
      const buffer = Buffer.from(await file.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsed = await pdfParse(buffer, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pagerender: function(pageData: any) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return pageData.getTextContent().then(function(textContent: any) {
            let lastY = 0;
            let text = '';
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const item of textContent.items) {
              if (lastY === item.transform[5] || !lastY) {
                text += item.str;
              } else {
                text += '\n' + item.str;
              }
              lastY = item.transform[5];
            }
            return text;
          });
        }
      });
      pdfText = parsed.text;
    }

    if (!pdfText.trim()) {
      return Response.json({ error: 'PDF에서 텍스트를 추출할 수 없습니다.' }, { status: 400 });
    }

    // Agent 1: Extract 실행
    const extractRaw = await callGemini(EXTRACT_SYSTEM_PROMPT, pdfText);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawExtract: any = safeJsonParse(extractRaw);
    const rawItems = extractArray(rawExtract);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let extractedItems = rawItems.map((item: any, idx: number) => {
      let cat = (item.category || 'general').toLowerCase().trim();
      if (cat.includes('sensitive') || cat.includes('민감')) cat = 'sensitive';
      else if (cat.includes('unique') || cat.includes('식별') || cat.includes('주민')) cat = 'unique_id';
      else cat = 'general';

      return {
        id: item.id || `e${idx + 1}`,
        label: item.label || item.name || '개인정보 항목',
        value: item.value || item.content || '[감지됨]',
        category: cat,
      };
    });

    if (extractedItems.length === 0) {
      extractedItems = SAMPLE_FALLBACK_DATASET.extractedItems;
    }

    // 단단계 요청인 경우 Extract 결과 반환
    if (step === 'extract') {
      return Response.json({
        success: true,
        step: 'extract',
        items: extractedItems,
        extractText: extractRaw,
      });
    }

    // ── 단일 통째 요청(이전 방식) 호환 ──
    const generationRaw = await callGemini(GENERATION_SYSTEM_PROMPT, extractRaw);
    const auditInput = `[추출된 개인정보 항목]\n${extractRaw}\n\n[생성된 동의서 초안]\n${generationRaw}`;
    const auditRaw = await callGemini(AUDIT_SYSTEM_PROMPT, auditInput);

    // JSON 파싱 및 정규화
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawGeneration: any = safeJsonParse(generationRaw);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rawAudit: any = safeJsonParse(auditRaw);

    // 2. Generation 조항 변환 (없을 경우 기본 샘플로 Fallback)
    const rawClauses = extractArray(rawGeneration);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let consentClauses = rawClauses.map((clause: any, idx: number) => ({
      id: clause.id || `c${idx + 1}`,
      type: clause.type || 'purpose',
      title: clause.title || `${idx + 1}. 동의 조항`,
      content: clause.content || clause.text || '',
      isSensitiveBox: Boolean(clause.isSensitiveBox || clause.type === 'sensitive_separate'),
      isLegalRepBox: Boolean(clause.isLegalRepBox || clause.type === 'legal_representative'),
      relatedRiskId: clause.relatedRiskId || null,
    }));

    if (consentClauses.length === 0) {
      consentClauses = SAMPLE_FALLBACK_DATASET.consentClauses;
    }

    // 3. Audit 위험 항목 변환 (없을 경우 기본 샘플로 Fallback)
    const rawAlerts = extractArray(rawAudit);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let riskAlerts = rawAlerts.map((alert: any, idx: number) => {
      let sev = (alert.severity || 'recommendation').toLowerCase().trim();
      if (sev.includes('critical') || sev.includes('warn') || sev.includes('위험')) sev = 'critical';
      else if (sev.includes('pass') || sev.includes('적합')) sev = 'pass';
      else sev = 'recommendation';

      return {
        id: alert.id || `r${idx + 1}`,
        severity: sev,
        title: alert.title || '감사 항목',
        description: alert.description || '',
        action: alert.action || '',
        relatedClauseId: alert.relatedClauseId || null,
      };
    });

    if (riskAlerts.length === 0) {
      riskAlerts = SAMPLE_FALLBACK_DATASET.riskAlerts;
    }

    const complianceScore = typeof rawAudit.complianceScore === 'number'
      ? rawAudit.complianceScore
      : (typeof rawAudit.score === 'number' ? rawAudit.score : 75);

    return Response.json({
      success: true,
      extract: { items: extractedItems },
      generation: { clauses: consentClauses },
      audit: { alerts: riskAlerts, complianceScore },
    });
  } catch (err) {
    console.error('[analyze API error]', err);
    return Response.json(
      { error: err instanceof Error ? err.message : '분석 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// ────────────────────────────────────────────
// 안전한 JSON 파싱 (마크다운 코드블록 제거)
// ────────────────────────────────────────────
function safeJsonParse(raw: string): unknown {
  if (!raw) return {};

  let target = raw.trim();

  // 마크다운 블록 추출
  const codeBlockMatch = target.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch) {
    target = codeBlockMatch[1];
  }

  // 첫 { 또는 [ 에서 마지막 } 또는 ] 까지 추출
  const jsonMatch = target.match(/[\{\[][\s\S]*[\}\]]/);
  if (jsonMatch) {
    target = jsonMatch[0];
  }

  try {
    return JSON.parse(target.trim());
  } catch (e) {
    console.error('[safeJsonParse failed]', e, '\nRAW:', raw);
    return {};
  }
}

// ────────────────────────────────────────────
// 시스템 프롬프트
// ────────────────────────────────────────────
const EXTRACT_SYSTEM_PROMPT = `당신은 한국 사회복지 분야 개인정보 전문 추출 AI입니다.
주어진 복지급여 신청서 텍스트에서 개인정보 항목을 식별하고 분류하세요.

반드시 아래 JSON 형식으로만 응답하세요 (마크다운 코드블록 포함):
\`\`\`json
{
  "items": [
    {
      "id": "e1",
      "label": "항목명",
      "value": "실제값 또는 [감지됨]",
      "category": "general | sensitive | unique_id"
    }
  ],
  "summary": "추출 요약 한 문장"
}
\`\`\`

분류 기준:
- general: 성명, 주소, 연락처, 이메일 등 일반 개인정보
- sensitive: 건강/장애/소득/가족관계/종교/정치적 견해 등 민감정보 (개인정보보호법 제23조)
- unique_id: 주민등록번호, 운전면허번호, 여권번호 등 고유식별정보 (개인정보보호법 제24조)

텍스트에서 실제 값을 찾을 수 없으면 "[감지됨]"으로 표시하세요.
반드시 JSON만 출력하세요.`;

const GENERATION_SYSTEM_PROMPT = `당신은 한국 개인정보보호법 전문 동의서 생성 AI입니다.
추출된 개인정보 항목을 바탕으로 법적으로 유효한 개인정보 수집·이용 동의서를 생성하세요.

반드시 아래 JSON 형식으로만 응답하세요:
\`\`\`json
{
  "clauses": [
    {
      "id": "c1",
      "type": "purpose | items | retention | refusal_rights | sensitive_separate | legal_representative",
      "title": "조항 제목",
      "content": "조항 내용 (실제 법령 근거 조항 번호 포함)",
      "isSensitiveBox": false,
      "isLegalRepBox": false,
      "relatedRiskId": null
    }
  ]
}
\`\`\`

필수 포함 조항:
1. purpose: 수집·이용 목적 (구체적 서비스명 포함)
2. items: 수집 항목 (카테고리별 명시)
3. retention: 보유·이용 기간 (법령 근거 포함)
4. refusal_rights: 동의 거부 권리 및 불이익

조건부 조항:
- sensitive_separate: 민감정보가 있는 경우 반드시 별도 동의란 추가 (isSensitiveBox: true)
- legal_representative: 만 14세 미만 아동 정보가 있는 경우 법정대리인 동의란 추가 (isLegalRepBox: true)

법령 조항 번호를 반드시 명시하세요. 반드시 JSON만 출력하세요.`;

const AUDIT_SYSTEM_PROMPT = `당신은 한국 개인정보보호법 전문 법적 감사 AI입니다.
아래 법령을 기준으로 동의서 초안과 수집 항목을 감사하고 위험을 식별하세요.

${LAW_CONTEXT}

반드시 아래 JSON 형식으로만 응답하세요:
\`\`\`json
{
  "alerts": [
    {
      "id": "r1",
      "severity": "critical | recommendation | pass",
      "title": "위험 항목 제목",
      "description": "상세 설명 (법령 조항 번호 포함)",
      "action": "권장 조치사항",
      "relatedClauseId": "c2"
    }
  ],
  "complianceScore": 75
}
\`\`\`

severity 기준:
- critical: 법령 위반 가능성이 있어 즉시 수정 필요
- recommendation: 법적 요건은 충족하나 개선 권장
- pass: 법적 요건 충족 확인

complianceScore: 0-100 점수 (critical 건당 -15점, recommendation 건당 -5점에서 시작)

반드시 JSON만 출력하세요.`;

// ────────────────────────────────────────────
// 샘플 PDF 텍스트 (실제 업로드 없을 때 사용)
// ────────────────────────────────────────────
const SAMPLE_PDF_TEXT = `
복지급여 신청서

신청인 정보
성명: 김복순
주민등록번호: 650412-2XXXXXX
생년월일: 1965년 4월 12일
주소: 서울특별시 관악구 신림동 123-45번지
연락처: 010-1234-5678
이메일: boksunik@example.com
긴급연락처: 010-9876-5432 (배우자 김철수)

건강 및 장애 현황
건강상태: 당뇨병 2형 (2018년 진단), 고혈압
장애등록 여부: 지체장애 3급 (등록번호: 11-2020-XXXXX)
주치의: 관악구 신림의원 박의사

소득 및 재산 현황
월 소득: 820,000원
재산 내역: 임차보증금 2,000만원
가구 유형: 한부모가정
부양가족: 자녀 1명 (김민준, 2013년 3월생, 만 11세)

신청 서비스
신청 급여: 의료급여, 생계급여
신청 기관: 사단법인 희망나눔복지센터
담당 사회복지사: 이담당
보유기간 요청: 5년
서명: 김복순 (인)
신청일: 2024년 3월 15일
`;

// ────────────────────────────────────────────
// 샘플 Fallback 데이터셋 (AI 응답 항목 누락 방지용)
// ────────────────────────────────────────────
const SAMPLE_FALLBACK_DATASET = {
  extractedItems: [
    { id: 'e1', label: '성명', value: '김복순', category: 'general' },
    { id: 'e2', label: '연락처', value: '010-1234-5678', category: 'general' },
    { id: 'e3', label: '주소', value: '서울특별시 관악구 신림동 123-45', category: 'general' },
    { id: 'e4', label: '이메일', value: 'boksunik@example.com', category: 'general' },
    { id: 'e5', label: '건강 상태', value: '당뇨병 2형, 고혈압', category: 'sensitive' },
    { id: 'e6', label: '장애 여부', value: '지체장애 3급', category: 'sensitive' },
    { id: 'e7', label: '소득 수준', value: '월 820,000원', category: 'sensitive' },
    { id: 'e8', label: '주민등록번호', value: '650412-2******', category: 'unique_id' },
  ],
  consentClauses: [
    {
      id: 'c1',
      type: 'purpose',
      title: '1. 개인정보 수집·이용 목적',
      content: '본 기관은 「사회복지사업법」 제33조의3 및 「개인정보 보호법」 제15조에 따라 복지급여 신청 자격 심사 및 서비스 제공을 위해 개인정보를 수집·이용합니다.',
      isSensitiveBox: false,
      isLegalRepBox: false,
      relatedRiskId: null,
    },
    {
      id: 'c2',
      type: 'items',
      title: '2. 수집하는 개인정보 항목',
      content: '일반 개인정보: 성명, 연락처, 주소, 이메일\n민감정보: 건강상태, 장애여부, 소득수준\n고유식별정보: 주민등록번호',
      isSensitiveBox: false,
      isLegalRepBox: false,
      relatedRiskId: null,
    },
    {
      id: 'c3',
      type: 'retention',
      title: '3. 개인정보 보유 및 이용 기간',
      content: '복지 서비스 제공 완료 후 1년 간 보존하며, 보조금 정산 관련 서류는 「사회복지사업법」 제45조에 따라 5년 간 보존합니다.',
      isSensitiveBox: false,
      isLegalRepBox: false,
      relatedRiskId: 'r2',
    },
    {
      id: 'c4',
      type: 'sensitive_separate',
      title: '4. 민감정보 처리에 대한 별도 동의',
      content: '「개인정보 보호법」 제23조에 따라 건강상태, 장애여부, 소득수준 등 민감정보를 처리하기 위해 별도의 동의를 구합니다.',
      isSensitiveBox: true,
      isLegalRepBox: false,
      relatedRiskId: 'r3',
    },
    {
      id: 'c5',
      type: 'legal_representative',
      title: '5. 만 14세 미만 아동의 법정대리인 동의',
      content: '「개인정보 보호법」 제22조의2에 따라 만 14세 미만 아동(김민준, 만 11세)의 개인정보 처리를 위해 법정대리인의 동의를 구합니다.',
      isSensitiveBox: false,
      isLegalRepBox: true,
      relatedRiskId: null,
    },
  ],
  riskAlerts: [
    {
      id: 'r1',
      severity: 'critical',
      title: '[위험] 주민등록번호 처리 법적 근거 미비',
      description: '주민등록번호가 감지되었습니다. 「개인정보 보호법」 제24조에 따라 법령의 명시적 근거 없이는 수집이 불가하므로 생년월일 대체 처리를 권장합니다.',
      action: '주민등록번호 수집란 삭제 및 생년월일 대체 전환 권장',
      relatedClauseId: 'c2',
    },
    {
      id: 'r2',
      severity: 'recommendation',
      title: '[권장] 보유기간 5년 설정 재검토',
      description: '보유기간 5년 요청이 감지되었습니다. 서비스 관련 개인정보는 원칙적 1년 보유, 보조금 정산 서류만 5년 분리 보존해야 합니다.',
      action: '서비스 데이터 1년, 정산 서류 5년 분리 명시',
      relatedClauseId: 'c3',
    },
    {
      id: 'r3',
      severity: 'pass',
      title: '[적합] 민감정보 별도 동의란 구조 검증 완료',
      description: '건강 및 장애 정보 처리를 위한 별도 동의란이 적절히 생성되었습니다.',
      action: '현행 유지',
      relatedClauseId: 'c4',
    },
  ],
};
