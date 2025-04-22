'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole) {
      router.push('/')
    }
  }, [router])

  const handleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // 检查是否是管理员账号
      if (username === 'admin001' && password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        localStorage.setItem('userRole', 'admin')
        router.push('/')
        return
      }

      // 检查是否是经销商账号
      const { data, error } = await supabase
        .from('dealer_accounts')
        .select('*')
        .eq('username', username)
        .eq('password', password)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到匹配的账号
          setError('用户名或密码错误')
        } else {
          console.error('Error checking dealer account:', error)
          setError('登录过程中发生错误，请稍后再试')
        }
        return
      }

      if (data) {
        // 找到匹配的经销商账号
        localStorage.setItem('userRole', 'dealer')
        localStorage.setItem('dealerId', data.id)
        localStorage.setItem('dealerUsername', data.username)
        router.push('/')
      } else {
        setError('用户名或密码错误')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('登录过程中发生错误，请稍后再试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>登录</CardTitle>
          <CardDescription>请输入您的账号和密码</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 