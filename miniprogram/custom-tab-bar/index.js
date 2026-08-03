// custom-tab-bar/index.js - 自定义底部导航
Component({
  data: {
    selected: 0,
    color: "#B0A0A0",
    selectedColor: "#FF6B8A",
    list: [
      { pagePath: "/pages/index/index", text: "首页", icon: "🏠" },
      { pagePath: "/pages/order/order", text: "点餐", icon: "🍱" },
      { pagePath: "/pages/couple/couple", text: "互动", icon: "💕" },
      { pagePath: "/pages/weight/weight", text: "体重", icon: "⚖️" }
    ]
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      wx.switchTab({ url: data.path })
      this.setData({ selected: data.index })
    }
  }
})
