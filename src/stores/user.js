import { defineStore } from 'pinia'
import { getUserInfo, updatePreferences, getProvinces } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: { id: '', name: '', avatar: '', province: 'national' },
    selectedProvince: 'national',
    provinces: [],
    preferences: {
      defaultPrepTime: 90,
      defaultAnswerTime: 180,
      enableVideo: true
    }
  }),

  getters: {
    provinceName(state) {
      const p = state.provinces.find(p => p.code === state.selectedProvince)
      return p ? p.name : '国考'
    }
  },

  actions: {
    async loadUserInfo() {
      this.userInfo = await getUserInfo()
      this.selectedProvince = this.userInfo.province || 'national'
    },
    async loadProvinces() {
      this.provinces = await getProvinces()
    },
    setProvince(code) {
      this.selectedProvince = code
    },
    async savePreferences(prefs) {
      Object.assign(this.preferences, prefs)
      await updatePreferences(this.preferences)
    }
  }
})
