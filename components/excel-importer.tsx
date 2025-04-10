"use client"

import type React from "react"
import { useState } from "react"
import { FileSpreadsheetIcon, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { read, utils } from "xlsx"
import type { LogisticsItem } from "@/types/logistics"
import { useLanguage } from "@/components/language-provider"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { addLogisticsItems } from '@/lib/logistics-service';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { v4 as uuidv4 } from "uuid"

interface ExcelImporterProps {
  onDataImported: (data: LogisticsItem[]) => void
}

export function ExcelImporter({ onDataImported }: ExcelImporterProps) {
  const { t } = useLanguage()
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<LogisticsItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null);

  const processExcelFile = async (file: File) => {
    setIsProcessing(true);
    setError(null)
    setSuccess(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = utils.sheet_to_json(worksheet);

      // Map Excel columns to our LogisticsItem structure based on the provided column names
      const mappedData: LogisticsItem[] = jsonData.map((row, index) => {
        // 确保所有字段都有正确的类型
        return {
          id: `temp-${uuidv4()}`,
          houseBillNumber: String(row['House Bill Number'] || ''),
          houseBillReference: String(row['House Bill Reference'] || ''),
          shipperName: String(row['Shipper Name'] || ''),
          shipperAddress1: String(row['Shipper Address 1'] || ''),
          shipperAddress2: String(row['Shipper Address 2'] || ''),
          shipperCity: String(row['Shipper City'] || ''),
          shipperState: String(row['Shipper State'] || ''),
          shipperCountryCode: String(row['Shipper Country Code'] || ''),
          shipperPostcode: String(row['Shipper Postcode'] || ''),
          consigneeName: String(row['Consignee Name'] || ''),
          consigneeAddress1: String(row['Consignee Address 1'] || ''),
          consigneeAddress2: String(row['Consignee Address 2'] || ''),
          consigneeCity: String(row['Consignee City'] || ''),
          consigneePostcode: String(row['Consignee Postcode'] || ''),
          consigneeState: String(row['Consignee State'] || ''),
          consigneeCountryCode: String(row['Consignee Country Code'] || ''),
          consigneePhone: String(row['Consignee Phone'] || ''),
          deliveryInstructions: String(row['Delivery Instructions'] || ''),
          goodsDescription: String(row['Goods Description'] || ''),
          weightInKG: Number.parseFloat(row['Weight In KG']) || 0,
          pieces: Number.parseInt(row['Pieces']) || 0,
          packType: String(row['Pack Type'] || ''),
          goodsValue: Number.parseFloat(row['Goods Value']) || 0,
          currency: String(row['Currency'] || ''),
          cbm: Number.parseFloat(row['CBM']) || 0,
          sacYN: String(row['SAC Y/N'] || ''),
          merchantARNABN: String(row['Merchant ARN/ABN'] || ''),
          purchaserABN: String(row['Purchaser ABN'] || ''),
          containerNumber: String(row['Container Number'] || ''),
        };
      })

      setPreviewData(mappedData)
      setSuccess(t('previewData'));
    } catch (error) {
      console.error('Error processing Excel file:', error);
      setError(t('errorProcessingExcelFile'));
    } finally {
      setIsProcessing(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processExcelFile(selectedFile);
    }
  }

  const handleSubmit = async () => {
    if (previewData.length === 0) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // 移除临时ID
      const itemsToSubmit = previewData.map(({ id, ...rest }) => rest);
      await addLogisticsItems(itemsToSubmit);
      setSuccess(t('submitToDatabase'));
      onDataImported(previewData);
      setPreviewData([]);
      setFile(null);
    } catch (error) {
      console.error('Error submitting data:', error);
      setError(t('errorSubmittingToFirebase'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FileSpreadsheetIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{t('dragAndDropExcelFile')}</span>{' '}
              {t('or')}
            </p>
            <p className="text-xs text-gray-500">{t('browseFiles')}</p>
          </div>
          <Input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertTitle>{t('success')}</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 && (
        <Card>
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">{t('previewData')}</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('houseBillNumber')}</TableHead>
                    <TableHead>{t('consigneeName')}</TableHead>
                    <TableHead>{t('consigneeCity')}</TableHead>
                    <TableHead>{t('consigneeCountryCode')}</TableHead>
                    <TableHead>{t('weightInKG')}</TableHead>
                    <TableHead>{t('pieces')}</TableHead>
                    <TableHead>{t('containerNumber')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 5).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.houseBillNumber}</TableCell>
                      <TableCell>{item.consigneeName}</TableCell>
                      <TableCell>{item.consigneeCity}</TableCell>
                      <TableCell>{item.consigneeCountryCode}</TableCell>
                      <TableCell>{item.weightInKG}</TableCell>
                      <TableCell>{item.pieces}</TableCell>
                      <TableCell>{item.containerNumber}</TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        {t('showingFirstRecords', {
                          count: 5,
                          total: previewData.length,
                        })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPreviewData([]);
                  setFile(null);
                }}
              >
                <X className="w-4 h-4 mr-2" />
                {t('cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                <Upload className="w-4 h-4 mr-2" />
                {isSubmitting ? t('submitting') : t('submitToDatabase')}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

