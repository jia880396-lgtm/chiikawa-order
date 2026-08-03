// pages/order/order.js - 点餐页
const app = getApp()
const { today, getMealType, mealName, mealEmoji } = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    currentMeal: 'breakfast',
    meals: ['breakfast', 'lunch', 'dinner', 'snack'],
    mealName,
    mealEmoji,
    menuList: [],
    selectedFoods: [],
    randomFood: null,
    showRandom: false,
    role: 'boyfriend',
    roleName: '男朋友',
    roleEmoji: '👦'
  },

  onLoad() {
    this.setData({ currentMeal: getMealType() })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadRole()
    this.loadMenu()
    this.loadSelected()
  },

  loadRole() {
    const role = app.globalData.role
    this.setData({
      role,
      roleName: role === 'boyfriend' ? '男朋友' : '女朋友',
      roleEmoji: role === 'boyfriend' ? '👦' : '👧'
    })
  },

  // 切换视角查看对方
  switchRole() {
    const newRole = app.globalData.role === 'boyfriend' ? 'girlfriend' : 'boyfriend'
    app.globalData.role = newRole
    wx.setStorageSync('role', newRole)
    this.loadRole()
    this.loadSelected()
    wx.showToast({ title: `已切换为${newRole === 'boyfriend' ? '男朋友' : '女朋友'}视角`, icon: 'none' })
  },

  switchMeal(e) {
    this.setData({ currentMeal: e.currentTarget.dataset.meal })
    this.loadMenu()
    this.loadSelected()
  },

  loadMenu() {
    db.collection('menus').where({
      category: this.data.currentMeal
    }).get().then(res => {
      this.setData({ menuList: res.data })
    }).catch(err => {
      console.error('加载菜单失败', err)
      this.setData({ menuList: [] })
    })
  },

  loadSelected() {
    const t = today()
    db.collection('orders').where({
      date: t,
      mealType: this.data.currentMeal,
      role: app.globalData.role
    }).get().then(res => {
      this.setData({ selectedFoods: res.data })
    })
  },

  // 点餐：加入今日餐盘
  addOrder(e) {
    const food = e.currentTarget.dataset.food
    const t = today()
    db.collection('orders').add({
      data: {
        date: t,
        mealType: this.data.currentMeal,
        menuId: food._id,
        menuName: food.name,
        emoji: food.emoji || '🍴',
        calories: food.calories || 0,
        fat: food.fat || 0,
        protein: food.protein || 0,
        carb: food.carb || 0,
        fiber: food.fiber || 0,
        sugar: food.sugar || 0,
        sodium: food.sodium || 0,
        calcium: food.calcium || 0,
        vitA: food.vitA || 0,
        role: app.globalData.role,
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.showToast({ title: '已加入餐盘~', icon: 'none' })
      this.loadSelected()
    }).catch(err => {
      console.error('点餐失败', err)
      wx.showToast({ title: '点餐失败', icon: 'none' })
    })
  },

  // 移除菜品
  removeOrder(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '移除菜品',
      content: '确定从餐盘中移除吗？',
      success: res => {
        if (res.confirm) {
          db.collection('orders').doc(id).remove().then(() => {
            this.loadSelected()
            wx.showToast({ title: '已移除', icon: 'none' })
          })
        }
      }
    })
  },

  // 随机选餐
  randomPick() {
    const list = this.data.menuList
    if (!list.length) {
      wx.showToast({ title: '还没有菜品，先去添加吧', icon: 'none' })
      return
    }
    const pick = list[Math.floor(Math.random() * list.length)]
    this.setData({ randomFood: pick, showRandom: true })
  },

  confirmRandom() {
    const food = this.data.randomFood
    this.setData({ showRandom: false, randomFood: null })
    this.addOrder({ currentTarget: { dataset: { food } } })
  },

  cancelRandom() {
    // 再随机一次
    const list = this.data.menuList
    const pick = list[Math.floor(Math.random() * list.length)]
    this.setData({ randomFood: pick })
  },

  closeRandom() {
    this.setData({ showRandom: false, randomFood: null })
  },

  goMenu() { wx.navigateTo({ url: '/pages/menu/menu' }) }
})
