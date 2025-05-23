"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExcelImporter } from "@/components/excel-importer"
import { LogisticsTable } from "@/components/logistics-table"
import { generatePDF } from "@/lib/pdf-generator"
import type { LogisticsItem } from "@/types/logistics"
import { useLanguage } from "@/components/language-provider"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileSpreadsheetIcon,
  Printer,
  Upload,
  RefreshCw,
  Plus,
  Search,
} from 'lucide-react';
import { getAllLogisticsItems, updateLogisticsStatusByPrefix } from '@/lib/logistics-service';
import { AddLogisticsItemDialog } from '@/components/add-logistics-item-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from '@/lib/supabase'

export function LogisticsLedger() {
  const { t } = useLanguage();
  const router = useRouter();
  const [logisticsData, setLogisticsData] = useState<LogisticsItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<LogisticsItem[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [prefix, setPrefix] = useState('');
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('pending');
  const [updateError, setUpdateError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [affectedCount, setAffectedCount] = useState(0);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  // 从数据库加载数据
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await getAllLogisticsItems();
        setLogisticsData(items);
      } catch (error) {
        console.error('Error fetching logistics data:', error);
        setError('无法加载数据，请检查网络连接或刷新页面重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshTrigger]);

  const handleDataImport = (data: LogisticsItem[]) => {
    // 刷新数据
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectionChange = (items: LogisticsItem[]) => {
    setSelectedItems(items);
  };

  const handleGeneratePDF = async () => {
    if (selectedItems.length === 0) {
      alert(t('pleaseSelectAtLeastOneRecord'));
      return;
    }

    setIsGeneratingPDF(true);
    try {
      await generatePDF(selectedItems, t);
    } catch (error) {
      console.error(t('errorGeneratingPDF'), error);
      alert(t('errorGeneratingPDFTryAgain'));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleItemAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const isAdmin = userRole === 'admin';

  const handleUpdateStatus = async () => {
    if (!prefix) {
      setUpdateError('请输入物流单号前缀');
      return;
    }

    setIsUpdating(true);
    setUpdateError('');

    try {
      // 更新状态
      const count = await updateLogisticsStatusByPrefix(prefix, newStatus);
      
      if (count === 0) {
        setUpdateError(`没有找到匹配前缀 "${prefix}" 的物流单`);
        setIsUpdating(false);
        return;
      }

      // 刷新数据
      setRefreshTrigger((prev) => prev + 1);
      setIsUpdateDialogOpen(false);
      setPrefix('');
    } catch (error) {
      console.error('Error updating logistics status:', error);
      setUpdateError('更新物流状态失败，请稍后再试');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{t('logisticsLedgerTitle')}</h1>
          <div className="text-sm text-muted-foreground mt-1">
            当前登录: {userRole === 'admin' ? 'admin001' : localStorage.getItem('dealerUsername') || '经销商'} 
            ({userRole === 'admin' ? '管理员' : '经销商'})
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            {t('refreshData')}
          </Button>
          {isAdmin && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dealer-accounts')}
              >
                经销商账号管理
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('userRole')
              localStorage.removeItem('dealerUsername')
              window.location.href = '/login'
            }}
          >
            退出登录
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ledger" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ledger">{t('ledger')}</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="import">{t('importData')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="ledger">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      <Button onClick={() => setIsAddDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('addNew')}
                      </Button>
                      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            批量更新状态
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>批量更新物流状态</DialogTitle>
                            <DialogDescription>
                              输入物流单号前缀，将更新所有匹配的物流单状态
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="prefix">物流单号前缀</Label>
                              <Input
                                id="prefix"
                                placeholder="例如: ABC123"
                                value={prefix}
                                onChange={(e) => setPrefix(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="status">新状态</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue placeholder="选择状态" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">待处理</SelectItem>
                                  <SelectItem value="in_transit">运输中</SelectItem>
                                  <SelectItem value="delivered">已送达</SelectItem>
                                  <SelectItem value="cancelled">已取消</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {updateError && (
                              <div className="text-red-500 text-sm">{updateError}</div>
                            )}
                            {affectedCount > 0 && (
                              <div className="text-green-500 text-sm">
                                将更新 {affectedCount} 条物流单的状态
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                              取消
                            </Button>
                            <Button onClick={handleUpdateStatus} disabled={isUpdating}>
                              {isUpdating ? '更新中...' : '更新'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleGeneratePDF}
                    disabled={selectedItems.length === 0 || isGeneratingPDF}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    {isGeneratingPDF
                      ? t('generating')
                      : t('generateLogisticsPDF')}
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedItems.length > 0 &&
                    `${selectedItems.length} ${t('selected')} ${t('records')}`}
                </div>
              </div>

              <LogisticsTable
                data={logisticsData}
                onSelectionChange={handleSelectionChange}
                onAddClick={() => setIsAddDialogOpen(true)}
                onDataChange={() => setRefreshTrigger((prev) => prev + 1)}
                isAdmin={isAdmin}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="import">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {t('importLogisticsData')}
                  </h2>
                  <ExcelImporter onDataImported={handleDataImport} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {isAdmin && (
        <AddLogisticsItemDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onItemAdded={handleItemAdded}
        />
      )}
    </div>
  );
}

