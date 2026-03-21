<template>
  <div class="exam-prepare page-container">
    <h2 class="exam-prepare__title">设备检测</h2>
    <p class="exam-prepare__desc">开始测评前，请确认摄像头和麦克风正常工作</p>

    <a-steps :current="currentStep" direction="vertical" class="exam-prepare__steps">
      <a-step title="设备权限检测" :status="stepStatus(0)">
        <template #description>
          <div v-if="currentStep === 0 && !permissionError">
            <a-spin size="small" /> 正在请求设备权限...
          </div>
          <div v-else-if="currentStep === 0 && permissionError">
            <p style="color: #CF1322; margin-bottom: 8px">{{ permissionError }}</p>
            <a-space>
              <a-button size="small" type="primary" @click="retryPermission">重新检测</a-button>
              <a-button size="small" v-if="!micReady" @click="tryMicOnly">仅使用麦克风</a-button>
            </a-space>
            <div class="permission-tips">
              <p>常见原因:</p>
              <ul>
                <li>麦克风/摄像头被其他程序(如腾讯会议、微信)占用，请先关闭</li>
                <li>浏览器未授权，请点击地址栏左侧锁图标 → 允许麦克风和摄像头</li>
                <li>系统设置中麦克风被禁用 (Windows: 设置 → 隐私 → 麦克风)</li>
              </ul>
            </div>
          </div>
          <div v-else-if="currentStep > 0">
            <span style="color: #389E0D" v-if="cameraReady && micReady">摄像头和麦克风已就绪</span>
            <span style="color: #389E0D" v-else-if="micReady">麦克风已就绪 (仅语音模式)</span>
          </div>
        </template>
      </a-step>
      <a-step title="试录 3 秒" :status="stepStatus(1)">
        <template #description>
          <div v-if="currentStep === 1">
            <a-button v-if="!testRecording && !testBlob" size="small" type="primary" @click="startTestRecord">
              开始试录
            </a-button>
            <span v-else-if="testRecording" style="color: #D48806">录制中... {{ testCountdown }}s</span>
            <span v-else-if="testBlob" style="color: #389E0D">试录完成</span>
          </div>
        </template>
      </a-step>
      <a-step title="回放确认" :status="stepStatus(2)">
        <template #description>
          <div v-if="currentStep === 2 && testBlobUrl">
            <video v-if="cameraReady" :src="testBlobUrl" controls style="width: 100%; max-width: 300px; border-radius: 8px; margin-top: 8px"></video>
            <audio v-else :src="testBlobUrl" controls style="width: 100%; max-width: 300px; margin-top: 8px"></audio>
            <div style="margin-top: 8px">
              <a-button size="small" @click="retryTest" style="margin-right: 8px">重新试录</a-button>
              <a-button size="small" type="primary" @click="confirmDevice">确认正常</a-button>
            </div>
          </div>
        </template>
      </a-step>
    </a-steps>

    <div class="exam-prepare__actions" v-if="allReady">
      <a-button type="primary" size="large" block @click="enterExam">
        进入考场
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePermission } from '@/composables/usePermission'
import { useMediaRecorder } from '@/composables/useMediaRecorder'
import { useExamStore } from '@/stores/exam'
import { getRandomQuestions } from '@/api/questionBank'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const examStore = useExamStore()
const userStore = useUserStore()

const { cameraReady, micReady, error: permissionError, checkBoth, checkMicOnly } = usePermission()
const recorder = useMediaRecorder()

const currentStep = ref(0)
const testRecording = ref(false)
const testBlob = ref(null)
const testBlobUrl = ref('')
const testCountdown = ref(3)
const allReady = ref(false)
const videoEnabled = ref(true)

let countdownTimer = null

onMounted(() => {
  doPermissionCheck()
})

onUnmounted(() => {
  clearInterval(countdownTimer)
  recorder.destroyStream()
  if (testBlobUrl.value) {
    URL.revokeObjectURL(testBlobUrl.value)
  }
})

async function doPermissionCheck() {
  currentStep.value = 0
  permissionError.value = ''
  const ok = await checkBoth()
  if (ok) {
    videoEnabled.value = true
    currentStep.value = 1
    await initRecorder()
  }
}

async function retryPermission() {
  permissionError.value = ''
  await doPermissionCheck()
}

async function tryMicOnly() {
  permissionError.value = ''
  currentStep.value = 0
  const ok = await checkMicOnly()
  if (ok) {
    videoEnabled.value = false
    currentStep.value = 1
    await initRecorder()
  }
}

async function initRecorder() {
  await recorder.initStream({ videoEnabled: videoEnabled.value })
}

function stepStatus(step) {
  if (step < currentStep.value) return 'finish'
  if (step === currentStep.value) return 'process'
  return 'wait'
}

async function startTestRecord() {
  testRecording.value = true
  testCountdown.value = 3
  recorder.startRecording()

  countdownTimer = setInterval(() => {
    testCountdown.value--
    if (testCountdown.value <= 0) {
      clearInterval(countdownTimer)
      finishTestRecord()
    }
  }, 1000)
}

async function finishTestRecord() {
  const blob = await recorder.stopRecording()
  testRecording.value = false
  testBlob.value = blob
  if (blob) {
    testBlobUrl.value = URL.createObjectURL(blob)
    currentStep.value = 2
  }
}

function retryTest() {
  testBlob.value = null
  if (testBlobUrl.value) URL.revokeObjectURL(testBlobUrl.value)
  testBlobUrl.value = ''
  currentStep.value = 1
}

function confirmDevice() {
  allReady.value = true
  examStore.setDeviceReady(true)
}

async function enterExam() {
  recorder.destroyStream()
  const questions = await getRandomQuestions({
    province: userStore.selectedProvince,
    count: 5
  })
  await examStore.initExam(questions)
  router.push('/exam/room')
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.exam-prepare__title {
  font-size: @font-size-xxl;
  color: @text-primary;
  margin-bottom: 8px;
}

.exam-prepare__desc {
  color: @text-secondary;
  margin-bottom: 24px;
}

.exam-prepare__steps {
  margin-bottom: 24px;
}

.exam-prepare__actions {
  margin-top: 24px;
}

.permission-tips {
  margin-top: 12px;
  padding: 12px;
  background: #FFF7E6;
  border-radius: 6px;
  font-size: @font-size-sm;
  color: @text-regular;

  p {
    font-weight: 600;
    margin-bottom: 4px;
  }
  ul {
    padding-left: 18px;
    margin: 0;
    li {
      line-height: 1.8;
    }
  }
}
</style>
