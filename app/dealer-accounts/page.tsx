'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from '@/lib/supabase'
import { Trash2, Plus } from 'lucide-react'
import { LanguageProvider } from "@/components/language-provider"

// 创建一个内部组件，使用 useLanguage
function DealerAccountsContent() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'admin') {
      router.push('/')
      return
    }

    fetchAccounts()
  }, [router])

  const fetchAccounts = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('dealer_accounts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching dealer accounts:', error)
      setError('无法加载经销商账号数据')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAccount = async () => {
    if (!newUsername || !newPassword) {
      setError('用户名和密码不能为空')
      return
    }

    try {
      const { error } = await supabase
        .from('dealer_accounts')
        .insert([{ username: newUsername, password: newPassword }])

      if (error) throw error

      setNewUsername('')
      setNewPassword('')
      setIsDialogOpen(false)
      fetchAccounts()
    } catch (error) {
      console.error('Error adding dealer account:', error)
      setError('添加经销商账号失败')
    }
  }

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('确定要删除这个经销商账号吗？')) return

    try {
      const { error } = await supabase
        .from('dealer_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting dealer account:', error)
      setError('删除经销商账号失败')
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">经销商账号管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              添加经销商账号
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加经销商账号</DialogTitle>
              <DialogDescription>
                请输入经销商的用户名和密码
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">用户名</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={handleAddAccount}>
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-4">加载中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4">
                      暂无经销商账号
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>{account.username}</TableCell>
                      <TableCell>
                        {new Date(account.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// 主组件，提供 LanguageProvider
export default function DealerAccountsPage() {
  return (
    <LanguageProvider>
      <DealerAccountsContent />
    </LanguageProvider>
  )
} 