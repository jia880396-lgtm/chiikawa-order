// pages/index/index.js - 首页
const app = getApp()
const { today, mealName, mealEmoji, dailyTarget } = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    today: '',
    role: 'boyfriend',
    roleName: '男朋友',
    roleEmoji: '👦',
    todayOrders: { breakfast: [], lunch: [], dinner: [], snack: [] },
    todayCalories: 0,
    calPercent: 0,
    mealName,
    mealEmoji,
    target: dailyTarget.calories
  },

  onLoad() {
    this.setData({ today: today() })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.loadRole()
    this.loadTodayOrders()
  },

  loadRole() {
    const role = app.globalData.role
    this.setData({
      role,
      roleName: role === 'boyfriend' ? '男朋友' : '女朋友',
      roleEmoji: role === 'boyfriend' ? '👦' : '👧'
    })
  },

  switchRole() {
    const newRole = this.data.role === 'boyfriend' ? 'girlfriend' : 'boyfriend'
    app.globalData.role = newRole
    wx.setStorageSync('role', newRole)
    this.setData({
      role: newRole,
      roleName: newRole === 'boyfriend' ? '男朋友' : '女朋友',
      roleEmoji: newRole === 'boyfriend' ? '👦' : '👧'
    })
    this.loadTodayOrders()
    wx.showToast({
      title: `已切换为${newRole === 'boyfriend' ? '男朋友' : '女朋友'}视角`,
      icon: 'none'
    })
  },

  loadTodayOrders() {
    const t = today()
    db.collection('orders').where({
      date: t,
      role: this.data.role
    }).get().then(res => {
      const orders = { breakfast: [], lunch: [], dinner: [], snack: [] }
      let totalCal = 0
      res.data.forEach(o => {
        if (orders[o.mealType]) {
          orders[o.mealType].push(o)
          totalCal += o.calories || 0
        }
      })
      const percent = Math.min(100, Math.round(totalCal / dailyTarget.calories * 100))
      this.setData({
        todayOrders: orders,
        todayCalories: totalCal,
        calPercent: percent
      })
    }).catch(err => {
      console.error('加载今日点餐失败', err)
    })
  },

  goOrder() { wx.switchTab({ url: '/pages/order/order' }) },
  goMenu() { wx.navigateTo({ url: '/pages/menu/menu' }) },
  goNutrition() { wx.navigateTo({ url: '/pages/nutrition/nutrition' }) },
  goCouple() { wx.switchTab({ url: '/pages/couple/couple' }) },
  goWeight() { wx.switchTab({ url: '/pages/weight/weight' }) }
})
