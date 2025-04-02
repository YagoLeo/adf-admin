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
import { addLogisticsItems } from "@/lib/firebase-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { v4 as uuidv4 } from "uuid"

interface ExcelImporterProps {
  onDataImported: (data: LogisticsItem[]) => void
}

export function ExcelImporter({ onDataImported }: ExcelImporterProps) {
  const { t } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<LogisticsItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processExcelFile = async (file: File) => {
    setIsLoading(true)
    setError(null)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = read(arrayBuffer)

      // Assume the first sheet contains our data
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = utils.sheet_to_json<any>(worksheet)

      // Map Excel columns to our LogisticsItem structure based on the provided column names
      const mappedData: LogisticsItem[] = jsonData.map((row, index) => {
        // 确保所有字段都有正确的类型
        return {
          id: `temp-${uuidv4()}`,
          houseBillNumber: String(row["House Bill Number"] || ""),
          houseBillReference: String(row["House Bill Reference"] || ""),
          shipperName: String(row["Shipper Name"] || ""),
          shipperAddress1: String(row["Shipper Address 1"] || ""),
          shipperAddress2: String(row["Shipper Address 2"] || ""),
          shipperCity: String(row["Shipper City"] || ""),
          shipperState: String(row["Shipper State"] || ""),
          shipperCountryCode: String(row["Shipper Country Code"] || ""),
          shipperPostcode: String(row["Shipper Postcode"] || ""),
          consigneeName: String(row["Consignee Name"] || ""),
          consigneeAddress1: String(row["Consignee Address 1"] || ""),
          consigneeAddress2: String(row["Consignee Address 2"] || ""),
          consigneeCity: String(row["Consignee City"] || ""),
          consigneePostcode: String(row["Consignee Postcode"] || ""),
          consigneeState: String(row["Consignee State"] || ""),
          consigneeCountryCode: String(row["Consignee Country Code"] || ""),
          consigneePhone: String(row["Consignee Phone"] || ""),
          deliveryInstructions: String(row["Delivery Instructions"] || ""),
          goodsDescription: String(row["Goods Description"] || ""),
          weightInKG: Number.parseFloat(row["Weight In KG"]) || 0,
          pieces: Number.parseInt(row["Pieces"]) || 0,
          packType: String(row["Pack Type"] || ""),
          goodsValue: Number.parseFloat(row["Goods Value"]) || 0,
          currency: String(row["Currency"] || ""),
          cbm: Number.parseFloat(row["CBM"]) || 0,
          sacYN: String(row["SAC Y/N"] || ""),
          merchantARNABN: String(row["Merchant ARN/ABN"] || ""),
          purchaserABN: String(row["Purchaser ABN"] || ""),
          containerNumber: String(row["Container Number"] || ""),
        }
      })

      setPreviewData(mappedData)
      setFileName(file.name)
    } catch (error) {
      console.error(t("errorProcessingExcelFile"), error)
      setError(t("errorProcessingExcelFileCheckFormat"))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      setError(t("pleaseUploadExcelFile"))
      return
    }

    processExcelFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const file = e.dataTransfer.files?.[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    if (fileExtension !== "xlsx" && fileExtension !== "xls") {
      setError(t("pleaseUploadExcelFile"))
      return
    }

    processExcelFile(file)
  }

  const handleSubmitToFirebase = async () => {
    if (previewData.length === 0) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 准备数据，移除临时ID
      const dataForFirebase = previewData.map(({ id, ...rest }) => rest)

      // 添加到Firebase
      await addLogisticsItems(dataForFirebase)

      // 显示成功消息
      setShowSuccess(true)

      // 通知父组件
      onDataImported(previewData)

      // 3秒后隐藏成功消息
      setTimeout(() => {
        setShowSuccess(false)
        // 清除预览数据
        setPreviewData([])
        setFileName(null)
      }, 3000)
    } catch (error) {
      console.error("Error submitting data to Firebase:", error)
      setError(t("errorSubmittingToFirebase"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelPreview = () => {
    setPreviewData([])
    setFileName(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <AlertTitle className="text-green-800">成功</AlertTitle>
          <AlertDescription className="text-green-700">数据已成功导入到数据库</AlertDescription>
        </Alert>
      )}

      {previewData.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              {t("previewData")} - {fileName} ({previewData.length} {t("records")})
            </h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelPreview} className="flex items-center gap-1">
                <X className="h-4 w-4" />
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitToFirebase}
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                <Upload className="h-4 w-4" />
                {isSubmitting ? t("submitting") : t("submitToDatabase")}
              </Button>
            </div>
          </div>

          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("houseBillNumber")}</TableHead>
                    <TableHead>{t("consigneeName")}</TableHead>
                    <TableHead>{t("consigneeCity")}</TableHead>
                    <TableHead>{t("consigneeCountryCode")}</TableHead>
                    <TableHead>{t("goodsDescription")}</TableHead>
                    <TableHead>{t("weightInKG")}</TableHead>
                    <TableHead>{t("pieces")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 100).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.houseBillNumber}</TableCell>
                      <TableCell>{item.consigneeName}</TableCell>
                      <TableCell>{item.consigneeCity}</TableCell>
                      <TableCell>{item.consigneeCountryCode}</TableCell>
                      <TableCell>{item.goodsDescription}</TableCell>
                      <TableCell>{item.weightInKG}</TableCell>
                      <TableCell>{item.pieces}</TableCell>
                    </TableRow>
                  ))}
                  {previewData.length > 100 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        {t("showingFirstRecords", { count: 100, total: previewData.length })}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <Card
          className="border-dashed border-2 p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Input
            type="file"
            id="excel-file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <FileSpreadsheetIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{t("dragAndDropExcelFile")}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t("or")}</p>
              <Button variant="outline" className="mt-2" onClick={() => document.getElementById("excel-file")?.click()}>
                {t("browseFiles")}
              </Button>
            </div>
            {fileName && <p className="text-sm font-medium text-primary mt-2">{fileName}</p>}
          </div>
        </Card>
      )}

      {isLoading && (
        <div className="flex justify-center">
          <p className="text-sm text-muted-foreground">{t("processingExcelFile")}</p>
        </div>
      )}

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2">{t("excelTemplateFormat")}</h3>
        <p className="text-sm text-muted-foreground mb-2">{t("excelTemplateShouldContain")}</p>
        <div className="text-xs text-muted-foreground overflow-x-auto">
          <code>
            House Bill Number, House Bill Reference, Shipper Name, Shipper Address 1, Shipper Address 2, Shipper City,
            Shipper State, Shipper Country Code, Shipper Postcode, Consignee Name, Consignee Address 1, Consignee
            Address 2, Consignee City, Consignee Postcode, Consignee State, Consignee Country Code, Consignee Phone,
            Delivery Instructions, Goods Description, Weight In KG, Pieces, Pack Type, Goods Value, Currency, CBM, SAC
            Y/N, Merchant ARN/ABN, Purchaser ABN, Container Number
          </code>
        </div>
      </div>
    </div>
  )
}

