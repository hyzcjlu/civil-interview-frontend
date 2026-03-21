<template>
  <div class="exam-room" v-if="examStore.currentQuestion">
    <!-- 顶部状态栏 -->
    <div class="exam-room__header">
      <span class="exam-room__progress">
        {{ examStore.currentQuestionNumber }} / {{ examStore.totalQuestions }}
      </span>
      <a-popconfirm title="确定退出考试？已答题目不会丢失。" @confirm="exitExam">
        <a-button type="text" size="small" style="color: rgba(255,255,255,0.8)">
          <CloseOutlined /> 退出
        </a-button>
      </a-popconfirm>
    </div>

    <!-- 视频预览 -->
    <div class="exam-room__video">
      <VideoPreview
        :stream="stream"
        :recording="examStore.status === 'answering'"
        :duration="recorderDuration"
      />
    </div>

    <!-- 题目卡片 -->
    <div class="exam-room__question">
      <a-tag color="blue" style="margin-bottom: 8px">
        {{ dimensionName }}
      </a-tag>
      <div class="question-stem">{{ examStore.currentQuestion.stem }}</div>
    </div>

    <!-- 倒计时 -->
    <div class="exam-room__timer">
      <CountdownTimer
        v-if="examStore.status === 'preparing' || examStore.status === 'answering'"
        :remaining="countdown.remaining.value"
        :total="countdown.total.value"
        :mode="examStore.status === 'preparing' ? 'prep' : 'answer'"
      />
      <div v-else-if="examStore.status === 'submitting'" style="color: rgba(255,255,255,0.7)">
        <a-spin /> <span style="margin-left: 8px">正在评分，请稍候...</span>
      </div>
      <div v-else-if="examStore.status === 'completed'" style="color: #389E0D; font-size: 16px">
        <CheckCircleFilled /> 评分完成
      </div>
    </div>

    <!-- 音频波形 -->
    <div class="exam-room__waveform" v-show="examStore.status === 'answering'">
      <AudioWaveform
        :stream="stream"
        :active="examStore.status === 'answering'"
        :width="320"
        :height="60"
      />
    </div>

    <!-- 简要评分结果 (答题完成后) -->
    <div class="exam-room__brief-result" v-if="examStore.status === 'completed' && examStore.scoringResult">
      <div class="brief-score">
        <ScoreRing
          :score="examStore.scoringResult.totalScore"
          :maxScore="examStore.scoringResult.maxScore"
          size="small"
        />
        <span class="brief-score__label">{{ gradeLabel }}</span>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="exam-room__controls">
      <RecordingControl
        :status="examStore.status"
        :isLast="examStore.isLastQuestion"
        @start-prep="onStartPrep"
        @start-answer="onStartAnswer"
        @submit="onSubmit"
        @next="onNext"
        @finish="onFinish"
      />
    </div>
  </div>
  <div v-else class="exam-room" style="align-items: center; justify-content: center; color: rgba(255,255,255,0.5);">
    <p>暂无题目，请返回首页开始测评</p>
    <a-button type="primary" @click="$router.push('/')">返回首页</a-button>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { CloseOutlined, CheckCircleFilled } from '@ant-design/icons-vue'
import { useExamStore } from '@/stores/exam'
import { useMediaRecorder } from '@/composables/useMediaRecorder'
import { useCountdown } from '@/composables/useCountdown'
import { DIMENSIONS, EXAM_STATUS, getGrade } from '@/utils/constants'
import VideoPreview from '@/components/recording/VideoPreview.vue'
import AudioWaveform from '@/components/recording/AudioWaveform.vue'
import CountdownTimer from '@/components/common/CountdownTimer.vue'
import RecordingControl from '@/components/recording/RecordingControl.vue'
import ScoreRing from '@/components/common/ScoreRing.vue'
import { message } from 'ant-design-vue'

const router = useRouter()
const examStore = useExamStore()
const recorder = useMediaRecorder()
const stream = recorder.stream
const recorderDuration = recorder.duration
const countdown = useCountdown(0)

const dimensionName = computed(() => {
  const q = examStore.currentQuestion
  if (!q) return ''
  const dim = DIMENSIONS.find(d => d.key === q.dimension)
  return dim ? dim.name : q.dimension
})

const gradeLabel = computed(() => {
  if (!examStore.scoringResult) return ''
  return getGrade(examStore.scoringResult.totalScore, examStore.scoringResult.maxScore).label
})

onMounted(async () => {
  await recorder.initStream()
  if (examStore.currentQuestion && examStore.status === EXAM_STATUS.IDLE) {
    // 自动进入准备阶段
  }
})

onUnmounted(() => {
  recorder.destroyStream()
  countdown.stop()
})

function onStartPrep() {
  const q = examStore.currentQuestion
  examStore.startPreparing()
  countdown.reset(q.prepTime || 90)
  countdown.onFinish(() => {
    // 准备时间到，自动开始作答
    onStartAnswer()
  })
  countdown.start()
}

function onStartAnswer() {
  countdown.stop()
  examStore.startAnswering()
  recorder.startRecording()
  const q = examStore.currentQuestion
  countdown.reset(q.answerTime || 180)
  countdown.onFinish(() => {
    // 时间到，自动提交
    onSubmit()
  })
  countdown.start()
}

async function onSubmit() {
  countdown.stop()
  try {
    const blob = await recorder.stopRecording()
    if (blob) {
      await examStore.submitAnswer(blob)
    }
  } catch (e) {
    message.error('提交失败: ' + (e.message || '未知错误'))
  }
}

function onNext() {
  examStore.nextQuestion()
  countdown.reset(0)
}

function onFinish() {
  const examId = examStore.examId
  router.push(`/result/${examId}`)
}

function exitExam() {
  countdown.stop()
  recorder.destroyStream()
  examStore.exitExam()
  router.push('/')
}
</script>

<style lang="less" scoped>
@import '@/styles/exam-room.less';

.question-stem {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
}

.brief-score {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px 16px;
}

.brief-score__label {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.exam-room__brief-result {
  flex-shrink: 0;
}
</style>
