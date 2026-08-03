// utils/nutritionDB.js - 食物营养数据库 + 智能匹配
// 数据为"常见一份"的营养值（来源：中国食物成分表估算）
// 字段: cal(大卡) pro(蛋白g) fat(脂肪g) carb(碳水g) fiber(膳食纤维g) sugar(糖g) sodium(钠mg) calcium(钙mg) vitA(维Aμg)

const NUTRI_DB = [
  // === 早餐主食 ===
  { keys: ['小米粥'], cal: 138, pro: 4, fat: 1.5, carb: 30, fiber: 0.9, sugar: 0.6, sodium: 2, calcium: 12, vitA: 0 },
  { keys: ['白粥', '大米粥'], cal: 140, pro: 3, fat: 0.5, carb: 30, fiber: 0.5, sugar: 0.3, sodium: 1, calcium: 5, vitA: 0 },
  { keys: ['八宝粥'], cal: 200, pro: 5, fat: 1, carb: 42, fiber: 2, sugar: 16, sodium: 3, calcium: 25, vitA: 0 },
  { keys: ['红豆粥'], cal: 200, pro: 6, fat: 0.5, carb: 42, fiber: 4, sugar: 12, sodium: 3, calcium: 40, vitA: 0 },
  { keys: ['南瓜粥'], cal: 160, pro: 3, fat: 0.5, carb: 36, fiber: 1.5, sugar: 8, sodium: 3, calcium: 25, vitA: 150 },
  { keys: ['皮蛋瘦肉粥'], cal: 230, pro: 10, fat: 6, carb: 32, fiber: 0.6, sugar: 1, sodium: 700, calcium: 25, vitA: 30 },
  { keys: ['燕麦', '麦片'], cal: 150, pro: 5, fat: 3, carb: 27, fiber: 4, sugar: 1, sodium: 2, calcium: 30, vitA: 0 },
  { keys: ['全麦面包', '全麦吐司'], cal: 200, pro: 7, fat: 3, carb: 36, fiber: 3, sugar: 4, sodium: 300, calcium: 60, vitA: 0 },
  { keys: ['面包', '吐司'], cal: 210, pro: 6, fat: 4, carb: 38, fiber: 1.5, sugar: 6, sodium: 350, calcium: 50, vitA: 0 },
  { keys: ['馒头'], cal: 220, pro: 6, fat: 1, carb: 47, fiber: 1.5, sugar: 1, sodium: 200, calcium: 30, vitA: 0 },
  { keys: ['花卷'], cal: 220, pro: 6, fat: 2, carb: 45, fiber: 1.5, sugar: 1, sodium: 250, calcium: 30, vitA: 0 },
  { keys: ['包子', '肉包'], cal: 230, pro: 9, fat: 10, carb: 26, fiber: 1, sugar: 2, sodium: 350, calcium: 30, vitA: 20 },
  { keys: ['菜包', '素包'], cal: 180, pro: 6, fat: 5, carb: 28, fiber: 2, sugar: 2, sodium: 300, calcium: 40, vitA: 80 },
  { keys: ['豆沙包'], cal: 240, pro: 6, fat: 4, carb: 46, fiber: 2, sugar: 22, sodium: 200, calcium: 30, vitA: 10 },
  { keys: ['油条'], cal: 220, pro: 5, fat: 12, carb: 24, fiber: 1, sugar: 1, sodium: 400, calcium: 20, vitA: 0 },
  { keys: ['烧饼'], cal: 260, pro: 6, fat: 8, carb: 40, fiber: 1.5, sugar: 1, sodium: 450, calcium: 30, vitA: 0 },
  { keys: ['煎饼果子', '煎饼'], cal: 330, pro: 10, fat: 14, carb: 40, fiber: 2, sugar: 2, sodium: 600, calcium: 50, vitA: 60 },
  { keys: ['手抓饼'], cal: 350, pro: 7, fat: 18, carb: 40, fiber: 1.5, sugar: 1, sodium: 500, calcium: 30, vitA: 20 },
  { keys: ['三明治'], cal: 280, pro: 12, fat: 12, carb: 32, fiber: 2, sugar: 3, sodium: 500, calcium: 80, vitA: 100 },
  { keys: ['饭团', '粢饭'], cal: 280, pro: 8, fat: 6, carb: 50, fiber: 1, sugar: 1, sodium: 400, calcium: 20, vitA: 20 },

  // === 蛋类 ===
  { keys: ['水煮蛋', '白煮蛋', '煮鸡蛋'], cal: 70, pro: 6, fat: 5, carb: 0.6, fiber: 0, sugar: 0.6, sodium: 62, calcium: 25, vitA: 117 },
  { keys: ['煎蛋', '荷包蛋'], cal: 110, pro: 6, fat: 9, carb: 0.6, fiber: 0, sugar: 0.6, sodium: 200, calcium: 25, vitA: 117 },
  { keys: ['茶叶蛋'], cal: 75, pro: 6.5, fat: 5, carb: 0.6, fiber: 0, sugar: 0.6, sodium: 400, calcium: 25, vitA: 117 },
  { keys: ['蒸蛋', '鸡蛋羹'], cal: 90, pro: 7, fat: 6, carb: 1, fiber: 0, sugar: 0.5, sodium: 300, calcium: 30, vitA: 100 },
  { keys: ['炒蛋', '滑蛋'], cal: 130, pro: 8, fat: 10, carb: 1, fiber: 0, sugar: 0.6, sodium: 250, calcium: 30, vitA: 117 },

  // === 乳品豆品 ===
  { keys: ['牛奶'], cal: 130, pro: 7.5, fat: 8, carb: 12.5, fiber: 0, sugar: 12.5, sodium: 100, calcium: 260, vitA: 75 },
  { keys: ['酸奶'], cal: 150, pro: 7, fat: 4, carb: 20, fiber: 0, sugar: 18, sodium: 70, calcium: 200, vitA: 30 },
  { keys: ['豆浆'], cal: 80, pro: 7, fat: 4, carb: 4, fiber: 1, sugar: 2, sodium: 5, calcium: 25, vitA: 0 },
  { keys: ['奶酪', '芝士'], cal: 280, pro: 18, fat: 22, carb: 2, fiber: 0, sugar: 1, sodium: 600, calcium: 520, vitA: 200 },
  { keys: ['豆腐'], cal: 90, pro: 8, fat: 5, carb: 3, fiber: 0.5, sugar: 1, sodium: 7, calcium: 105, vitA: 5 },
  { keys: ['麻婆豆腐'], cal: 220, pro: 12, fat: 14, carb: 10, fiber: 2, sugar: 2, sodium: 800, calcium: 150, vitA: 20 },
  { keys: ['豆腐脑', '豆花'], cal: 90, pro: 7, fat: 4, carb: 6, fiber: 0.5, sugar: 2, sodium: 350, calcium: 80, vitA: 5 },

  // === 米饭面食 ===
  { keys: ['米饭', '白饭'], cal: 260, pro: 5, fat: 1, carb: 55, fiber: 0.6, sugar: 0.1, sodium: 2, calcium: 10, vitA: 0 },
  { keys: ['杂粮饭', '糙米饭'], cal: 240, pro: 7, fat: 2, carb: 48, fiber: 3, sugar: 1, sodium: 3, calcium: 20, vitA: 0 },
  { keys: ['蛋炒饭'], cal: 400, pro: 10, fat: 14, carb: 58, fiber: 1.5, sugar: 2, sodium: 500, calcium: 30, vitA: 60 },
  { keys: ['炒饭'], cal: 380, pro: 9, fat: 13, carb: 55, fiber: 1.5, sugar: 2, sodium: 500, calcium: 25, vitA: 40 },
  { keys: ['炒面', '拌面'], cal: 380, pro: 12, fat: 12, carb: 56, fiber: 2, sugar: 3, sodium: 800, calcium: 30, vitA: 30 },
  { keys: ['汤面', '阳春面'], cal: 350, pro: 10, fat: 6, carb: 62, fiber: 2, sugar: 2, sodium: 1000, calcium: 25, vitA: 20 },
  { keys: ['拉面', '兰州拉面'], cal: 380, pro: 14, fat: 8, carb: 62, fiber: 2, sugar: 3, sodium: 1200, calcium: 30, vitA: 20 },
  { keys: ['意面', '意大利面'], cal: 400, pro: 14, fat: 10, carb: 62, fiber: 3, sugar: 4, sodium: 600, calcium: 40, vitA: 60 },
  { keys: ['螺蛳粉'], cal: 500, pro: 14, fat: 18, carb: 70, fiber: 2, sugar: 4, sodium: 1800, calcium: 40, vitA: 30 },
  { keys: ['饺子', '水饺'], cal: 350, pro: 14, fat: 15, carb: 40, fiber: 2, sugar: 2, sodium: 600, calcium: 40, vitA: 30 },
  { keys: ['馄饨'], cal: 300, pro: 12, fat: 12, carb: 36, fiber: 1, sugar: 2, sodium: 700, calcium: 35, vitA: 30 },
  { keys: ['汤圆'], cal: 280, pro: 5, fat: 6, carb: 52, fiber: 1, sugar: 20, sodium: 10, calcium: 30, vitA: 10 },

  // === 肉类 ===
  { keys: ['红烧鸡腿', '鸡腿'], cal: 320, pro: 28, fat: 20, carb: 8, fiber: 0.5, sugar: 4, sodium: 800, calcium: 30, vitA: 50 },
  { keys: ['红烧肉'], cal: 450, pro: 18, fat: 38, carb: 12, fiber: 0.5, sugar: 6, sodium: 600, calcium: 25, vitA: 30 },
  { keys: ['糖醋里脊', '糖醋肉'], cal: 400, pro: 18, fat: 20, carb: 38, fiber: 0.5, sugar: 20, sodium: 500, calcium: 25, vitA: 30 },
  { keys: ['宫保鸡丁'], cal: 380, pro: 20, fat: 24, carb: 20, fiber: 2, sugar: 6, sodium: 700, calcium: 40, vitA: 30 },
  { keys: ['鱼香肉丝'], cal: 320, pro: 16, fat: 20, carb: 22, fiber: 2, sugar: 8, sodium: 700, calcium: 30, vitA: 100 },
  { keys: ['回锅肉'], cal: 420, pro: 18, fat: 32, carb: 16, fiber: 1.5, sugar: 3, sodium: 700, calcium: 25, vitA: 50 },
  { keys: ['青椒肉丝'], cal: 280, pro: 16, fat: 18, carb: 12, fiber: 1.5, sugar: 3, sodium: 600, calcium: 25, vitA: 60 },
  { keys: ['可乐鸡翅', '鸡翅'], cal: 320, pro: 22, fat: 18, carb: 18, fiber: 0.3, sugar: 14, sodium: 500, calcium: 25, vitA: 40 },
  { keys: ['黄焖鸡'], cal: 380, pro: 24, fat: 22, carb: 18, fiber: 1, sugar: 4, sodium: 800, calcium: 30, vitA: 40 },
  { keys: ['排骨', '糖醋排骨'], cal: 400, pro: 20, fat: 28, carb: 16, fiber: 0.5, sugar: 8, sodium: 600, calcium: 50, vitA: 30 },
  { keys: ['牛腩', '西红柿牛腩'], cal: 380, pro: 24, fat: 22, carb: 18, fiber: 2, sugar: 6, sodium: 600, calcium: 40, vitA: 200 },
  { keys: ['牛排', '煎牛排'], cal: 400, pro: 32, fat: 28, carb: 2, fiber: 0, sugar: 0.5, sodium: 400, calcium: 20, vitA: 30 },
  { keys: ['烤肠', '香肠', '火腿肠'], cal: 290, pro: 12, fat: 24, carb: 8, fiber: 0, sugar: 2, sodium: 900, calcium: 20, vitA: 10 },
  { keys: ['培根'], cal: 200, pro: 10, fat: 17, carb: 1, fiber: 0, sugar: 0.5, sodium: 800, calcium: 10, vitA: 10 },

  // === 鱼鲜 ===
  { keys: ['酸菜鱼'], cal: 350, pro: 30, fat: 22, carb: 8, fiber: 1, sugar: 2, sodium: 1200, calcium: 80, vitA: 30 },
  { keys: ['清蒸鱼', '蒸鱼'], cal: 220, pro: 28, fat: 10, carb: 2, fiber: 0.3, sugar: 0.5, sodium: 400, calcium: 40, vitA: 40 },
  { keys: ['红烧鱼'], cal: 280, pro: 26, fat: 14, carb: 10, fiber: 0.5, sugar: 5, sodium: 700, calcium: 40, vitA: 40 },
  { keys: ['水煮鱼'], cal: 360, pro: 28, fat: 24, carb: 8, fiber: 0.5, sugar: 2, sodium: 1100, calcium: 50, vitA: 40 },
  { keys: ['虾仁', '炒虾仁'], cal: 180, pro: 18, fat: 8, carb: 8, fiber: 0.5, sugar: 1, sodium: 500, calcium: 100, vitA: 30 },
  { keys: ['虾'], cal: 150, pro: 20, fat: 5, carb: 2, fiber: 0, sugar: 0.2, sodium: 300, calcium: 100, vitA: 30 },
  { keys: ['蟹'], cal: 140, pro: 18, fat: 5, carb: 4, fiber: 0, sugar: 0.5, sodium: 400, calcium: 80, vitA: 80 },

  // === 蔬菜 ===
  { keys: ['西兰花', '清炒西兰花'], cal: 90, pro: 4, fat: 5, carb: 10, fiber: 3.5, sugar: 3, sodium: 300, calcium: 50, vitA: 60 },
  { keys: ['土豆丝', '酸辣土豆丝'], cal: 180, pro: 4, fat: 8, carb: 24, fiber: 2.5, sugar: 2, sodium: 300, calcium: 20, vitA: 5 },
  { keys: ['地三鲜'], cal: 250, pro: 5, fat: 14, carb: 28, fiber: 3, sugar: 5, sodium: 400, calcium: 50, vitA: 80 },
  { keys: ['干煸豆角', '豆角'], cal: 220, pro: 6, fat: 12, carb: 22, fiber: 3.5, sugar: 4, sodium: 500, calcium: 60, vitA: 80 },
  { keys: ['干锅花菜', '花菜'], cal: 240, pro: 6, fat: 16, carb: 20, fiber: 3, sugar: 4, sodium: 500, calcium: 50, vitA: 30 },
  { keys: ['番茄炒蛋', '西红柿炒蛋'], cal: 280, pro: 12, fat: 18, carb: 10, fiber: 2, sugar: 6, sodium: 500, calcium: 40, vitA: 300 },
  { keys: ['炒青菜', '炒菠菜', '炒油麦菜'], cal: 80, pro: 3, fat: 4, carb: 8, fiber: 2.5, sugar: 2, sodium: 350, calcium: 70, vitA: 200 },
  { keys: ['凉拌黄瓜', '拍黄瓜'], cal: 60, pro: 1.5, fat: 3, carb: 7, fiber: 1, sugar: 3, sodium: 300, calcium: 20, vitA: 30 },
  { keys: ['西红柿', '番茄'], cal: 30, pro: 1.2, fat: 0.3, carb: 6, fiber: 1.5, sugar: 4, sodium: 5, calcium: 10, vitA: 100 },

  // === 汤类 ===
  { keys: ['紫菜蛋花汤', '紫菜汤'], cal: 80, pro: 6, fat: 3, carb: 6, fiber: 0.5, sugar: 1, sodium: 500, calcium: 30, vitA: 50 },
  { keys: ['排骨汤'], cal: 280, pro: 18, fat: 20, carb: 6, fiber: 0.5, sugar: 1, sodium: 600, calcium: 60, vitA: 20 },
  { keys: ['鸡汤'], cal: 240, pro: 16, fat: 18, carb: 4, fiber: 0.3, sugar: 1, sodium: 600, calcium: 20, vitA: 40 },
  { keys: ['银耳莲子羹', '银耳汤'], cal: 180, pro: 3, fat: 1, carb: 40, fiber: 3, sugar: 20, sodium: 10, calcium: 30, vitA: 0 },
  { keys: ['绿豆汤'], cal: 150, pro: 5, fat: 0.5, carb: 32, fiber: 2, sugar: 18, sodium: 3, calcium: 30, vitA: 0 },

  // === 快餐 ===
  { keys: ['汉堡'], cal: 550, pro: 25, fat: 30, carb: 45, fiber: 2, sugar: 8, sodium: 900, calcium: 100, vitA: 80 },
  { keys: ['披萨', '比萨'], cal: 280, pro: 12, fat: 12, carb: 32, fiber: 2, sugar: 4, sodium: 600, calcium: 100, vitA: 100 },
  { keys: ['炸鸡'], cal: 400, pro: 22, fat: 26, carb: 22, fiber: 1, sugar: 1, sodium: 800, calcium: 30, vitA: 30 },
  { keys: ['麻辣香锅'], cal: 480, pro: 20, fat: 32, carb: 24, fiber: 3, sugar: 4, sodium: 1500, calcium: 60, vitA: 80 },
  { keys: ['麻辣烫'], cal: 400, pro: 18, fat: 22, carb: 32, fiber: 3, sugar: 4, sodium: 1300, calcium: 60, vitA: 80 },
  { keys: ['火锅'], cal: 450, pro: 22, fat: 28, carb: 26, fiber: 2, sugar: 4, sodium: 1400, calcium: 60, vitA: 60 },

  // === 加餐 / 零食 / 水果 ===
  { keys: ['草莓蛋糕', '蛋糕'], cal: 320, pro: 5, fat: 16, carb: 40, fiber: 1, sugar: 28, sodium: 200, calcium: 60, vitA: 80 },
  { keys: ['奶茶'], cal: 280, pro: 3, fat: 10, carb: 45, fiber: 0.5, sugar: 40, sodium: 100, calcium: 50, vitA: 20 },
  { keys: ['咖啡'], cal: 5, pro: 0.3, fat: 0, carb: 1, fiber: 0, sugar: 0, sodium: 2, calcium: 5, vitA: 0 },
  { keys: ['拿铁'], cal: 150, pro: 8, fat: 6, carb: 15, fiber: 0, sugar: 14, sodium: 80, calcium: 200, vitA: 60 },
  { keys: ['苹果'], cal: 95, pro: 0.5, fat: 0.3, carb: 25, fiber: 4, sugar: 19, sodium: 2, calcium: 11, vitA: 5 },
  { keys: ['香蕉'], cal: 105, pro: 1.3, fat: 0.4, carb: 27, fiber: 3, sugar: 14, sodium: 1, calcium: 6, vitA: 3 },
  { keys: ['橙子'], cal: 70, pro: 1.2, fat: 0.3, carb: 17, fiber: 3, sugar: 13, sodium: 1, calcium: 40, vitA: 30 },
  { keys: ['葡萄'], cal: 70, pro: 0.7, fat: 0.3, carb: 17, fiber: 0.9, sugar: 15, sodium: 2, calcium: 10, vitA: 3 },
  { keys: ['西瓜'], cal: 90, pro: 1.5, fat: 0.4, carb: 22, fiber: 0.6, sugar: 18, sodium: 2, calcium: 10, vitA: 30 },
  { keys: ['草莓'], cal: 40, pro: 0.8, fat: 0.3, carb: 9, fiber: 2, sugar: 6, sodium: 2, calcium: 16, vitA: 5 },
  { keys: ['巧克力'], cal: 280, pro: 4, fat: 17, carb: 30, fiber: 2, sugar: 26, sodium: 15, calcium: 50, vitA: 10 },
  { keys: ['薯片'], cal: 320, pro: 4, fat: 18, carb: 36, fiber: 2, sugar: 1, sodium: 400, calcium: 20, vitA: 0 },
  { keys: ['饼干'], cal: 200, pro: 3, fat: 8, carb: 30, fiber: 1, sugar: 12, sodium: 200, calcium: 20, vitA: 0 },
  { keys: ['坚果', '核桃', '杏仁'], cal: 180, pro: 6, fat: 16, carb: 6, fiber: 3, sugar: 1, sodium: 1, calcium: 30, vitA: 0 },
  { keys: ['冰淇淋', '雪糕'], cal: 250, pro: 4, fat: 14, carb: 28, fiber: 0.5, sugar: 24, sodium: 60, calcium: 100, vitA: 100 },
  { keys: ['野人先生冰淇淋', '野人先生'], cal: 280, pro: 5, fat: 16, carb: 30, fiber: 0.5, sugar: 26, sodium: 70, calcium: 110, vitA: 100 },
  { keys: ['仟吉蛋糕', '仟吉'], cal: 350, pro: 6, fat: 18, carb: 44, fiber: 1, sugar: 30, sodium: 220, calcium: 60, vitA: 80 },
  { keys: ['小蛋糕'], cal: 280, pro: 5, fat: 14, carb: 36, fiber: 1, sugar: 24, sodium: 180, calcium: 50, vitA: 60 },
  { keys: ['耙耙柑', '粑粑柑', '丑橘'], cal: 50, pro: 0.8, fat: 0.2, carb: 12, fiber: 1.5, sugar: 10, sodium: 1, calcium: 35, vitA: 50 },
  { keys: ['蓝莓'], cal: 57, pro: 0.7, fat: 0.3, carb: 14, fiber: 2.4, sugar: 10, sodium: 1, calcium: 6, vitA: 4 },
  // === 情侣专属（趣味菜品，0 热量但满满爱意）===
  { keys: ['师兄的亲亲', '亲亲'], cal: 0, pro: 0, fat: 0, carb: 0, fiber: 0, sugar: 99, sodium: 0, calcium: 0, vitA: 999 },
  { keys: ['老婆的亲亲'], cal: 0, pro: 0, fat: 0, carb: 0, fiber: 0, sugar: 99, sodium: 0, calcium: 0, vitA: 999 },
  { keys: ['饼干', '曲奇'], cal: 220, pro: 3, fat: 9, carb: 32, fiber: 1, sugar: 14, sodium: 200, calcium: 20, vitA: 30 }
]

