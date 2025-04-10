import { createClient } from '@supabase/supabase-js'

// 检查环境变量是否存在
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('缺少环境变量: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 创建 Supabase 客户端
export const supabase = createClient("https://oazbrtitvaavcdmwzrlg.supabase.co", supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
})

// 测试连接
supabase
  .from('logistics_items')
  .select('count')
  .then(({ error }) => {
    if (error) {
      console.error('Supabase 连接错误:', error.message)
    } else {
      console.log('Supabase 连接成功')
    }
  })
  .catch((error) => {
    console.error('Supabase 初始化错误:', error.message)
  }) 