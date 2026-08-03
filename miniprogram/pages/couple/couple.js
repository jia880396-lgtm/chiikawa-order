// pages/couple/couple.js - 情侣互动页
const app = getApp()
const db = wx.cloud.database()

Page({
  data: {
    role: 'boyfriend',
    messages: [],
    inputContent: '',
    showLoveAnim: false,
    loveHearts: [],
    todayCount: 0,
    quickActions: [
      { type: 'hug', emoji: '🤗', label: '抱抱' },
      { type: 'kiss', emoji: '😘', label: '亲亲' },
      { type: 'cheer', emoji: '💪', label: '加油' },
      { type: 'goodnight', emoji: '🌙', label: '晚安' }
    ],
    typeMap: {
      think: { label: '想你了', emoji: '💕', content: '想你了 💕', toast: '已把想你发送给TA啦~' },
      hug: { label: '抱抱', emoji: '🤗', content: '想要一个抱抱~', toast: '给TA一个大大的拥抱~' },
      kiss: { label: '亲亲', emoji: '😘', content: '么么哒~亲亲！', toast: '么么哒~亲亲发送成功！' },
      cheer: { label: '加油', emoji: '💪', content: '为你加油打气！', toast: '已为TA加油打气~' },
      goodnight: { label: '晚安', emoji: '🌙', content: '晚安好梦~', toast: '晚安好梦~' },
      custom: { label: '留言', emoji: '💌', content: '', toast: '留言发送成功~' }
    }
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.setData({ role: app.globalData.role || 'boyfriend' })
    this.loadMessages()
  },

  onUnload() {
    if (this._loveTimer) clearTimeout(this._loveTimer)
  },

  // 加载所有互动记录
  loadMessages() {
    db.collection('messages').orderBy('createTime', 'desc').limit(100).get().then(res => {
      const typeMap = this.data.typeMap
      const myRole = app.globalData.role
      const messages = res.data.map(item => {
        const typeInfo = typeMap[item.type] || { label: '互动', emoji: '💕' }
        return {
          _id: item._id,
          type: item.type,
          typeLabel: typeInfo.label,
          typeEmoji: typeInfo.emoji,
          content: item.content || typeInfo.label,
          role: item.role,
          roleEmoji: item.role === 'boyfriend' ? '👦' : '👧',
          isMine: item.role === myRole,
          timeText: this.formatTime(item.createTime)
        }
      })
      const todayCount = res.data.filter(item => this.isToday(item.createTime)).length
      this.setData({ messages, todayCount })
    }).catch(err => {
      console.error('加载互动记录失败', err)
    })
  },

  // 想你了 - 大按钮
  sendThink() {
    this.showLoveAnimation()
    db.collection('messages').add({
      data: {
        type: 'think',
        content: '想你了 💕',
        role: app.globalData.role,
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.showToast({ title: '已把想你发送给TA啦~', icon: 'none' })
      this.loadMessages()
    }).catch(err => {
      console.error('发送失败', err)
      wx.showToast({ title: '发送失败', icon: 'none' })
    })
  },

  // 快捷互动
  quickAction(e) {
    const type = e.currentTarget.dataset.type
    const typeInfo = this.data.typeMap[type]
    if (!typeInfo) return
    db.collection('messages').add({
      data: {
        type: type,
        content: typeInfo.content,
        role: app.globalData.role,
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.showToast({ title: typeInfo.toast, icon: 'none' })
      this.loadMessages()
    }).catch(err => {
      console.error('发送失败', err)
      wx.showToast({ title: '发送失败', icon: 'none' })
    })
  },

  // 留言输入
  onInput(e) {
    this.setData({ inputContent: e.detail.value })
  },

  // 发送自定义留言
  sendMessage() {
    const content = (this.data.inputContent || '').trim()
    if (!content) {
      wx.showToast({ title: '写点什么再发送吧~', icon: 'none' })
      return
    }
    db.collection('messages').add({
      data: {
        type: 'custom',
        content: content,
        role: app.globalData.role,
        createTime: db.serverDate()
      }
    }).then(() => {
      wx.showToast({ title: '留言发送成功~', icon: 'none' })
      this.setData({ inputContent: '' })
      this.loadMessages()
    }).catch(err => {
      console.error('发送失败', err)
      wx.showToast({ title: '发送失败', icon: 'none' })
    })
  },

  // 显示爱心飞舞动画
  showLoveAnimation() {
    const hearts = []
    const count = 14
    for (let i = 0; i < count; i++) {
      hearts.push({
        left: Math.random() * 90 + 5,
        delay: (Math.random() * 0.8).toFixed(2),
        duration: (1.4 + Math.random() * 0.8).toFixed(2),
        offsetX: Math.round((Math.random() - 0.5) * 200),
        rotate: Math.round((Math.random() - 0.5) * 720),
        size: Math.round(40 + Math.random() * 40)
      })
    }
    this.setData({ showLoveAnim: true, loveHearts: hearts })
    if (this._loveTimer) clearTimeout(this._loveTimer)
    this._loveTimer = setTimeout(() => {
      this.setData({ showLoveAnim: false, loveHearts: [] })
    }, 2000)
  },

  // 格式化时间 MM-DD HH:mm
  formatTime(date) {
    let d
    if (date instanceof Date) {
      d = date
    } else if (typeof date === 'string') {
      d = new Date(date)
    } else if (date && date.$date) {
      d = new Date(date.$date)
    } else {
      d = new Date(date)
    }
    if (isNaN(d.getTime())) return ''
    const m = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const h = d.getHours().toString().padStart(2, '0')
    const min = d.getMinutes().toString().padStart(2, '0')
    return m + '-' + day + ' ' + h + ':' + min
  },

  // 判断是否是今天
  isToday(date) {
    let d
    if (date instanceof Date) {
      d = date
    } else if (typeof date === 'string') {
      d = new Date(date)
    } else if (date && date.$date) {
      d = new Date(date.$date)
    } else {
      d = new Date(date)
    }
    if (isNaN(d.getTime())) return false
    const now = new Date()
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate()
  }
})