// 默认营养（匹配不到时按 200 大卡中等估算）
const DEFAULT_NUTRI = { cal: 200, pro: 8, fat: 8, carb: 22, fiber: 1.5, sugar: 3, sodium: 300, calcium: 30, vitA: 20 }

// 把内部短字段转为标准字段名
const pack = (d) => ({
  calories: d.cal, protein: d.pro, fat: d.fat, carb: d.carb,
  fiber: d.fiber, sugar: d.sugar, sodium: d.sodium, calcium: d.calcium, vitA: d.vitA
})

/**
 * 根据菜名智能匹配营养信息
 * @param {string} name 菜品名
 * @return {object} 营养对象 + matched(是否命中)
 */
function matchNutrition(name) {
  if (!name) return { ...pack(DEFAULT_NUTRI), matched: false }
  const n = name.trim()
  // 1. 精确匹配
  for (const item of NUTRI_DB) {
    if (item.keys.some(k => n === k)) return { ...pack(item), matched: true }
  }
  // 2. 包含匹配（菜名包含关键词，或关键词包含菜名）
  for (const item of NUTRI_DB) {
    if (item.keys.some(k => n.includes(k) || k.includes(n))) return { ...pack(item), matched: true }
  }
  // 3. 拆词匹配（按 2 字滑窗找食材）
  for (let i = 0; i < n.length - 1; i++) {
    const seg = n.substr(i, 2)
    for (const item of NUTRI_DB) {
      if (item.keys.some(k => k === seg || k.includes(seg))) {
        return { ...pack(item), matched: true }
      }
    }
  }
  // 4. 兜底
  return { ...pack(DEFAULT_NUTRI), matched: false }
}

// 营养项配置（名称/单位/图标/目标/颜色）
const NUTRI_META = [
  { key: 'calories', name: '热量', unit: '大卡', icon: '🔥', target: 1800, color: 'cal' },
  { key: 'protein',  name: '蛋白质', unit: 'g', icon: '💪', target: 65, color: 'protein' },
  { key: 'fat',      name: '脂肪', unit: 'g', icon: '🥩', target: 60, color: 'fat' },
  { key: 'carb',     name: '碳水', unit: 'g', icon: '🍚', target: 250, color: 'carb' },
  { key: 'fiber',    name: '膳食纤维', unit: 'g', icon: '🥦', target: 25, color: 'fiber' },
  { key: 'sugar',    name: '糖', unit: 'g', icon: '🍬', target: 50, color: 'sugar' },
  { key: 'sodium',   name: '钠', unit: 'mg', icon: '🧂', target: 1500, color: 'sodium' },
  { key: 'calcium',  name: '钙', unit: 'mg', icon: '🦴', target: 800, color: 'calcium' },
  { key: 'vitA',     name: '维生素A', unit: 'μg', icon: '🥕', target: 700, color: 'vitA' }
]

module.exports = { matchNutrition, NUTRI_META, NUTRI_DB }
