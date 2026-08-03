// pages/menu/menu.js - 菜品管理
const db = wx.cloud.database()
const { matchNutrition } = require('../../utils/nutritionDB.js')

Page({
  data: {
    currentMeal: 'breakfast',
    meals: ['breakfast', 'lunch', 'dinner', 'snack'],
    mealName: { breakfast: '早餐', lunch: '午餐', dinner: '晚餐', snack: '加餐' },
    mealEmoji: { breakfast: '🍳', lunch: '🍱', dinner: '🍲', snack: '🍰' },
    menuList: [],
    showForm: false,
    editId: null,
    form: {
      name: '',
      emoji: '🍴',
      category: 'breakfast',
      imgUrl: ''  // 自定义上传的菜品图片
    },
    autoNutri: null,   // 自动识别的营养
    matched: false,    // 是否命中数据库
    emojiOptions: ['🍚','🍜','🍞','🥚','🥛','🍔','🍕','🍗','🐟','🥩','🥗','🍲','🥟','🍰','🍪','🧋','🍎','🍌','🥦','🧀','🌽','🍙','🍝','🥪']
  },

  onLoad(e) {
    if (e && e.meal) {
      this.setData({ currentMeal: e.meal })
    }
  },

  onShow() {
    this.loadMenu()
  },

  switchMeal(e) {
    this.setData({ currentMeal: e.currentTarget.dataset.meal })
    this.loadMenu()
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

  showAddForm() {
    this.setData({
      showForm: true,
      editId: null,
      form: { name: '', emoji: '🍴', category: this.data.currentMeal, imgUrl: '' },
      autoNutri: null,
      matched: false
    })
  },

  editMenu(e) {
    const food = e.currentTarget.dataset.food
    // 编辑时根据菜名重新识别（以最新数据库为准）
    const m = matchNutrition(food.name)
    this.setData({
      showForm: true,
      editId: food._id,
      form: { name: food.name, emoji: food.emoji || '🍴', category: food.category, imgUrl: food.imgUrl || '' },
      autoNutri: m,
      matched: m.matched
    })
  },

  hideForm() {
    this.setData({ showForm: false, editId: null, autoNutri: null, matched: false })
  },

  // 输入菜名时实时识别营养
  inputName(e) {
    const name = e.detail.value
    const m = matchNutrition(name)
    this.setData({ 'form.name': name, autoNutri: m, matched: m.matched })
  },

  pickEmoji(e) { this.setData({ 'form.emoji': e.currentTarget.dataset.emoji }) },
  pickCategory(e) { this.setData({ 'form.category': e.currentTarget.dataset.cat }) },

  // ===== 自定义上传菜品图片 =====
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: res => {
        const tempPath = res.tempFiles[0].tempFilePath
        wx.showLoading({ title: '上传中...' })
        // 上传到云存储
        const cloudPath = 'menu-images/' + Date.now() + '-' + Math.floor(Math.random() * 1000) + '.jpg'
        wx.cloud.uploadFile({
          cloudPath: cloudPath,
          filePath: tempPath,
          success: r => {
            wx.hideLoading()
            this.setData({ 'form.imgUrl': r.fileID })
            wx.showToast({ title: '图片已上传', icon: 'success' })
          },
          fail: err => {
            wx.hideLoading()
            console.error('上传图片失败', err)
            wx.showToast({ title: '上传失败，请重试', icon: 'none' })
          }
        })
      }
    })
  },

  // 移除已上传的图片
  removeImage() {
    this.setData({ 'form.imgUrl': '' })
    wx.showToast({ title: '已移除图片', icon: 'none' })
  },

  // 重新识别
  reMatch() {
    const m = matchNutrition(this.data.form.name)
    this.setData({ autoNutri: m, matched: m.matched })
    wx.showToast({ title: m.matched ? '已识别' : '未命中库，用估算值', icon: 'none' })
  },

  saveMenu() {
    const f = this.data.form
    if (!f.name.trim()) {
      wx.showToast({ title: '请输入菜品名', icon: 'none' })
      return
    }
    // 营养来自自动识别
    const nutri = this.data.autoNutri || matchNutrition(f.name)
    const data = {
      name: f.name.trim(),
      emoji: f.emoji,
      category: f.category,
      imgUrl: f.imgUrl || '',
      calories: nutri.calories,
      protein: nutri.protein,
      fat: nutri.fat,
      carb: nutri.carb,
      fiber: nutri.fiber,
      sugar: nutri.sugar,
      sodium: nutri.sodium,
      calcium: nutri.calcium,
      vitA: nutri.vitA,
      matched: nutri.matched
    }
    wx.showLoading({ title: '保存中' })
    if (this.data.editId) {
      db.collection('menus').doc(this.data.editId).update({ data }).then(() => {
        wx.hideLoading()
        wx.showToast({ title: '已保存', icon: 'success' })
        this.setData({ currentMeal: f.category, showForm: false, editId: null, autoNutri: null })
        this.loadMenu()
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '保存失败', icon: 'none' })
      })
    } else {
      db.collection('menus').add({ data }).then(() => {
        wx.hideLoading()
        wx.showToast({ title: '已添加', icon: 'success' })
        this.setData({ currentMeal: f.category, showForm: false, editId: null, autoNutri: null })
        this.loadMenu()
      }).catch(() => {
        wx.hideLoading()
        wx.showToast({ title: '添加失败', icon: 'none' })
      })
    }
  },

  deleteMenu(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除菜品',
      content: '确定删除这道菜吗？',
      success: res => {
        if (res.confirm) {
          db.collection('menus').doc(id).remove().then(() => {
            wx.showToast({ title: '已删除', icon: 'none' })
            this.loadMenu()
          })
        }
      }
    })
  },

  // ===== 一键清空当前餐次菜品 =====
  clearCurrentMeal() {
    const meal = this.data.currentMeal
    const mealName = this.data.mealName[meal]
    const list = this.data.menuList

    if (!list || list.length === 0) {
      wx.showToast({ title: mealName + '还没有菜品', icon: 'none' })
      return
    }

    wx.showModal({
      title: '一键清空' + mealName,
      content: '将清空' + mealName + '下所有 ' + list.length + ' 道菜品，此操作不可恢复。是否继续？',
      confirmText: '清空',
      cancelText: '取消',
      confirmColor: '#FF6B8A',
      success: res => {
        if (res.confirm) this.doClearCurrentMeal(list, mealName)
      }
    })
  },

  doClearCurrentMeal(list, mealName) {
    wx.showLoading({ title: '清空中...' })
    const tasks = list.map(m => db.collection('menus').doc(m._id).remove())
    Promise.all(tasks).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '已清空' + list.length + '道菜', icon: 'success' })
      this.loadMenu()
    }).catch(err => {
      wx.hideLoading()
      console.error('清空失败', err)
      wx.showToast({ title: '部分删除失败，请重试', icon: 'none' })
      this.loadMenu()
    })
  },

  // ===== 一键导入基础菜单 =====
  importBaseMenu() {
    wx.showModal({
      title: '一键导入基础菜单',
      content: '将为早午晚餐及加餐自动添加约41道菜品（含情侣专属），营养自动识别。已存在的菜品会自动跳过，不会重复。是否继续？',
      confirmColor: '#FF6B8A',
      success: res => {
        if (res.confirm) this.doImport()
      }
    })
  },

  // 基础菜单清单（单例，避免重复定义）
  getBaseMenus() {
    return [
      // 早餐 10 道
      { name: '小米粥', emoji: '🍚', category: 'breakfast' },
      { name: '白粥', emoji: '🍚', category: 'breakfast' },
      { name: '水煮蛋', emoji: '🥚', category: 'breakfast' },
      { name: '茶叶蛋', emoji: '🥚', category: 'breakfast' },
      { name: '牛奶', emoji: '🥛', category: 'breakfast' },
      { name: '豆浆', emoji: '🥛', category: 'breakfast' },
      { name: '全麦面包', emoji: '🍞', category: 'breakfast' },
      { name: '煎蛋', emoji: '🍳', category: 'breakfast' },
      { name: '包子', emoji: '🥟', category: 'breakfast' },
      { name: '燕麦', emoji: '🥣', category: 'breakfast' },

      // 午餐 12 道
      { name: '米饭', emoji: '🍚', category: 'lunch' },
      { name: '番茄炒蛋', emoji: '🍳', category: 'lunch' },
      { name: '宫保鸡丁', emoji: '🍗', category: 'lunch' },
      { name: '红烧鸡腿', emoji: '🍗', category: 'lunch' },
      { name: '鱼香肉丝', emoji: '🥩', category: 'lunch' },
      { name: '清炒西兰花', emoji: '🥦', category: 'lunch' },
      { name: '麻婆豆腐', emoji: '🧈', category: 'lunch' },
      { name: '酸菜鱼', emoji: '🐟', category: 'lunch' },
      { name: '青椒肉丝', emoji: '🫑', category: 'lunch' },
      { name: '土豆丝', emoji: '🥔', category: 'lunch' },
      { name: '蛋炒饭', emoji: '🍚', category: 'lunch' },
      { name: '排骨', emoji: '🍖', category: 'lunch' },

      // 晚餐 12 道（与午餐无重复）
      { name: '杂粮饭', emoji: '🍚', category: 'dinner' },
      { name: '紫菜蛋花汤', emoji: '🍲', category: 'dinner' },
      { name: '清蒸鱼', emoji: '🐟', category: 'dinner' },
      { name: '红烧肉', emoji: '🥩', category: 'dinner' },
      { name: '鸡汤', emoji: '🍲', category: 'dinner' },
      { name: '炒青菜', emoji: '🥬', category: 'dinner' },
      { name: '西红柿牛腩', emoji: '🍅', category: 'dinner' },
      { name: '虾仁', emoji: '🦐', category: 'dinner' },
      { name: '凉拌黄瓜', emoji: '🥒', category: 'dinner' },
      { name: '豆腐', emoji: '🧈', category: 'dinner' },
      { name: '蒜蓉粉丝虾', emoji: '🦐', category: 'dinner' },
      { name: '南瓜粥', emoji: '🎃', category: 'dinner' },

      // 专属加餐 7 道（含情侣专属）
      { name: '耙耙柑', emoji: '🍊', category: 'snack' },
      { name: '蓝莓', emoji: '🫐', category: 'snack' },
      { name: '野人先生冰淇淋', emoji: '🍨', category: 'snack' },
      { name: '仟吉蛋糕', emoji: '🍰', category: 'snack' },
      { name: '小蛋糕', emoji: '🧁', category: 'snack' },
      { name: '师兄的亲亲', emoji: '💋', category: 'snack' },
      { name: '老婆的亲亲', emoji: '💋', category: 'snack' }
    ]
  },

  doImport() {
    const baseMenus = this.getBaseMenus()
    wx.showLoading({ title: '检查已有菜品...' })

    // 第一步：查询数据库已有的菜品名（用于去重）
    db.collection('menus').field({ name: true, category: true }).get().then(res => {
      const existing = (res.data || []).map(m => (m.name || '').trim())
      const existingSet = new Set(existing)

      // 过滤掉已存在的菜品（按名称去重）
      const toAdd = baseMenus.filter(m => !existingSet.has(m.name))
      const skipped = baseMenus.length - toAdd.length

      if (toAdd.length === 0) {
        // 全部已存在
        wx.hideLoading()
        wx.showModal({
          title: '无需导入',
          content: '所有' + baseMenus.length + '道菜品已存在，没有需要新增的。是否要清空后重新导入？',
          confirmText: '清空重导',
          cancelText: '取消',
          confirmColor: '#FF6B8A',
          success: r => {
            if (r.confirm) this.clearAndImport()
          }
        })
        return
      }

      // 有需要新增的菜品
      if (skipped > 0) {
        wx.hideLoading()
        wx.showModal({
          title: '检测到重复',
          content: '已有' + skipped + '道菜品，将跳过；新增' + toAdd.length + '道。是否继续？\n（如需完全替换，请选"清空重导"）',
          confirmText: '跳过重复',
          cancelText: '清空重导',
          confirmColor: '#FF6B8A',
          success: r => {
            if (r.confirm) {
              // 跳过重复，只新增
              this.batchAdd(toAdd)
            } else if (r.cancel) {
              // 清空后重新导入
              this.clearAndImport()
            }
          }
        })
      } else {
        // 没有重复，直接导入
        this.batchAdd(toAdd)
      }
    }).catch(err => {
      wx.hideLoading()
      console.error('查询已有菜品失败', err)
      // 查询失败时直接尝试导入全部
      this.batchAdd(baseMenus)
    })
  },

  // 清空所有菜品后重新导入
  clearAndImport() {
    wx.showLoading({ title: '清空中...' })
    // 云数据库批量删除需要用 where + remove（仅管理员权限）
    // 个人开发模式下，逐条删除更稳妥
    db.collection('menus').get().then(res => {
      const all = res.data || []
      const delTasks = all.map(m => db.collection('menus').doc(m._id).remove())
      Promise.all(delTasks).then(() => {
        wx.hideLoading()
        const baseMenus = this.getBaseMenus()
        this.batchAdd(baseMenus)
      }).catch(err => {
        wx.hideLoading()
        console.error('清空失败', err)
        wx.showToast({ title: '清空失败，请重试', icon: 'none' })
      })
    }).catch(err => {
      wx.hideLoading()
      console.error('查询失败', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    })
  },

  // 批量添加菜品
  batchAdd(menus) {
    if (!menus || !menus.length) {
      wx.showToast({ title: '没有需要导入的菜品', icon: 'none' })
      return
    }
    wx.showLoading({ title: '导入中...' })
    const tasks = menus.map(m => {
      const nutri = matchNutrition(m.name)
      return db.collection('menus').add({
        data: {
          name: m.name,
          emoji: m.emoji,
          category: m.category,
          imgUrl: '',
          calories: nutri.calories,
          protein: nutri.protein,
          fat: nutri.fat,
          carb: nutri.carb,
          fiber: nutri.fiber,
          sugar: nutri.sugar,
          sodium: nutri.sodium,
          calcium: nutri.calcium,
          vitA: nutri.vitA,
          matched: nutri.matched
        }
      })
    })

    Promise.all(tasks).then(() => {
      wx.hideLoading()
      wx.showToast({ title: '已导入' + menus.length + '道菜', icon: 'success' })
      this.loadMenu()
    }).catch(err => {
      wx.hideLoading()
      console.error('导入失败', err)
      wx.showToast({ title: '部分导入失败，请重试', icon: 'none' })
      this.loadMenu()
    })
  }
})
