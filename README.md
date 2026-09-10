# 🍳 师兄宝宝和老婆大人的专属厨房

> 一个以吉伊卡哇（Chiikawa）为主题、专为两个人打造的微信小程序「点餐 · 营养 · 互动」小工具。

![预览](miniprogram/images/chiikawa_main.jpg)

## ✨ 功能特性

| 模块 | 说明 |
| --- | --- |
| 🏠 首页 | 温馨入口，吉伊卡哇主题欢迎页 |
| 🍽️ 点餐 | 在线点餐下单，记录想吃的菜 |
| 📋 菜单 | 浏览菜品清单 |
| 🥗 营养 | 查看菜品营养信息 |
| 💕 互动 | 情侣专属互动（可切换「男朋友 / 女朋友」身份） |
| ⚖️ 体重 | 记录与追踪体重变化 |

## 🧱 技术架构

- **微信小程序原生**（WXML / WXSS / JavaScript）
- **微信云开发**：云函数 `login` 获取用户 `openid` + 云数据库存储
- **自定义 tabBar**（`custom-tab-bar`），粉色系主题
- 角色身份切换：`boyfriend` / `girlfriend`

## 📂 目录结构

```
chiikawa-order/
├── miniprogram/          # 小程序前端
│   ├── pages/            # 页面：index / order / menu / nutrition / couple / weight
│   ├── custom-tab-bar/   # 自定义底部导航
│   ├── images/           # 吉伊卡哇主题图片
│   ├── app.js            # 入口：云开发初始化 + 登录
│   ├── app.json          # 全局配置（页面注册 / tabBar / 窗口）
│   └── app.wxss
├── cloudfunctions/       # 云函数
│   └── login/            # 登录：获取 openid
├── preview.html          # 浏览器预览页
├── project.config.json   # 微信开发者工具配置
└── .gitignore
```

## 🚀 本地运行

1. 安装并打开 **微信开发者工具**。
2. 导入项目，选择本仓库根目录；
   - `project.config.json` 中的 `appid` 当前为空，请填入你自己的小程序 AppID（或使用测试号）。
3. 开通 **云开发**：在开发者工具顶部点击「云开发」，创建环境后，
   将环境 ID 填入 `miniprogram/app.js` 的 `globalData.cloudEnv`。
4. 在「云开发」控制台中上传并部署 `cloudfunctions/login` 云函数。
5. 编译预览，即可在模拟器或真机运行。

## ⚙️ 配置说明

| 配置项 | 位置 | 说明 |
| --- | --- | --- |
| 小程序 AppID | `project.config.json` | 替换为你的小程序 AppID |
| 云环境 ID | `miniprogram/app.js` → `globalData.cloudEnv` | 替换为你的云开发环境 ID |
| 用户角色 | 运行时 `Storage.role` | `boyfriend` / `girlfriend` |

## 📝 说明

本项目为私人情侣项目，仅供学习与交流使用。
