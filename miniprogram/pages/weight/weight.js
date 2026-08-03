// pages/weight/weight.js - 体重管理
const app = getApp()
const { today } = require('../../utils/util.js')
const db = wx.cloud.database()

Page({
  data: {
    role: 'boyfriend',
    viewMode: 'both', // 'boyfriend' | 'girlfriend' | 'both'
    weights: [],
    today: '',
    showForm: false,
    form: {
      role: 'boyfriend',
      weight: '',
      date: ''
    },
    showSweetTip: false, // 女朋友记录体重后弹出甜蜜提示
    stats: {
      boyfriend: { latest: null, change: 0, count: 0 },
      girlfriend: { latest: null, change: 0, count: 0 }
    },
    // 预算好的 class，避免 WXML 里写复杂三元表达式
    clsBf: '',
    clsGf: '',
    clsBoth: '',
    dotBf: 'blue-fade',
    dotGf: 'pink-fade',
    formClsBf: '',
    formClsGf: ''
  },

  // 根据 viewMode 计算切换按钮的 class
  computeSwitchClass() {
    const v = this.data.viewMode
    const f = this.data.form.role
    this.setData({
      clsBf: v === 'boyfriend' ? 'switch-item active blue' : 'switch-item',
      clsGf: v === 'girlfriend' ? 'switch-item active pink' : 'switch-item',
      clsBoth: v === 'both' ? 'switch-item active' : 'switch-item',
      dotBf: v === 'boyfriend' ? 'dot blue' : 'dot blue-fade',
      dotGf: v === 'girlfriend' ? 'dot pink' : 'dot pink-fade',
      formClsBf: f === 'boyfriend' ? 'role-option active blue-active' : 'role-option',
      formClsGf: f === 'girlfriend' ? 'role-option active pink-active' : 'role-option'
    })
  },

  onLoad() {
    this.setData({ today: today() })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 })
    }
    const role = app.globalData.role
    this.setData({
      role,
      'form.role': role,
      'form.date': today()
    })
    this.computeSwitchClass()
    this.loadWeights()
  },

  onReady() {
    // 兜底：确保 canvas 就绪后绘制一次
    this.drawChart()
  },

  loadWeights() {
    db.collection('weights')
      .orderBy('date', 'desc')
      .limit(100)
      .get()
      .then(res => {
        const weights = (res.data || []).map(w => ({
          ...w,
          // 预算身份显示，避免 WXML 里写三元
          roleEmoji: w.role === 'boyfriend' ? '👦' : '👧',
          roleName: w.role === 'boyfriend' ? '男朋友' : '女朋友'
        }))
        this.setData({ weights })
        this.computeStats(weights)
        this.drawChart()
      })
      .catch(err => {
        console.error('加载体重记录失败', err)
        this.drawChart()
      })
  },

  computeStats(weights) {
    const stats = {
      boyfriend: { latest: null, change: 0, count: 0, changeSign: '', changeEmoji: '😊' },
      girlfriend: { latest: null, change: 0, count: 0, changeSign: '', changeEmoji: '😊' }
    }
    ;['boyfriend', 'girlfriend'].forEach(r => {
      const list = weights
        .filter(w => w.role === r)
        .sort((a, b) => a.date.localeCompare(b.date))
      if (list.length > 0) {
        stats[r].latest = list[list.length - 1]
        stats[r].count = list.length
        if (list.length >= 2) {
          const diff = list[list.length - 1].weight - list[list.length - 2].weight
          stats[r].change = +(Math.round(diff * 10) / 10)
          // 预算变化符号和表情，避免 WXML 三元嵌套
          stats[r].changeSign = diff > 0 ? '+' : ''
          stats[r].changeEmoji = diff > 0 ? '😮' : (diff < 0 ? '💪' : '😊')
        }
      }
    })
    this.setData({ stats })
  },

  switchView(e) {
    const mode = e.currentTarget.dataset.mode
    if (mode === this.data.viewMode) return
    this.setData({ viewMode: mode })
    this.computeSwitchClass()
    this.drawChart()
  },

  // ============ canvas 2d 折线图 ============
  drawChart() {
    const query = wx.createSelectorQuery()
    query
      .select('#weightChart')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res || !res[0] || !res[0].node) return
        const canvas = res[0].node
        const width = res[0].width
        const height = res[0].height
        const dpr = (wx.getSystemInfoSync().pixelRatio) || 1
        canvas.width = width * dpr
        canvas.height = height * dpr
        const ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        this.renderChart(ctx, width, height)
      })
  },

  renderChart(ctx, width, height) {
    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const weights = this.data.weights
    const viewMode = this.data.viewMode
    const roles = viewMode === 'both' ? ['boyfriend', 'girlfriend'] : [viewMode]
    const roleColors = { boyfriend: '#6BB6FF', girlfriend: '#FF6B8A' }

    // 收集每个角色的数据(按日期升序)
    const series = {}
    const dateSet = new Set()
    roles.forEach(r => {
      const list = weights
        .filter(w => w.role === r)
        .sort((a, b) => a.date.localeCompare(b.date))
      series[r] = list
      list.forEach(w => dateSet.add(w.date))
    })
    const dates = Array.from(dateSet).sort((a, b) => a.localeCompare(b))

    const padding = { left: 42, right: 16, top: 18, bottom: 36 }
    const chartW = width - padding.left - padding.right
    const chartH = height - padding.top - padding.bottom

    // 无数据提示
    if (dates.length === 0 || roles.every(r => series[r].length === 0)) {
      ctx.fillStyle = '#C8B8B8'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('还没有记录哦~', width / 2, height / 2)
      return
    }

    // 纵轴范围
    const allValues = []
    roles.forEach(r => series[r].forEach(w => allValues.push(w.weight)))
    let minV = Math.min.apply(null, allValues)
    let maxV = Math.max.apply(null, allValues)
    if (minV === maxV) {
      minV -= 2
      maxV += 2
    } else {
      const pad = (maxV - minV) * 0.15
      minV = Math.floor(minV - pad)
      maxV = Math.ceil(maxV + pad)
    }

    // 纵轴刻度
    const tickCount = 5
    const tickStep = (maxV - minV) / (tickCount - 1)
    const yTicks = []
    for (let i = 0; i < tickCount; i++) {
      yTicks.push(+(minV + tickStep * i).toFixed(1))
    }

    // 网格线 + 纵轴标签
    ctx.strokeStyle = '#FFE5EC'
    ctx.lineWidth = 1
    ctx.fillStyle = '#B0A0A0'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    yTicks.forEach((v, i) => {
      const y = padding.top + chartH - (i / (tickCount - 1)) * chartH
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left + chartW, y)
      ctx.stroke()
      ctx.fillText(v.toString(), padding.left - 6, y)
    })

    // 坐标计算
    const xOf = idx => {
      if (dates.length <= 1) return padding.left + chartW / 2
      return padding.left + (idx / (dates.length - 1)) * chartW
    }
    const yOf = val => {
      return padding.top + chartH - ((val - minV) / (maxV - minV)) * chartH
    }

    // 横轴日期标签
    ctx.fillStyle = '#B0A0A0'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const maxLabels = 5
    const step = Math.max(1, Math.ceil(dates.length / maxLabels))
    dates.forEach((d, idx) => {
      if (idx % step === 0 || idx === dates.length - 1) {
        ctx.fillText(d.slice(5), xOf(idx), padding.top + chartH + 8)
      }
    })

    // 绘制每个角色的折线
    roles.forEach(r => {
      const list = series[r]
      if (list.length === 0) return
      const color = roleColors[r]
      const points = list.map(w => {
        const idx = dates.indexOf(w.date)
        return { x: xOf(idx), y: yOf(w.weight) }
      })

      // 填充区域
      if (points.length >= 2) {
        ctx.beginPath()
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.lineTo(points[points.length - 1].x, padding.top + chartH)
        ctx.lineTo(points[0].x, padding.top + chartH)
        ctx.closePath()
        ctx.fillStyle = this.hexToRgba(color, 0.12)
        ctx.fill()
      }

      // 折线
      if (points.length >= 2) {
        ctx.beginPath()
        points.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y)
          else ctx.lineTo(p.x, p.y)
        })
        ctx.strokeStyle = color
        ctx.lineWidth = 2.5
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.stroke()
      }

      // 数据点(实心圆 + 白边)
      points.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })
    })
  },

  hexToRgba(hex, alpha) {
    const h = hex.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')'
  },

  // ============ 记录表单 ============
  openForm() {
    this.setData({
      showForm: true,
      'form.role': this.data.role,
      'form.weight': '',
      'form.date': today()
    })
    this.computeSwitchClass()
  },

  closeForm() {
    this.setData({ showForm: false })
    // canvas 用 wx:if 控制，关闭弹窗后需等 canvas 重新挂载再绘图
    setTimeout(() => { this.drawChart() }, 200)
  },

  stopPropagation() {},

  pickRole(e) {
    this.setData({ 'form.role': e.currentTarget.dataset.role })
    this.computeSwitchClass()
  },

  onWeightInput(e) {
    this.setData({ 'form.weight': e.detail.value })
  },

  onDateChange(e) {
    this.setData({ 'form.date': e.detail.value })
  },

  submitWeight() {
    const role = this.data.form.role
    const date = this.data.form.date
    const w = parseFloat(this.data.form.weight)
    if (!w || w <= 0 || w > 500) {
      wx.showToast({ title: '请输入有效体重', icon: 'none' })
      return
    }
    if (!date) {
      wx.showToast({ title: '请选择日期', icon: 'none' })
      return
    }
    wx.showLoading({ title: '保存中...' })
    db.collection('weights')
      .add({
        data: {
          date: date,
          weight: w,
          role: role,
          createTime: db.serverDate()
        }
      })
      .then(() => {
        wx.hideLoading()
        this.setData({ showForm: false })
        this.loadWeights()
        // 女朋友记录体重后，弹出师兄的专属甜蜜告白
        if (role === 'girlfriend') {
          setTimeout(() => {
            this.setData({ showSweetTip: true })
          }, 400)
        } else {
          wx.showToast({ title: '记录成功~', icon: 'success' })
        }
      })
      .catch(err => {
        wx.hideLoading()
        console.error('保存体重失败', err)
        wx.showToast({ title: '保存失败', icon: 'none' })
      })
  },

  // 关闭甜蜜提示
  closeSweetTip() {
    this.setData({ showSweetTip: false })
    // canvas 重新挂载后需要重新绘制
    setTimeout(() => { this.drawChart() }, 200)
  },

  deleteWeight(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条体重记录吗？',
      confirmColor: '#FF6B8A',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' })
          db.collection('weights')
            .doc(id)
            .remove()
            .then(() => {
              wx.hideLoading()
              wx.showToast({ title: '已删除', icon: 'success' })
              this.loadWeights()
            })
            .catch(err => {
              wx.hideLoading()
              console.error('删除失败', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            })
        }
      }
    })
  }
})
