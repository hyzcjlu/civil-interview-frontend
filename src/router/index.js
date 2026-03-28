import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Auth/LoginPage.vue'),
    meta: { title: '登录', layout: 'blank', requiresAuth: false }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/HomePage.vue'),
    meta: { title: '首页', layout: 'default' }
  },
  {
    path: '/exam/prepare',
    name: 'ExamPrepare',
    component: () => import('@/views/Exam/ExamPrepare.vue'),
    meta: { title: '设备检测', layout: 'simple' }
  },
  {
    path: '/exam/room',
    name: 'ExamRoom',
    component: () => import('@/views/Exam/ExamRoom.vue'),
    meta: { title: '考场', layout: 'fullscreen' }
  },
  {
    path: '/exam/complete/:examId',
    name: 'ExamComplete',
    component: () => import('@/views/Exam/ExamComplete.vue'),
    meta: { title: '答题完成', layout: 'simple' }
  },
  {
    path: '/result/:examId',
    name: 'Result',
    component: () => import('@/views/Result/ResultPage.vue'),
    meta: { title: '测评结果', layout: 'simple' }
  },
  {
    path: '/bank',
    name: 'BankList',
    component: () => import('@/views/QuestionBank/BankList.vue'),
    meta: { title: '题库管理', layout: 'default' }
  },
  {
    path: '/bank/import',
    name: 'BankImport',
    component: () => import('@/views/QuestionBank/BankImport.vue'),
    meta: { title: '批量导入', layout: 'default' }
  },
  {
    path: '/bank/edit/:id?',
    name: 'BankEditor',
    component: () => import('@/views/QuestionBank/BankEditor.vue'),
    meta: { title: '编辑题目', layout: 'default' }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/History/HistoryPage.vue'),
    meta: { title: '历史记录', layout: 'default' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile/ProfilePage.vue'),
    meta: { title: '个人设置', layout: 'default' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  document.title = `${to.meta.title || ''} - 公考面试AI智能测评`

  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path === '/login' && userStore.isAuthenticated) {
    return { path: '/' }
  }
})

export default router
