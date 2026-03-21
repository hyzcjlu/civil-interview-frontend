// 评分维度定义
export const DIMENSIONS = [
  { key: 'legal', name: '法治思维', maxScore: 20 },
  { key: 'practical', name: '实务落地', maxScore: 20 },
  { key: 'logic', name: '逻辑结构', maxScore: 15 },
  { key: 'expression', name: '语言表达', maxScore: 15 },
  { key: 'analysis', name: '综合分析', maxScore: 15 },
  { key: 'emergency', name: '应急应变', maxScore: 15 }
]

// 省份列表
export const PROVINCES = [
  { code: 'national', name: '国考' },
  { code: 'beijing', name: '北京' },
  { code: 'shanghai', name: '上海' },
  { code: 'guangdong', name: '广东' },
  { code: 'jiangsu', name: '江苏' },
  { code: 'zhejiang', name: '浙江' },
  { code: 'shandong', name: '山东' },
  { code: 'sichuan', name: '四川' },
  { code: 'hubei', name: '湖北' },
  { code: 'hunan', name: '湖南' },
  { code: 'henan', name: '河南' },
  { code: 'hebei', name: '河北' },
  { code: 'fujian', name: '福建' },
  { code: 'anhui', name: '安徽' },
  { code: 'liaoning', name: '辽宁' },
  { code: 'shaanxi', name: '陕西' }
]

// 考试状态
export const EXAM_STATUS = {
  IDLE: 'idle',
  PREPARING: 'preparing',
  ANSWERING: 'answering',
  SUBMITTING: 'submitting',
  COMPLETED: 'completed'
}

// 评级定义
export const GRADE_CONFIG = {
  A: { label: '优秀', color: '#389E0D', min: 90 },
  B: { label: '良好', color: '#1B5FAA', min: 75 },
  C: { label: '中等', color: '#D48806', min: 60 },
  D: { label: '待提升', color: '#CF1322', min: 0 }
}

export function getGrade(score, maxScore = 100) {
  const percent = (score / maxScore) * 100
  if (percent >= 90) return GRADE_CONFIG.A
  if (percent >= 75) return GRADE_CONFIG.B
  if (percent >= 60) return GRADE_CONFIG.C
  return GRADE_CONFIG.D
}

// 默认考试配置
export const DEFAULT_PREP_TIME = 90   // 秒
export const DEFAULT_ANSWER_TIME = 180 // 秒
export const MAX_ANSWER_TIME = 300     // 秒
