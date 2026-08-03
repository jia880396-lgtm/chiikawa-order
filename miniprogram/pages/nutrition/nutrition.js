// pages/nutrition/nutrition.js - 营养统计
const app = getApp()
const { today, mealName, mealEmoji, dailyTarget } = require('../../utils/util.js')
const { NUTRI_META } = require('../../utils/nutritionDB.js')
const db = wx.cloud.database()

Page({
  data: {
    date: '',
    role: 'boyfriend',
    roleName: '男朋友',
    roleEmoji: '👦',
    total: { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0, sugar: 0, sodium: 0, calcium: 0, vitA: 0 },
    target: dailyTarget,
    percents: {},
    mealName,
    mealEmoji,
    nutriMeta: NUTRI_META,
    grouped: { breakfast: [], lunch: [], dinner: [], snack: [] },
    mealCal: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
    calPercent: 0
  },

  onLoad() {
    this.setData({
      date: today(),
      role: app.globalData.role,
      roleName: app.globalData.role === 'boyfriend' ? '男朋友' : '女朋友',
      roleEmoji: app.globalData.role === 'boyfriend' ? '👦' : '👧'
    })
  },

  onShow() {
    this.loadNutrition()
  },

  switchRole() {
    const r = app.globalData.role === 'boyfriend' ? 'girlfriend' : 'boyfriend'
    app.globalData.role = r
    wx.setStorageSync('role', r)
    this.setData({
      role: r,
      roleName: r === 'boyfriend' ? '男朋友' : '女朋友',
      roleEmoji: r === 'boyfriend' ? '👦' : '👧'
    })
    this.loadNutrition()
    wx.showToast({ title: `已切换为${r === 'boyfriend' ? '男朋友' : '女朋友'}视角`, icon: 'none' })
  },

  loadNutrition() {
    db.collection('orders').where({
      date: this.data.date,
      role: this.data.role
    }).get().then(res => {
      const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] }
      const mealCal = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 }
      const total = { calories: 0, protein: 0, fat: 0, carb: 0, fiber: 0, sugar: 0, sodium: 0, calcium: 0, vitA: 0 }
      res.data.forEach(o => {
        if (grouped[o.mealType]) {
          grouped[o.mealType].push(o)
          mealCal[o.mealType] += o.calories || 0
        }
        Object.keys(total).forEach(k => { total[k] += o[k] || 0 })
      })
      const t = this.data.target
      const percents = {}
      Object.keys(t).forEach(k => {
        percents[k] = Math.min(100, Math.round((total[k] || 0) / t[k] * 100))
      })
      this.setData({ grouped, mealCal, total, percents, calPercent: percents.calories })
    }).catch(err => {
      console.error('加载营养数据失败', err)
    })
  }
})
