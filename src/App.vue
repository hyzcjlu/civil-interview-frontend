<template>
  <div class="app-wrapper" :class="layoutClass">
    <AppHeader v-if="showHeader" />
    <main class="app-main">
      <router-view />
    </main>
    <AppTabBar v-if="showTabBar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppTabBar from '@/components/layout/AppTabBar.vue'

const route = useRoute()

const layout = computed(() => route.meta.layout || 'default')
const layoutClass = computed(() => `layout-${layout.value}`)
const showHeader = computed(() => layout.value !== 'fullscreen')
const showTabBar = computed(() => layout.value === 'default')
</script>

<style lang="less">
.app-wrapper {
  min-height: 100vh;
  background: @page-bg;
  display: flex;
  flex-direction: column;
}
.app-main {
  flex: 1;
  padding-bottom: env(safe-area-inset-bottom);
}
.layout-default .app-main {
  padding-top: 56px;
  padding-bottom: 60px;
}
.layout-simple .app-main {
  padding-top: 56px;
}
.layout-fullscreen .app-main {
  padding: 0;
}
</style>
