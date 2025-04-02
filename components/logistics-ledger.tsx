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
import { FileSpreadsheetIcon, Printer, Upload, RefreshCw } from "lucide-react"
import { getAllLogisticsItems } from "@/lib/firebase-service"
import { AddLogisticsItemDialog } from "@/components/add-logistics-item-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useFirebase } from "@/components/firebase-provider"

export function LogisticsLedger() {
  const { t } = useLanguage()
  const { isInitialized, isError, errorMessage } = useFirebase()
  const [logisticsData, setLogisticsData] = useState<LogisticsItem[]>([])
  const [selectedItems, setSelectedItems] = useState<LogisticsItem[]>([])
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // 从Firebase加载数据
  useEffect(() => {
    // 如果Firebase未初始化，不执行数据获取
    if (!isInitialized) {
      if (isError) {
        setError(errorMessage || "Firebase initialization failed")
      }
      setIsLoading(false)
      return
    }

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const items = await getAllLogisticsItems()
        setLogisticsData(items)
      } catch (error) {
        console.error("Error fetching logistics data:", error)
        setError("无法加载数据，请检查网络连接或刷新页面重试")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [refreshTrigger, isInitialized, isError, errorMessage])

  const handleDataImport = (data: LogisticsItem[]) => {
    // 刷新数据
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleSelectionChange = (items: LogisticsItem[]) => {
    setSelectedItems(items)
  }

  const handleGeneratePDF = async () => {
    if (selectedItems.length === 0) {
      alert(t("pleaseSelectAtLeastOneRecord"))
      return
    }

    setIsGeneratingPDF(true)
    try {
      await generatePDF(selectedItems, t)
    } catch (error) {
      console.error(t("errorGeneratingPDF"), error)
      alert(t("errorGeneratingPDFTryAgain"))
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleItemAdded = (item: LogisticsItem) => {
    // 刷新数据
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleRefreshData = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // 显示Firebase初始化错误
  if (isError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Firebase 初始化错误</AlertTitle>
          <AlertDescription>{errorMessage || "无法连接到Firebase数据库。请检查您的配置和网络连接。"}</AlertDescription>
        </Alert>
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">无法加载物流台账</h2>
            <p className="mb-4">由于Firebase连接问题，系统无法加载物流数据。请尝试以下解决方案：</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>检查您的网络连接</li>
              <li>确认Firebase项目配置正确</li>
              <li>确认所有环境变量已正确设置</li>
              <li>刷新页面重试</li>
            </ol>
            <Button onClick={() => window.location.reload()} className="mt-6">
              刷新页面
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 添加错误提示 */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 其余JSX保持不变... */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          {t("logisticsLedgerTitle")}
        </h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleRefreshData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            {t("refreshData")}
          </Button>
          <LanguageSwitcher />
        </div>
      </div>

      <Tabs defaultValue="ledger" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="ledger" className="flex items-center gap-2">
            <FileSpreadsheetIcon className="h-4 w-4" />
            {t("ledger")}
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            {t("importData")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold">{t("logisticsLedgerData")}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {t("selected")} {selectedItems.length} / {logisticsData.length} {t("records")}
                  </span>
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={selectedItems.length === 0 || isGeneratingPDF}
                    className="flex items-center gap-2"
                  >
                    <Printer className="h-4 w-4" />
                    {isGeneratingPDF ? t("generating") : t("generateLogisticsPDF")}
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">{t("loadingData")}</p>
                </div>
              ) : (
                <LogisticsTable
                  data={logisticsData}
                  onSelectionChange={handleSelectionChange}
                  onAddClick={() => setIsAddDialogOpen(true)}
                  onDataChange={handleRefreshData}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">{t("importLogisticsData")}</h2>
                <ExcelImporter onDataImported={handleDataImport} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddLogisticsItemDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onItemAdded={handleItemAdded} />
    </div>
  )
}

