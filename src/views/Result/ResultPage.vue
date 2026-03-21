<template>
  <div class="result-page page-container">
    <a-spin :spinning="loading" tip="加载评测结果...">
      <template v-if="result">
        <!-- 总分区域 -->
        <div class="result-page__score card">
          <ScoreRing :score="result.totalScore" :maxScore="result.maxScore" size="large" />
          <div class="result-page__grade">
            <a-tag :color="gradeInfo.color" style="font-size: 16px; padding: 4px 16px;">
              {{ gradeInfo.label }}
            </a-tag>
          </div>
          <p class="result-page__comment">{{ result.aiComment }}</p>
        </div>

        <!-- 雷达图 -->
        <div class="card" style="margin-top: 12px">
          <h4 class="section-title">能力维度分析</h4>
          <RadarChart :dimensions="result.dimensions" size="medium" />
        </div>

        <!-- 失分诊断 -->
        <div style="margin-top: 12px">
          <LossAnalysis :dimensions="result.dimensions" />
        </div>

        <!-- 评分关键词 -->
        <div style="margin-top: 12px">
          <ScoreBreakdown :keywords="result.matchedKeywords" />
        </div>

        <!-- 答案文字稿 -->
        <div style="margin-top: 12px">
          <TranscriptViewer
            :transcript="result.highlightedTranscript || transcript"
            :keywords="result.matchedKeywords"
          />
        </div>

        <!-- 录制回放 -->
        <div class="card" style="margin-top: 12px" v-if="recordingUrl">
          <h4 class="section-title">作答回放</h4>
          <video :src="recordingUrl" controls style="width: 100%; border-radius: 8px"></video>
        </div>

        <!-- 底部操作 -->
        <div class="result-page__actions">
          <a-button type="primary" size="large" @click="$router.push('/exam/prepare')">
            再练一题
          </a-button>
          <a-button size="large" @click="$router.push('/')">
            返回首页
          </a-button>
        </div>
      </template>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useExamStore } from '@/stores/exam'
import { getGrade } from '@/utils/constants'
import { getScoringResult } from '@/api/scoring'
import RadarChart from '@/components/common/RadarChart.vue'
import ScoreRing from '@/components/common/ScoreRing.vue'
import LossAnalysis from '@/components/scoring/LossAnalysis.vue'
import ScoreBreakdown from '@/components/scoring/ScoreBreakdown.vue'
import TranscriptViewer from '@/components/scoring/TranscriptViewer.vue'

const route = useRoute()
const examStore = useExamStore()
const loading = ref(true)
const result = ref(null)
const transcript = ref('')
const recordingUrl = ref('')

const gradeInfo = computed(() => {
  if (!result.value) return { label: '', color: '' }
  return getGrade(result.value.totalScore, result.value.maxScore)
})

onMounted(async () => {
  // 优先从 store 获取（刚考完直接跳转的情况）
  if (examStore.scoringResult) {
    result.value = examStore.scoringResult
    transcript.value = examStore.transcript
    if (examStore.recordingBlob) {
      recordingUrl.value = URL.createObjectURL(examStore.recordingBlob)
    }
    loading.value = false
    return
  }

  // 否则从API加载
  try {
    const examId = route.params.examId
    const data = await getScoringResult(examId, '')
    result.value = data
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  if (recordingUrl.value) {
    URL.revokeObjectURL(recordingUrl.value)
  }
})
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.result-page__score {
  text-align: center;
  padding: 24px 16px;
}

.result-page__grade {
  margin: 12px 0;
}

.result-page__comment {
  color: @text-secondary;
  font-size: @font-size-sm;
  line-height: 1.7;
  margin-top: 8px;
  text-align: left;
}

.section-title {
  font-size: @font-size-lg;
  color: @text-primary;
  margin-bottom: 12px;
}

.result-page__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 24px;
  padding-bottom: 24px;
}
</style>
