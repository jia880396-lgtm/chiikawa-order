// utils/util.js - 通用工具函数

// 日期格式化 YYYY-MM-DD
const formatDate = (date) => {
  const d = date || new Date()
  const y = d.getFullYear()
  const m = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

const today = () => formatDate(new Date())

// 根据当前时间判断餐次
const getMealType = () => {
  const h = new Date().getHours()
  if (h < 10) return 'breakfast'
  if (h < 14) return 'lunch'
  if (h < 17) return 'snack'
  return 'dinner'
}

const mealName = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐'
}

const mealEmoji = {
  breakfast: '🍳',
  lunch: '🍱',
  dinner: '🍲',
  snack: '🍰'
}

// 营养建议摄入量（参考中国DRIs，女性轻体力劳动）
const dailyTarget = {
  calories: 1800,
  protein: 65,
  fat: 60,
  carb: 250,
  fiber: 25,
  sugar: 50,
  sodium: 1500,
  calcium: 800,
  vitA: 700
}

module.exports = {
  formatDate,
  today,
  getMealType,
  mealName,
  mealEmoji,
  dailyTarget
}
