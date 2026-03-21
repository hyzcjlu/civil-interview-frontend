<template>
  <div class="profile-page page-container">
    <h2>个人设置</h2>

    <!-- 用户信息 -->
    <div class="card profile-section">
      <h3>基本信息</h3>
      <a-form layout="vertical">
        <a-form-item label="昵称">
          <a-input v-model:value="userStore.userInfo.name" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="默认省份">
          <a-select v-model:value="userStore.selectedProvince" @change="onProvinceChange">
            <a-select-option v-for="p in userStore.provinces" :key="p.code" :value="p.code">
              {{ p.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </div>

    <!-- 练习偏好 -->
    <div class="card profile-section">
      <h3>练习偏好</h3>
      <a-form layout="vertical">
        <a-form-item label="默认准备时间(秒)">
          <a-slider v-model:value="preferences.defaultPrepTime" :min="30" :max="300" :step="10" />
          <span class="pref-value">{{ preferences.defaultPrepTime }}s</span>
        </a-form-item>
        <a-form-item label="默认作答时间(秒)">
          <a-slider v-model:value="preferences.defaultAnswerTime" :min="60" :max="600" :step="10" />
          <span class="pref-value">{{ preferences.defaultAnswerTime }}s</span>
        </a-form-item>
        <a-form-item label="视频录制">
          <a-switch v-model:checked="preferences.enableVideo" />
          <span style="margin-left: 8px; color: #8C8C8C">
            {{ preferences.enableVideo ? '开启' : '关闭' }}
          </span>
        </a-form-item>
      </a-form>
      <a-button type="primary" @click="savePreferences">保存设置</a-button>
    </div>

    <!-- 关于 -->
    <div class="card profile-section">
      <h3>关于</h3>
      <p style="color: #8C8C8C">公考面试AI智能测评系统 v1.0.0</p>
      <p style="color: #8C8C8C; font-size: 12px">基于结构化题库模板的AI精准评分系统</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'

const userStore = useUserStore()

const preferences = reactive({
  defaultPrepTime: 90,
  defaultAnswerTime: 180,
  enableVideo: true
})

onMounted(async () => {
  await userStore.loadProvinces()
  await userStore.loadUserInfo()
  Object.assign(preferences, userStore.preferences)
})

function onProvinceChange(code) {
  userStore.setProvince(code)
}

async function savePreferences() {
  await userStore.savePreferences({ ...preferences })
  message.success('设置已保存')
}
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.profile-page h2 {
  font-size: @font-size-xl;
  color: @text-primary;
  margin-bottom: 16px;
}

.profile-section {
  padding: 16px;
  margin-bottom: 12px;

  h3 {
    font-size: @font-size-lg;
    color: @text-primary;
    margin-bottom: 12px;
  }
}

.pref-value {
  display: inline-block;
  margin-left: 12px;
  font-size: @font-size-sm;
  color: @primary-color;
  font-weight: 600;
}
</style>
