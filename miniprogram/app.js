// app.js - 吉伊卡哇点餐小程序入口
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: this.globalData.cloudEnv
      })
    }
    // 读取本地保存的身份标识
    const role = wx.getStorageSync('role')
    if (role) {
      this.globalData.role = role
    }
    this.login()
  },

  // 云端登录，获取 openid
  login: function () {
    if (this.globalData.openid) {
      return Promise.resolve(this.globalData.openid)
    }
    return wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      this.globalData.openid = res.result.openid
      return res.result.openid
    }).catch(err => {
      console.error('登录失败', err)
      return null
    })
  },

  globalData: {
    openid: null,
    role: 'boyfriend', // boyfriend 或 girlfriend，标识当前用户身份
    cloudEnv: 'cloud1-d4g6itkstacbb3bcb' // 云开发环境ID，请在开发者工具云开发面板查看后填入
  }
})
