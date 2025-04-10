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
} from 'lucide-react';
import { getAllLogisticsItems } from '@/lib/logistics-service';
import { AddLogisticsItemDialog } from '@/components/add-logistics-item-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function LogisticsLedger() {
  const { t } = useLanguage();
  const [logisticsData, setLogisticsData] = useState<LogisticsItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<LogisticsItem[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('logisticsLedgerTitle')}</h1>
        <div className="flex items-center gap-4">
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
          <TabsTrigger value="import">{t('importData')}</TabsTrigger>
        </TabsList>

        <TabsContent value="ledger">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('addNew')}
                  </Button>
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
              />
            </CardContent>
          </Card>
        </TabsContent>

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
      </Tabs>

      <AddLogisticsItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onItemAdded={handleItemAdded}
      />
    </div>
  );
}

